"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "./auth";
import type { FormState } from "./client-actions";
import { usdExact } from "./format";
import { MAX_INSTALLMENTS, parseDollars } from "./payment-plan-logic";
import { today } from "./projects";
import { paymentMethods, selectAs, tables } from "./schema";
import { createInstallmentInvoice, payInvoiceOutOfBand, stripeConfigured, voidStripeInvoice } from "./stripe-sync";
import { createSupabase } from "./supabase";

/*
 * Payment plans: fixed-price work paid in installments. Every installment ends up paid one of two ways:
 *   - by hand (Zelle, cash, check): writes a paid row to invoices so Payments and Revenue count it
 *   - by Stripe invoice: "Send invoice" emails a one-off invoice, the webhook marks it paid
 */

type Row = Record<string, unknown>;
const PP = tables.paymentPlans;
const IN = tables.installments;
const I = tables.invoices;
const C = tables.clients;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const text = (fd: FormData, k: string) => {
  const v = String(fd.get(k) ?? "").trim();
  return v === "" ? null : v;
};
const typed = (fd: FormData) =>
  Object.fromEntries([...fd.entries()].filter((e): e is [string, string] => typeof e[1] === "string"));

function refresh(clientId: string) {
  revalidatePath(`/admin/clients/${clientId}`);
  revalidatePath("/admin", "layout");
}

/** New plan from the form's schedule rows. The server re-checks that the rows add up to the total. */
export async function createPaymentPlan(clientId: string, _prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const fields: Record<string, string> = {};
  const title = text(fd, "title");
  if (!title) fields.title = "Name it, like “Website build”.";
  const total = parseDollars(text(fd, "total"));
  if (!total || Number.isNaN(total)) fields.total = "Enter the full price, like 2000.";
  const projectId = text(fd, "project_id");

  const labels = fd.getAll("row_label").map(String);
  const amounts = fd.getAll("row_amount").map((v) => parseDollars(String(v)));
  const dues = fd.getAll("row_due").map((v) => String(v).trim() || null);
  const rows = labels.map((label, i) => ({ label: label.trim() || `Payment ${i + 1}`, amount: amounts[i], due: dues[i] ?? null }));

  if (rows.length === 0 || rows.length > MAX_INSTALLMENTS) fields.schedule = `Use 1 to ${MAX_INSTALLMENTS} payments.`;
  else if (rows.some((r) => !r.amount || Number.isNaN(r.amount))) fields.schedule = "Every payment needs an amount.";
  else if (rows.some((r) => r.due && !DATE_RE.test(r.due))) fields.schedule = "Use full dates.";
  else if (total && !Number.isNaN(total)) {
    const sum = rows.reduce((t, r) => t + (r.amount ?? 0), 0);
    if (sum !== total) fields.schedule = `Payments add up to ${usdExact(sum)}, not ${usdExact(total)}.`;
  }
  if (Object.keys(fields).length) return { error: "Fix the highlighted fields.", fields, values: typed(fd) };

  const db = await createSupabase();
  const { data, error } = await db
    .from(PP.table)
    .insert({
      [PP.columns.clientId]: clientId,
      [PP.columns.projectId]: projectId,
      [PP.columns.title]: title,
      [PP.columns.totalCents]: total,
      [PP.columns.notes]: text(fd, "notes"),
    })
    .select(PP.columns.id)
    .single();
  if (error) return { error: error.message, values: typed(fd) };
  const planId = String((data as Row)[PP.columns.id]);

  const { error: rowsError } = await db.from(IN.table).insert(
    rows.map((r, i) => ({
      [IN.columns.planId]: planId,
      [IN.columns.position]: (i + 1) * 10,
      [IN.columns.label]: r.label,
      [IN.columns.amountCents]: r.amount,
      [IN.columns.dueOn]: r.due,
    })),
  );
  if (rowsError) {
    await db.from(PP.table).delete().eq(PP.columns.id, planId);
    return { error: rowsError.message, values: typed(fd) };
  }

  refresh(clientId);
  return { ok: true, message: `${title}: ${usdExact(total!)} over ${rows.length} payment${rows.length === 1 ? "" : "s"}` };
}

type Loaded = {
  id: string;
  label: string;
  amountCents: number;
  dueOn: string | null;
  status: string;
  stripeInvoiceId: string | null;
  invoiceId: string | null;
  plan: { id: string; clientId: string; projectId: string | null; title: string; customer: string | null };
};

async function loadInstallment(db: Awaited<ReturnType<typeof createSupabase>>, id: string): Promise<Loaded | null> {
  const { data } = await db
    .from(IN.table)
    .select(
      `${selectAs(IN.columns, ["id", "label", "amountCents", "dueOn", "status", "stripeInvoiceId", "invoiceId"])}, plan:${PP.table}(${selectAs(PP.columns, ["id", "clientId", "projectId", "title"])}, client:${C.table}(customer:${C.columns.stripeCustomerId}))`,
    )
    .eq(IN.columns.id, id)
    .maybeSingle();
  const r = data as unknown as Row | null;
  if (!r) return null;
  const plan = r.plan as Row;
  const client = plan.client as Row | null;
  return {
    id: String(r.id),
    label: String(r.label),
    amountCents: Number(r.amountCents) || 0,
    dueOn: (r.dueOn as string | null) ?? null,
    status: String(r.status),
    stripeInvoiceId: (r.stripeInvoiceId as string | null) ?? null,
    invoiceId: (r.invoiceId as string | null) ?? null,
    plan: {
      id: String(plan.id),
      clientId: String(plan.clientId),
      projectId: (plan.projectId as string | null) ?? null,
      title: String(plan.title),
      customer: (client?.customer as string | null) ?? null,
    },
  };
}

/** Email a Stripe invoice for one installment. */
export async function sendInstallmentInvoice(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  if (!stripeConfigured()) return { error: "Add STRIPE_SECRET_KEY to your env first." };
  const db = await createSupabase();
  const inst = await loadInstallment(db, text(fd, "id") ?? "");
  if (!inst) return { error: "That payment is gone. Refresh the page." };
  if (inst.status !== "pending") return { error: inst.status === "invoiced" ? "Already invoiced." : "Nothing to invoice." };
  if (!inst.plan.customer) return { error: "Connect this client to Stripe first." };

  try {
    const inv = await createInstallmentInvoice({
      customer: inst.plan.customer,
      amountCents: inst.amountCents,
      description: `${inst.plan.title}: ${inst.label}`,
      dueOn: inst.dueOn,
      metadata: {
        installment_id: inst.id,
        plan_id: inst.plan.id,
        client_id: inst.plan.clientId,
        ...(inst.plan.projectId ? { project_id: inst.plan.projectId } : {}),
        source: "wtn-admin",
      },
    });
    const { error } = await db
      .from(IN.table)
      .update({ [IN.columns.status]: "invoiced", [IN.columns.stripeInvoiceId]: inv.id, [IN.columns.invoiceUrl]: inv.url })
      .eq(IN.columns.id, inst.id);
    refresh(inst.plan.clientId);
    if (error) return { error: `Invoice ${inv.id} went out, but saving it failed: ${error.message}. Sync now will catch it once it's paid.` };
    if (inv.sendError) return { error: `Invoice created, but Stripe couldn't email it (${inv.sendError}). Copy the pay link instead.` };
    return { ok: true, message: `Sent a ${usdExact(inst.amountCents)} invoice` };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

/**
 * Money came in outside Stripe. Records it in invoices so it counts everywhere. If a Stripe invoice
 * was already out for it, that invoice gets marked paid out of band so Stripe stops sending reminders.
 */
export async function markInstallmentPaid(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const method = text(fd, "method") ?? "zelle";
  if (!(paymentMethods as readonly string[]).includes(method)) return { error: "Pick how they paid." };
  const paidOn = text(fd, "paid_on") ?? today();
  if (!DATE_RE.test(paidOn)) return { error: "Use a full date." };

  const db = await createSupabase();
  const inst = await loadInstallment(db, text(fd, "id") ?? "");
  if (!inst) return { error: "That payment is gone. Refresh the page." };
  if (inst.status === "paid") return { error: "Already marked paid." };
  if (inst.status === "void") return { error: "That plan was cancelled." };
  const paidAt = `${paidOn}T12:00:00Z`;

  if (inst.status === "invoiced" && inst.stripeInvoiceId) {
    if (!stripeConfigured()) return { error: "Add STRIPE_SECRET_KEY to your env first." };
    try {
      await payInvoiceOutOfBand(db, inst.stripeInvoiceId);
    } catch (e) {
      return { error: `Stripe wouldn't close the invoice: ${(e as Error).message}` };
    }
    const { error } = await db
      .from(IN.table)
      .update({ [IN.columns.status]: "paid", [IN.columns.paidAt]: paidAt, [IN.columns.method]: method })
      .eq(IN.columns.id, inst.id);
    if (error) return { error: error.message };
  } else {
    const { data, error } = await db
      .from(I.table)
      .insert({
        [I.columns.clientId]: inst.plan.clientId,
        [I.columns.projectId]: inst.plan.projectId,
        [I.columns.amountCents]: inst.amountCents,
        [I.columns.status]: I.paidStatus,
        [I.columns.paidAt]: paidAt,
        [I.columns.issuedAt]: paidOn,
        [I.columns.description]: `${inst.plan.title}: ${inst.label}`,
      })
      .select(I.columns.id)
      .single();
    if (error) return { error: error.message };
    const invoiceId = String((data as Row)[I.columns.id]);
    const { error: e2 } = await db
      .from(IN.table)
      .update({ [IN.columns.status]: "paid", [IN.columns.paidAt]: paidAt, [IN.columns.method]: method, [IN.columns.invoiceId]: invoiceId })
      .eq(IN.columns.id, inst.id);
    if (e2) {
      await db.from(I.table).delete().eq(I.columns.id, invoiceId);
      return { error: e2.message };
    }
  }

  refresh(inst.plan.clientId);
  return { ok: true, message: `${inst.label} marked paid (${usdExact(inst.amountCents)})` };
}

/** Undo a hand-marked payment. Stripe payments are undone in Stripe (refund), not here. */
export async function markInstallmentUnpaid(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const db = await createSupabase();
  const inst = await loadInstallment(db, text(fd, "id") ?? "");
  if (!inst) return { error: "That payment is gone. Refresh the page." };
  if (inst.status !== "paid" || !inst.invoiceId) return { error: "Only payments you marked by hand can be undone here." };

  const { error } = await db
    .from(IN.table)
    .update({ [IN.columns.status]: "pending", [IN.columns.paidAt]: null, [IN.columns.method]: null, [IN.columns.invoiceId]: null })
    .eq(IN.columns.id, inst.id);
  if (error) return { error: error.message };
  await db.from(I.table).delete().eq(I.columns.id, inst.invoiceId);

  refresh(inst.plan.clientId);
  return { ok: true, message: `${inst.label} is unpaid again` };
}

/**
 * Remove a plan. Open Stripe invoices get voided first. With nothing paid it's deleted outright;
 * with payments on it, it's cancelled so the money it brought in stays on record.
 */
export async function removePaymentPlan(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = text(fd, "id") ?? "";
  const db = await createSupabase();
  const { data } = await db
    .from(PP.table)
    .select(`${selectAs(PP.columns, ["id", "clientId", "title"])}, installments:${IN.table}(${selectAs(IN.columns, ["id", "status", "stripeInvoiceId"])})`)
    .eq(PP.columns.id, id)
    .maybeSingle();
  const plan = data as unknown as Row | null;
  if (!plan) return { error: "That plan is gone. Refresh the page." };
  const clientId = String(plan.clientId);
  const installments = (plan.installments as Row[] | null) ?? [];

  const open = installments.filter((i) => i.status === "invoiced" && i.stripeInvoiceId);
  if (open.length) {
    if (!stripeConfigured()) return { error: "This plan has Stripe invoices out. Add STRIPE_SECRET_KEY so they can be voided." };
    try {
      for (const i of open) await voidStripeInvoice(String(i.stripeInvoiceId));
    } catch (e) {
      return { error: `Couldn't void the Stripe invoice: ${(e as Error).message}` };
    }
  }

  const anyPaid = installments.some((i) => i.status === "paid");
  if (anyPaid) {
    const { error } = await db
      .from(IN.table)
      .update({ [IN.columns.status]: "void" })
      .eq(IN.columns.planId, id)
      .in(IN.columns.status, ["pending", "invoiced"]);
    if (error) return { error: error.message };
    const { error: e2 } = await db.from(PP.table).update({ [PP.columns.status]: "cancelled" }).eq(PP.columns.id, id);
    if (e2) return { error: e2.message };
  } else {
    const { error } = await db.from(PP.table).delete().eq(PP.columns.id, id);
    if (error) return { error: error.message };
  }

  refresh(clientId);
  return { ok: true, message: anyPaid ? `Cancelled ${String(plan.title)}. Payments so far stay on record.` : `Deleted ${String(plan.title)}` };
}
