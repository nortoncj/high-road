"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "./auth";
import { createSupabase } from "./supabase";
import { createStripeCustomer as createInStripe, findCustomer, stripeConfigured, syncCustomer } from "./stripe-sync";
import { clientStatuses, tables } from "./schema";

export type FormState = {
  ok?: boolean;
  message?: string;
  error?: string;
  fields?: Partial<Record<string, string>>;
  /** What was typed, sent back on error. React 19 resets a form after its action runs, so without this a typo wipes the form. */
  values?: Record<string, string>;
};

const typed = (fd: FormData) =>
  Object.fromEntries([...fd.entries()].filter((e): e is [string, string] => typeof e[1] === "string"));

const C = tables.clients;
const P = tables.projects;
const L = tables.leads;

const text = (fd: FormData, k: string) => {
  const v = String(fd.get(k) ?? "").trim();
  return v === "" ? null : v;
};
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** "$79", "79.00", "1,299" → cents. */
function cents(v: string | null): number | null | "bad" {
  if (!v) return null;
  const n = Number(v.replace(/[$,\s]/g, ""));
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : "bad";
}

/** Create or update a client. A new client made from a lead links back to it and marks the lead Won. */
export async function saveClient(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = text(fd, "id");
  const leadId = text(fd, "lead_id");
  const fields: Record<string, string> = {};

  const name = text(fd, "name");
  if (!name) fields.name = "Business name is required.";
  const email = text(fd, "email")?.toLowerCase() ?? null;
  if (email && !EMAIL_RE.test(email)) fields.email = "That email doesn't look right.";
  const status = text(fd, "status") ?? "active";
  if (!(clientStatuses as readonly string[]).includes(status)) fields.status = "Pick a status.";
  const monthly = cents(text(fd, "manual_monthly"));
  if (monthly === "bad") fields.manual_monthly = "Use a dollar amount, like 79.";
  const onboarded = text(fd, "onboarded_on");
  if (onboarded && !DATE_RE.test(onboarded)) fields.onboarded_on = "Use a full date.";
  const renews = text(fd, "manual_renews_on");
  if (renews && !DATE_RE.test(renews)) fields.manual_renews_on = "Use a full date.";

  if (Object.keys(fields).length) return { error: "Fix the highlighted fields.", fields, values: typed(fd) };

  const row = {
    [C.columns.name]: name,
    [C.columns.contactName]: text(fd, "contact_name"),
    [C.columns.email]: email,
    [C.columns.phone]: text(fd, "phone"),
    [C.columns.website]: text(fd, "website"),
    [C.columns.status]: status,
    [C.columns.onboardedOn]: onboarded,
    [C.columns.notes]: text(fd, "notes"),
    [C.columns.manualPlan]: text(fd, "manual_plan"),
    [C.columns.manualMonthlyCents]: monthly,
    [C.columns.manualRenewsOn]: renews,
  };

  const db = await createSupabase();
  let savedId = id;

  if (id) {
    const { error } = await db.from(C.table).update(row).eq(C.columns.id, id);
    if (error) return { error: error.message, values: typed(fd) };
  } else {
    const { data, error } = await db
      .from(C.table)
      .insert({ ...row, [C.columns.leadId]: leadId })
      .select(C.columns.id)
      .single();
    if (error) {
      // 23505 = unique violation: this lead already became a client. Go there instead of duplicating.
      if (error.code === "23505" && leadId) {
        const { data: existing } = await db.from(C.table).select(C.columns.id).eq(C.columns.leadId, leadId).maybeSingle();
        if (existing) redirect(`/admin/clients/${String((existing as Record<string, unknown>)[C.columns.id])}`);
      }
      return { error: error.message, values: typed(fd) };
    }
    savedId = String((data as Record<string, unknown>)[C.columns.id]);
    if (leadId) await db.from(L.table).update({ [L.columns.status]: "won" }).eq(L.columns.id, leadId);
  }

  revalidatePath("/admin", "layout");
  redirect(`/admin/clients/${savedId}`);
}

export async function addProject(clientId: string, _prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const name = text(fd, "name");
  if (!name) return { error: "Give the project a name.", fields: { name: "Required." } };
  const due = text(fd, "due_date");
  if (due && !DATE_RE.test(due)) return { error: "Use a full date.", fields: { due_date: "Use a full date." } };

  const db = await createSupabase();
  const { error } = await db.from(P.table).insert({
    [P.columns.clientId]: clientId,
    [P.columns.name]: name,
    [P.columns.service]: text(fd, "service"),
    [P.columns.dueDate]: due,
  });
  if (error) return { error: error.message };
  revalidatePath(`/admin/clients/${clientId}`);
  return { ok: true, message: `Added ${name}` };
}

/* Stripe */

function stripeMissing(): FormState | null {
  return stripeConfigured() ? null : { error: "Add STRIPE_SECRET_KEY to your env first." };
}

/** Link by cus_ id or email, then pull their plans and payments right away. */
export async function linkStripe(clientId: string, _prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const missing = stripeMissing();
  if (missing) return missing;
  const value = text(fd, "customer");
  if (!value) return { error: "Paste a Stripe customer id (cus_...) or their email." };

  const found = await findCustomer(value);
  if ("error" in found) return { error: found.error, values: typed(fd) };

  const db = await createSupabase();
  const { error } = await db.from(C.table).update({ [C.columns.stripeCustomerId]: found.id }).eq(C.columns.id, clientId);
  if (error) return { error: error.code === "23505" ? "That Stripe customer is already linked to another client." : error.message };

  try {
    const r = await syncCustomer(db, clientId, found.id);
    revalidatePath("/admin", "layout");
    return { ok: true, message: `Linked. Pulled ${r.subscriptions} plan(s) and ${r.invoices} payment(s).` };
  } catch (e) {
    return { error: `Linked, but the sync failed: ${(e as Error).message}` };
  }
}

/** New Stripe customer from this client's details, so you can send them a subscription or invoice. */
export async function createStripeCustomer(clientId: string, _prev: FormState, _fd: FormData): Promise<FormState> {
  await requireAdmin();
  const missing = stripeMissing();
  if (missing) return missing;

  const db = await createSupabase();
  const { data } = await db.from(C.table).select("*").eq(C.columns.id, clientId).maybeSingle();
  const row = data as Record<string, unknown> | null;
  if (!row) return { error: "Client not found." };
  if (row[C.columns.stripeCustomerId]) return { error: "Already linked to Stripe." };

  const id = await createInStripe({
    clientId,
    name: String(row[C.columns.name] ?? ""),
    email: (row[C.columns.email] as string | null) ?? undefined,
    phone: (row[C.columns.phone] as string | null) ?? undefined,
  });
  const { error } = await db.from(C.table).update({ [C.columns.stripeCustomerId]: id }).eq(C.columns.id, clientId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/clients/${clientId}`);
  return { ok: true, message: "Created in Stripe. Start their subscription there and it shows up here." };
}

export async function syncClientStripe(clientId: string, _prev: FormState, _fd: FormData): Promise<FormState> {
  await requireAdmin();
  const missing = stripeMissing();
  if (missing) return missing;
  const db = await createSupabase();
  const { data } = await db.from(C.table).select(C.columns.stripeCustomerId).eq(C.columns.id, clientId).maybeSingle();
  const customer = (data as Record<string, unknown> | null)?.[C.columns.stripeCustomerId];
  if (!customer) return { error: "Link a Stripe customer first." };
  try {
    const r = await syncCustomer(db, clientId, String(customer));
    revalidatePath("/admin", "layout");
    return { ok: true, message: `Synced ${r.subscriptions} plan(s) and ${r.invoices} payment(s).` };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

/**
 * Backfill for everyone: syncs linked clients, and links unlinked ones whose email matches exactly
 * one Stripe customer. Run it once after setup; after that the webhook keeps things current.
 */
export async function syncAllStripe(_prev: FormState, _fd: FormData): Promise<FormState> {
  await requireAdmin();
  const missing = stripeMissing();
  if (missing) return missing;
  const db = await createSupabase();
  const { data, error } = await db
    .from(C.table)
    .select(`id:${C.columns.id}, email:${C.columns.email}, customer:${C.columns.stripeCustomerId}`)
    .neq(C.columns.status, "churned");
  if (error) return { error: error.message };

  let synced = 0;
  let linked = 0;
  const failed: string[] = [];
  for (const r of (data ?? []) as { id: string; email: string | null; customer: string | null }[]) {
    try {
      let customer = r.customer;
      if (!customer && r.email) {
        const found = await findCustomer(r.email);
        if ("id" in found) {
          const { error: e } = await db.from(C.table).update({ [C.columns.stripeCustomerId]: found.id }).eq(C.columns.id, r.id);
          if (!e) {
            customer = found.id;
            linked++;
          }
        }
      }
      if (customer) {
        await syncCustomer(db, r.id, customer);
        synced++;
      }
    } catch {
      failed.push(r.email ?? r.id);
    }
  }

  revalidatePath("/admin", "layout");
  const parts = [`Synced ${synced} client${synced === 1 ? "" : "s"}`];
  if (linked) parts.push(`linked ${linked} by email`);
  if (failed.length) parts.push(`${failed.length} failed`);
  return failed.length ? { error: `${parts.join(", ")}.` } : { ok: true, message: `${parts.join(", ")}.` };
}
