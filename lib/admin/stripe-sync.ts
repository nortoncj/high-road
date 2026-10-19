import "server-only";
import Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import { tables, type PlanKind } from "./schema";

/*
 * Stripe → Supabase. Stripe stays the source of truth for money; this keeps a copy in
 * client_subscriptions and invoices so the dashboard loads fast and stays behind RLS.
 *
 * Two ways in:
 *   - the webhook (app/api/stripe/webhook) calls handleStripeEvent on every change
 *   - "Sync now" / "Sync Stripe" buttons call syncCustomer / syncAll, for backfill or a missed webhook
 *
 * Every subscription event re-fetches the subscription from Stripe instead of trusting the event
 * body. Webhooks can arrive out of order; the fresh copy is always right.
 */

let client: Stripe | null = null;

export function stripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set.");
  return (client ??= new Stripe(key));
}

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function stripeDashboardUrl(path: string): string {
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  const test = key.startsWith("sk_test") || key.startsWith("rk_test");
  return `https://dashboard.stripe.com/${test ? "test/" : ""}${path}`;
}

type Db = SupabaseClient;

const S = tables.subscriptions;
const C = tables.clients;
const I = tables.invoices;

/* Shapes, loosely typed on purpose: Stripe moved some fields between API versions
   (current_period_end went from the subscription to its items in 2025), so we read both. */

type ProductLike = { id?: string; name?: string; deleted?: boolean; metadata?: Record<string, string> } | string | null;
type PriceLike = {
  unit_amount: number | null;
  nickname: string | null;
  recurring: { interval: "day" | "week" | "month" | "year"; interval_count: number } | null;
  product: ProductLike;
};
type ItemLike = { quantity?: number | null; price: PriceLike; current_period_end?: number | null };
type ScheduleLike = { end_behavior?: string; phases?: { end_date?: number | null }[] } | string | null;
type SubLike = {
  id: string;
  status: string;
  customer: string | { id: string };
  items: { data: ItemLike[] };
  current_period_end?: number | null;
  cancel_at_period_end: boolean;
  cancel_at: number | null;
  canceled_at: number | null;
  start_date: number;
  schedule?: ScheduleLike;
};

const PER_MONTH: Record<string, number> = { day: 365 / 12, week: 52 / 12, month: 1, year: 1 / 12 };

const iso = (unix: number | null | undefined) => (unix ? new Date(unix * 1000).toISOString() : null);
const customerId = (c: string | { id: string }) => (typeof c === "string" ? c : c.id);

/**
 * Care plan or 12 month payment plan? Set metadata `kind` = care | build on each Stripe product
 * and this is exact. Without it, it guesses from the name. Word boundaries matter here:
 * "Grow" (package) must not match "Growth" (care plan).
 */
function kindOf(product: ProductLike, name: string): PlanKind {
  const meta = typeof product === "object" && product ? product.metadata?.kind : undefined;
  if (meta === "care" || meta === "build") return meta;
  if (/\b(care|hosted|handled|growth)\b/i.test(name)) return "care";
  if (/\b(launch|grow|run|pay monthly|payment plan)\b/i.test(name)) return "build";
  return "other";
}

function scheduleEnd(schedule: ScheduleLike | undefined): number | null {
  if (!schedule || typeof schedule === "string" || schedule.end_behavior !== "cancel") return null;
  const last = schedule.phases?.[schedule.phases.length - 1];
  return last?.end_date ?? null;
}

export function subscriptionRow(sub: SubLike, clientId: string | null) {
  let amount = 0;
  let monthly = 0;
  let interval: string | null = null;
  const names: string[] = [];
  const kinds: PlanKind[] = [];
  let periodEnd = sub.current_period_end ?? null;

  for (const item of sub.items.data) {
    const qty = item.quantity ?? 1;
    const unit = item.price.unit_amount ?? 0;
    const rec = item.price.recurring;
    amount += unit * qty;
    if (rec) {
      monthly += (unit * qty * (PER_MONTH[rec.interval] ?? 0)) / (rec.interval_count || 1);
      interval ??= rec.interval_count > 1 ? `${rec.interval_count} ${rec.interval}s` : rec.interval;
    }
    const product = item.price.product;
    const name =
      typeof product === "object" && product && !product.deleted && product.name
        ? product.name
        : (item.price.nickname ?? "Plan");
    names.push(name);
    kinds.push(kindOf(product, name));
    if (item.current_period_end && (!periodEnd || item.current_period_end < periodEnd)) periodEnd = item.current_period_end;
  }

  return {
    [S.columns.id]: sub.id,
    [S.columns.clientId]: clientId,
    [S.columns.stripeCustomerId]: customerId(sub.customer),
    [S.columns.status]: sub.status,
    [S.columns.planName]: names.join(" + ") || "Plan",
    [S.columns.kind]: kinds.includes("build") ? "build" : kinds.includes("care") ? "care" : "other",
    [S.columns.amountCents]: amount,
    // Discounts aren't applied here. Coupon a client? Their monthly value reads high until you fix the price.
    [S.columns.monthlyCents]: Math.round(monthly),
    [S.columns.interval]: interval,
    [S.columns.currentPeriodEnd]: iso(periodEnd),
    [S.columns.cancelAtPeriodEnd]: sub.cancel_at_period_end,
    [S.columns.endsAt]: iso(sub.cancel_at ?? scheduleEnd(sub.schedule)),
    [S.columns.startedAt]: iso(sub.start_date),
    [S.columns.canceledAt]: iso(sub.canceled_at),
    synced_at: new Date().toISOString(),
  };
}

type InvoiceLike = {
  id: string;
  customer: string | { id: string } | null;
  status: string | null;
  amount_paid: number;
  number: string | null;
  created: number;
  hosted_invoice_url?: string | null;
  status_transitions: { paid_at: number | null };
  lines: { data: { description: string | null }[] };
};

function invoiceRow(inv: InvoiceLike, clientId: string | null) {
  return {
    [I.columns.stripeInvoiceId]: inv.id,
    [I.columns.clientId]: clientId,
    [I.columns.amountCents]: inv.amount_paid,
    [I.columns.status]: "paid",
    [I.columns.paidAt]: iso(inv.status_transitions.paid_at) ?? iso(inv.created),
    [I.columns.issuedAt]: iso(inv.created)?.slice(0, 10) ?? null,
    [I.columns.number]: inv.number,
    [I.columns.description]: inv.lines.data[0]?.description ?? null,
    [I.columns.hostedUrl]: inv.hosted_invoice_url ?? null,
  };
}

/**
 * Which client owns this Stripe customer? Linked id first. If nobody's linked yet, match on the
 * customer's email and link it, so a client you added by hand connects itself the first time
 * Stripe bills them.
 */
async function clientFor(db: Db, stripeCustomer: string): Promise<string | null> {
  const { data } = await db.from(C.table).select(C.columns.id).eq(C.columns.stripeCustomerId, stripeCustomer).maybeSingle();
  if (data) return String((data as Record<string, unknown>)[C.columns.id]);

  const customer = await stripe().customers.retrieve(stripeCustomer);
  const email = "deleted" in customer && customer.deleted ? null : customer.email?.toLowerCase();
  if (!email) return null;

  const { data: match } = await db
    .from(C.table)
    .select(C.columns.id)
    .eq(C.columns.email, email)
    .is(C.columns.stripeCustomerId, null)
    .limit(1)
    .maybeSingle();
  if (!match) return null;

  const id = String((match as Record<string, unknown>)[C.columns.id]);
  await db.from(C.table).update({ [C.columns.stripeCustomerId]: stripeCustomer }).eq(C.columns.id, id);
  return id;
}

async function upsertOrThrow(db: Db, table: string, rows: Record<string, unknown>[], onConflict: string) {
  if (rows.length === 0) return;
  const { error } = await db.from(table).upsert(rows, { onConflict });
  if (error) throw new Error(`${table}: ${error.message}`);
}

/**
 * Fills in product names. Not done with `expand`: on list calls the path
 * (data.items.data.price.product) blows past Stripe's 4 level expand limit.
 */
async function withProducts(subs: SubLike[]): Promise<SubLike[]> {
  const ids = new Set<string>();
  for (const sub of subs) for (const item of sub.items.data) if (typeof item.price.product === "string") ids.add(item.price.product);
  const products = new Map<string, ProductLike>();
  await Promise.all(
    [...ids].map(async (id) => {
      try {
        products.set(id, (await stripe().products.retrieve(id)) as unknown as ProductLike);
      } catch {
        // Deleted product: falls back to the price nickname.
      }
    }),
  );
  for (const sub of subs)
    for (const item of sub.items.data)
      if (typeof item.price.product === "string") item.price.product = products.get(item.price.product) ?? item.price.product;
  return subs;
}

export async function syncSubscription(db: Db, subscriptionId: string) {
  const fetched = (await stripe().subscriptions.retrieve(subscriptionId, { expand: ["schedule"] })) as unknown as SubLike;
  const [sub] = await withProducts([fetched]);
  const clientId = await clientFor(db, customerId(sub.customer));
  await upsertOrThrow(db, S.table, [subscriptionRow(sub, clientId)], S.columns.id);
}

export async function upsertInvoice(db: Db, invoice: InvoiceLike) {
  if (invoice.status !== "paid" || !invoice.customer) return;
  const clientId = await clientFor(db, customerId(invoice.customer));
  await upsertOrThrow(db, I.table, [invoiceRow(invoice, clientId)], I.columns.stripeInvoiceId);
}

/** Pull everything for one customer: all subscriptions and the last two years of paid invoices. */
export async function syncCustomer(db: Db, clientId: string, stripeCustomer: string) {
  const subs = await stripe().subscriptions.list({
    customer: stripeCustomer,
    status: "all",
    limit: 100,
    expand: ["data.schedule"],
  });
  const full = await withProducts(subs.data as unknown as SubLike[]);
  await upsertOrThrow(
    db,
    S.table,
    full.map((s) => subscriptionRow(s, clientId)),
    S.columns.id,
  );
  // Anything the webhook stored before this client was linked gets claimed now.
  await db.from(S.table).update({ [S.columns.clientId]: clientId }).eq(S.columns.stripeCustomerId, stripeCustomer);

  const invoices = await stripe().invoices.list({ customer: stripeCustomer, status: "paid", limit: 24 });
  await upsertOrThrow(
    db,
    I.table,
    (invoices.data as unknown as InvoiceLike[]).map((inv) => invoiceRow(inv, clientId)),
    I.columns.stripeInvoiceId,
  );

  return { subscriptions: subs.data.length, invoices: invoices.data.length };
}

/** Find a Stripe customer by id (cus_...) or email. */
export async function findCustomer(value: string): Promise<{ id: string } | { error: string }> {
  const v = value.trim();
  if (v.startsWith("cus_")) {
    try {
      const c = await stripe().customers.retrieve(v);
      if ("deleted" in c && c.deleted) return { error: "That Stripe customer was deleted." };
      return { id: c.id };
    } catch {
      return { error: "No Stripe customer with that id." };
    }
  }
  const list = await stripe().customers.list({ email: v.toLowerCase(), limit: 2 });
  if (list.data.length === 0) return { error: "No Stripe customer with that email." };
  if (list.data.length > 1) return { error: "Two Stripe customers share that email. Paste the cus_ id instead." };
  return { id: list.data[0].id };
}

export async function createStripeCustomer(c: { clientId: string; name: string; email?: string; phone?: string }): Promise<string> {
  const customer = await stripe().customers.create({
    name: c.name,
    email: c.email,
    phone: c.phone,
    metadata: { client_id: c.clientId, source: "wtn-admin" },
  });
  return customer.id;
}

export async function handleStripeEvent(db: Db, event: Stripe.Event) {
  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
    case "customer.subscription.paused":
    case "customer.subscription.resumed":
      await syncSubscription(db, (event.data.object as { id: string }).id);
      break;
    case "subscription_schedule.created":
    case "subscription_schedule.updated": {
      const sub = (event.data.object as { subscription?: string | { id: string } | null }).subscription;
      if (sub) await syncSubscription(db, customerId(sub));
      break;
    }
    case "invoice.paid":
      await upsertInvoice(db, event.data.object as unknown as InvoiceLike);
      break;
    default:
      break;
  }
}
