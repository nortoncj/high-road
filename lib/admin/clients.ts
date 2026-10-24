import "server-only";
import { createSupabase } from "./supabase";
import type { Issue, Loaded } from "./data";
import {
  billingSubscriptionStatuses,
  clientStatuses,
  liveSubscriptionStatuses,
  selectAs,
  tables,
  toClientStatus,
  toLeadSource,
  toProjectStatus,
  type ClientStatus,
  type LeadSource,
  type PlanKind,
  type ProjectStatus,
} from "./schema";

/*
 * Clients read model. A client's plan comes from Stripe (client_subscriptions, kept fresh by the
 * webhook) or, for anyone you bill outside Stripe, from the manual fields on the client row.
 */

type Row = Record<string, unknown>;
const C = tables.clients;
const S = tables.subscriptions;
const P = tables.projects;
const I = tables.invoices;
const L = tables.leads;

const DAY = 86_400_000;
/** How far ahead the renewals card looks, and how early a payment plan counts as "ending". */
export const RENEWAL_WINDOW_DAYS = 30;
export const ENDING_SOON_DAYS = 45;

export type ClientPlan = {
  id: string;
  name: string;
  kind: PlanKind;
  status: string;
  source: "stripe" | "manual";
  amountCents: number;
  monthlyCents: number;
  interval: string | null;
  nextChargeAt: string | null;
  cancelAtPeriodEnd: boolean;
  endsAt: string | null;
  startedAt: string | null;
  canceledAt: string | null;
};

/** What needs you, worst first. */
export type ClientHealth = "failed" | "canceling" | "ending" | "manual-due" | "ok" | "no-plan";

export type Client = {
  id: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  notes: string | null;
  status: ClientStatus;
  leadId: string | null;
  stripeCustomerId: string | null;
  onboardedOn: string | null;
  createdAt: string;
  manual: { plan: string | null; monthlyCents: number | null; renewsOn: string | null };
  /** Plans that are still on (active, past due, paused...). */
  plans: ClientPlan[];
  /** Everything, including canceled. Detail page only. */
  history: ClientPlan[];
  monthlyCents: number;
  planLabel: string | null;
  nextChargeAt: string | null;
  health: ClientHealth;
};

const str = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v.trim() : v == null ? null : String(v));
const num = (v: unknown): number => (typeof v === "number" ? v : Number(v) || 0);

function toPlan(r: Row): ClientPlan {
  return {
    id: String(r.id),
    name: str(r.planName) ?? "Plan",
    kind: (["care", "build"].includes(String(r.kind)) ? r.kind : "other") as PlanKind,
    status: String(r.status),
    source: "stripe",
    amountCents: num(r.amountCents),
    monthlyCents: num(r.monthlyCents),
    interval: str(r.interval),
    nextChargeAt: str(r.currentPeriodEnd),
    cancelAtPeriodEnd: Boolean(r.cancelAtPeriodEnd),
    endsAt: str(r.endsAt),
    startedAt: str(r.startedAt),
    canceledAt: str(r.canceledAt),
  };
}

function healthOf(plans: ClientPlan[], now: number): ClientHealth {
  if (plans.length === 0) return "no-plan";
  if (plans.some((p) => p.status === "past_due" || p.status === "unpaid")) return "failed";
  if (plans.some((p) => p.cancelAtPeriodEnd)) return "canceling";
  if (plans.some((p) => p.kind === "build" && p.endsAt && Date.parse(p.endsAt) - now < ENDING_SOON_DAYS * DAY)) return "ending";
  if (plans.some((p) => p.source === "manual" && p.nextChargeAt && Date.parse(p.nextChargeAt) - now < 7 * DAY)) return "manual-due";
  return "ok";
}

const clientSelect = `${selectAs(C.columns)}, subs:${S.table}(${selectAs(S.columns)})`;

function toClient(r: Row, now = Date.now()): Client {
  const history = ((r.subs as Row[] | null) ?? []).map(toPlan).sort((a, b) => (b.startedAt ?? "").localeCompare(a.startedAt ?? ""));
  let plans = history.filter((p) => (liveSubscriptionStatuses as readonly string[]).includes(p.status));

  const manual = {
    plan: str(r.manualPlan),
    monthlyCents: r.manualMonthlyCents == null ? null : num(r.manualMonthlyCents),
    renewsOn: str(r.manualRenewsOn),
  };
  // Billed outside Stripe: show the manual plan, but only if Stripe has nothing live.
  if (plans.length === 0 && (manual.plan || manual.monthlyCents)) {
    plans = [
      {
        id: `manual-${String(r.id)}`,
        name: manual.plan ?? "Custom plan",
        kind: "care",
        status: "active",
        source: "manual",
        amountCents: manual.monthlyCents ?? 0,
        monthlyCents: manual.monthlyCents ?? 0,
        interval: "month",
        nextChargeAt: manual.renewsOn ? `${manual.renewsOn}T12:00:00Z` : null,
        cancelAtPeriodEnd: false,
        endsAt: null,
        startedAt: null,
        canceledAt: null,
      },
    ];
  }

  const billing = plans.filter((p) => p.source === "manual" || (billingSubscriptionStatuses as readonly string[]).includes(p.status));
  const nextCharges = billing.map((p) => p.nextChargeAt).filter((d): d is string => Boolean(d)).sort();

  return {
    id: String(r.id),
    name: str(r.name) ?? "Unnamed client",
    contactName: str(r.contactName),
    email: str(r.email),
    phone: str(r.phone),
    website: str(r.website),
    notes: str(r.notes),
    status: toClientStatus(r.status),
    leadId: str(r.leadId),
    stripeCustomerId: str(r.stripeCustomerId),
    onboardedOn: str(r.onboardedOn),
    createdAt: String(r.createdAt),
    manual,
    plans,
    history,
    monthlyCents: billing.reduce((t, p) => t + p.monthlyCents, 0),
    planLabel: plans.length ? plans.map((p) => p.name).join(" + ") : null,
    nextChargeAt: nextCharges[0] ?? null,
    health: healthOf(plans, now),
  };
}

function toIssue(table: string, error: { code?: string; message: string }): Issue {
  const missing = error.code === "42P01" || error.code === "PGRST205" || /does not exist|could not find/i.test(error.message);
  if (!missing) console.error(`[admin] ${table}:`, error.code, error.message);
  return { table, message: error.message, missing };
}

function cleanSearch(q: string): string {
  return q.replace(/[,()*%\\:."']/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
}

/* List */

export type ClientFilter = ClientStatus | "all";

export type ClientStats = {
  active: number;
  mrrCents: number;
  avgCents: number;
  needsAttention: number;
};

export type ClientsList = {
  rows: Client[];
  counts: Record<ClientFilter, number>;
  stats: ClientStats;
  /** Stripe subscriptions the webhook saw for customers that aren't linked to any client yet. */
  unlinked: number;
  /** Every client, unfiltered. Renewals use this whatever tab you're on. */
  everyone: Client[];
};

export async function listClients({ status, q }: { status: ClientFilter; q?: string }): Promise<Loaded<ClientsList>> {
  const db = await createSupabase();
  const term = q ? cleanSearch(q) : "";
  const c = C.columns;

  // Small book of business: fetch every client once, filter in memory. Hundreds of rows is nothing.
  const [all, unlinked] = await Promise.all([
    db.from(C.table).select(clientSelect).order(c.name, { ascending: true }),
    db
      .from(S.table)
      .select(S.columns.id, { count: "exact", head: true })
      .is(S.columns.clientId, null)
      .in(S.columns.status, [...liveSubscriptionStatuses]),
  ]);
  if (all.error) return { ok: false, issue: toIssue(C.table, all.error) };

  const now = Date.now();
  const clients = ((all.data ?? []) as unknown as Row[]).map((r) => toClient(r, now));
  const needle = term.toLowerCase();
  const matches = (cl: Client) =>
    !needle || [cl.name, cl.contactName, cl.email].some((v) => v?.toLowerCase().includes(needle));

  const searched = clients.filter(matches);
  const counts = { all: searched.length } as Record<ClientFilter, number>;
  for (const s of clientStatuses) counts[s] = searched.filter((cl) => cl.status === s).length;

  const active = clients.filter((cl) => cl.status === "active");
  const mrr = active.reduce((t, cl) => t + cl.monthlyCents, 0);
  const paying = active.filter((cl) => cl.monthlyCents > 0).length;

  return {
    ok: true,
    data: {
      rows: status === "all" ? searched : searched.filter((cl) => cl.status === status),
      counts,
      stats: {
        active: active.length,
        mrrCents: mrr,
        avgCents: paying ? Math.round(mrr / paying) : 0,
        needsAttention: active.filter((cl) => ["failed", "canceling", "ending", "manual-due"].includes(cl.health)).length,
      },
      unlinked: unlinked.count ?? 0,
      everyone: clients,
    },
  };
}

/* Renewals */

export type RenewalKind = "failed" | "canceling" | "ending" | "manual" | "renews";

export type Renewal = {
  id: string;
  kind: RenewalKind;
  clientId: string;
  clientName: string;
  planName: string;
  amountCents: number;
  at: string | null;
};

const urgency: Record<RenewalKind, number> = { failed: 0, ending: 1, canceling: 2, manual: 3, renews: 4 };

/**
 * The next 30 days, from the clients list (so no extra queries).
 * Failed payments always show. Payment plans show 45 days out, because that's when you
 * want to be pitching the care plan, not the week it lapses.
 */
export function renewalsFrom(clients: Client[], now: number = Date.now()): Renewal[] {
  const horizon = now + RENEWAL_WINDOW_DAYS * DAY;
  const out: Renewal[] = [];
  for (const cl of clients) {
    if (cl.status === "churned") continue;
    for (const p of cl.plans) {
      const base = { clientId: cl.id, clientName: cl.name, planName: p.name, amountCents: p.amountCents };
      const next = p.nextChargeAt ? Date.parse(p.nextChargeAt) : null;
      const end = p.endsAt ? Date.parse(p.endsAt) : null;
      if (p.status === "past_due" || p.status === "unpaid") out.push({ ...base, id: `${p.id}-failed`, kind: "failed", at: p.nextChargeAt });
      else if (p.kind === "build" && end && end < now + ENDING_SOON_DAYS * DAY)
        out.push({ ...base, id: `${p.id}-ending`, kind: "ending", at: p.endsAt });
      else if (p.cancelAtPeriodEnd && next && next < horizon) out.push({ ...base, id: `${p.id}-cancel`, kind: "canceling", at: p.nextChargeAt });
      else if (p.source === "manual" && next && next < horizon) out.push({ ...base, id: `${p.id}-manual`, kind: "manual", at: p.nextChargeAt });
      else if (p.status !== "paused" && next && next < horizon) out.push({ ...base, id: `${p.id}-renews`, kind: "renews", at: p.nextChargeAt });
    }
  }
  return out.sort((a, b) => urgency[a.kind] - urgency[b.kind] || (a.at ?? "").localeCompare(b.at ?? ""));
}

/* Detail */

export type ClientProject = { id: string; name: string; service: string | null; status: ProjectStatus; dueDate: string | null; completedAt: string | null };
export type ClientPayment = { id: string; amountCents: number; paidAt: string | null; number: string | null; description: string | null; url: string | null };
export type ClientOrigin = { id: string; name: string; source: LeadSource; createdAt: string; service: string | null } | null;

export type ClientDetail = {
  client: Client;
  projects: Loaded<ClientProject[]>;
  payments: Loaded<ClientPayment[]>;
  origin: ClientOrigin;
};

export async function getClient(id: string): Promise<ClientDetail | null> {
  const db = await createSupabase();
  const { data, error } = await db.from(C.table).select(clientSelect).eq(C.columns.id, id).maybeSingle();
  if (error || !data) return null;
  const client = toClient(data as unknown as Row);

  const [projects, payments, lead] = await Promise.all([
    db.from(P.table).select(selectAs(P.columns)).eq(P.columns.clientId, id).order(P.columns.createdAt, { ascending: false }),
    db
      .from(I.table)
      .select(selectAs(I.columns, ["id", "amountCents", "paidAt", "number", "description", "hostedUrl"]))
      .eq(I.columns.clientId, id)
      .eq(I.columns.status, I.paidStatus)
      .order(I.columns.paidAt, { ascending: false })
      .limit(8),
    client.leadId
      ? db.from(L.table).select(selectAs(L.columns, ["id", "name", "email", "source", "service", "createdAt"])).eq(L.columns.id, client.leadId).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  const leadRow = lead.data as Row | null;
  return {
    client,
    projects: projects.error
      ? { ok: false, issue: toIssue(P.table, projects.error) }
      : {
          ok: true,
          data: ((projects.data ?? []) as unknown as Row[]).map((r) => ({
            id: String(r.id),
            name: str(r.name) ?? "Untitled project",
            service: str(r.service),
            status: toProjectStatus(r.status),
            dueDate: str(r.dueDate),
            completedAt: str(r.completedAt),
          })),
        },
    payments: payments.error
      ? { ok: false, issue: toIssue(I.table, payments.error) }
      : {
          ok: true,
          data: ((payments.data ?? []) as unknown as Row[]).map((r) => ({
            id: String(r.id),
            amountCents: num(r.amountCents),
            paidAt: str(r.paidAt),
            number: str(r.number),
            description: str(r.description),
            url: str(r.hostedUrl),
          })),
        },
    origin: leadRow
      ? {
          id: String(leadRow.id),
          name: str(leadRow.name) ?? str(leadRow.email) ?? "Lead",
          source: toLeadSource(leadRow.source),
          createdAt: String(leadRow.createdAt),
          service: str(leadRow.service),
        }
      : null,
  };
}

/** For the lead drawer: has this lead already become a client? */
export async function clientForLead(leadId: string): Promise<{ id: string; name: string } | null> {
  const db = await createSupabase();
  const { data } = await db.from(C.table).select(`id:${C.columns.id}, name:${C.columns.name}`).eq(C.columns.leadId, leadId).maybeSingle();
  const r = data as Row | null;
  return r ? { id: String(r.id), name: str(r.name) ?? "Client" } : null;
}
