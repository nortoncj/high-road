import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Issue, Loaded } from "./data";
import { isOverdue } from "./payment-plan-logic";
import { today } from "./projects";
import { selectAs, tables, toInstallmentStatus, type InstallmentStatus, type PaymentMethod } from "./schema";

/*
 * Payment plans read model: fixed-price work (a $2,000 website) split into installments.
 * Separate from client_subscriptions on purpose. Nothing here recurs, and none of it counts
 * toward monthly value.
 */

type Row = Record<string, unknown>;
const PP = tables.paymentPlans;
const IN = tables.installments;
const P = tables.projects;
const C = tables.clients;

export type Installment = {
  id: string;
  planId: string;
  label: string;
  amountCents: number;
  dueOn: string | null;
  status: InstallmentStatus;
  paidAt: string | null;
  method: PaymentMethod | null;
  stripeInvoiceId: string | null;
  invoiceUrl: string | null;
  /** Paid by hand, so "Undo" can delete the payment it recorded. */
  manual: boolean;
  overdue: boolean;
};

export type PaymentPlan = {
  id: string;
  title: string;
  totalCents: number;
  cancelled: boolean;
  notes: string | null;
  createdAt: string;
  project: { id: string; name: string } | null;
  installments: Installment[];
  paidCents: number;
  /** Still owed. Zero once paid off, and for a cancelled plan. */
  dueCents: number;
  next: Installment | null;
  paidOff: boolean;
};

const str = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v.trim() : v == null ? null : String(v));
const num = (v: unknown): number => (typeof v === "number" ? v : Number(v) || 0);

const planSelect = `${selectAs(PP.columns)}, project:${P.table}(id:${P.columns.id}, name:${P.columns.name}), installments:${IN.table}(${selectAs(IN.columns)})`;

function toInstallment(r: Row, day: string): Installment {
  const status = toInstallmentStatus(r.status);
  const dueOn = str(r.dueOn);
  return {
    id: String(r.id),
    planId: String(r.planId),
    label: str(r.label) ?? "Payment",
    amountCents: num(r.amountCents),
    dueOn,
    status,
    paidAt: str(r.paidAt),
    method: (str(r.method) as PaymentMethod | null) ?? null,
    stripeInvoiceId: str(r.stripeInvoiceId),
    invoiceUrl: str(r.invoiceUrl),
    manual: status === "paid" && Boolean(r.invoiceId),
    overdue: (status === "pending" || status === "invoiced") && isOverdue(dueOn, day),
  };
}

function toPlan(r: Row, day: string): PaymentPlan {
  const installments = ((r.installments as Row[] | null) ?? [])
    .map((i) => ({ i: toInstallment(i, day), pos: num(i.position) }))
    .sort((a, b) => a.pos - b.pos)
    .map((x) => x.i);
  const cancelled = r.status === "cancelled";
  const paidCents = installments.filter((i) => i.status === "paid").reduce((t, i) => t + i.amountCents, 0);
  const open = installments.filter((i) => i.status === "pending" || i.status === "invoiced");
  const project = r.project as Row | null;
  return {
    id: String(r.id),
    title: str(r.title) ?? "Payment plan",
    totalCents: num(r.totalCents),
    cancelled,
    notes: str(r.notes),
    createdAt: String(r.createdAt),
    project: project ? { id: String(project.id), name: str(project.name) ?? "Project" } : null,
    installments,
    paidCents,
    dueCents: cancelled ? 0 : open.reduce((t, i) => t + i.amountCents, 0),
    next: cancelled ? null : (open[0] ?? null),
    paidOff: !cancelled && installments.length > 0 && open.length === 0,
  };
}

function toIssue(table: string, error: { code?: string; message: string }): Issue {
  const missing = error.code === "42P01" || error.code === "PGRST205" || /does not exist|could not find/i.test(error.message);
  if (!missing) console.error(`[admin] ${table}:`, error.code, error.message);
  return { table, message: error.message, missing };
}

/** A client's plans: open ones first, then paid off, then cancelled. Newest first within each. */
export async function plansForClient(db: SupabaseClient, clientId: string): Promise<Loaded<PaymentPlan[]>> {
  const { data, error } = await db.from(PP.table).select(planSelect).eq(PP.columns.clientId, clientId).order(PP.columns.createdAt, { ascending: false });
  if (error) return { ok: false, issue: toIssue(PP.table, error) };
  const day = today();
  const rank = (p: PaymentPlan) => (p.cancelled ? 2 : p.paidOff ? 1 : 0);
  const plans = ((data ?? []) as unknown as Row[]).map((r) => toPlan(r, day)).sort((a, b) => rank(a) - rank(b));
  return { ok: true, data: plans };
}

export type DueInstallment = {
  id: string;
  clientId: string;
  clientName: string;
  planTitle: string;
  label: string;
  amountCents: number;
  dueOn: string;
  overdue: boolean;
};

/**
 * Unpaid installments due within `days` (and anything already overdue), for the renewals card.
 * Empty if the payment plan tables aren't there yet, so the Clients page never breaks on them.
 */
export async function dueInstallments(db: SupabaseClient, days: number): Promise<DueInstallment[]> {
  const day = today();
  const horizon = new Date(Date.parse(`${day}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);
  const { data, error } = await db
    .from(IN.table)
    .select(
      `${selectAs(IN.columns, ["id", "label", "amountCents", "dueOn"])}, plan:${PP.table}!inner(title:${PP.columns.title}, status:${PP.columns.status}, client:${C.table}!inner(id:${C.columns.id}, name:${C.columns.name}, status:${C.columns.status}))`,
    )
    .in(IN.columns.status, ["pending", "invoiced"])
    .lte(IN.columns.dueOn, horizon)
    .eq(`plan.${PP.columns.status}`, "active")
    .neq(`plan.client.${C.columns.status}`, "churned")
    .order(IN.columns.dueOn, { ascending: true });
  if (error) {
    toIssue(IN.table, error);
    return [];
  }
  return ((data ?? []) as unknown as Row[]).map((r) => {
    const plan = r.plan as Row;
    const client = plan.client as Row;
    const dueOn = String(r.dueOn);
    return {
      id: String(r.id),
      clientId: String(client.id),
      clientName: str(client.name) ?? "Client",
      planTitle: str(plan.title) ?? "Payment plan",
      label: str(r.label) ?? "Payment",
      amountCents: num(r.amountCents),
      dueOn,
      overdue: isOverdue(dueOn, day),
    };
  });
}
