import "server-only";
import { createSupabase } from "./supabase";
import { clientForLead } from "./clients";
import { dayKey, zonedDay, type DateRange } from "./range";
import { overview } from "@/content/admin";
import {
  leadStatusMeta,
  leadStatuses,
  selectAs,
  tables,
  toLeadSource,
  toLeadStatus,
  type LeadSource,
  type LeadStatus,
} from "./schema";

/*
 * Every dashboard query lives here. Each one returns either data or an "issue", never throws,
 * so one missing table (say you haven't made invoices yet) blanks one card instead of the page.
 */

export type Issue = { table: string; message: string; missing: boolean };
export type Loaded<T> = { ok: true; data: T } | { ok: false; issue: Issue };

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  website: string | null;
  service: string | null;
  source: LeadSource;
  status: LeadStatus;
  message: string | null;
  /** ISO string: Dates don't love crossing the server/client line. */
  createdAt: string;
  /** Set when this lead has been turned into a client (detail drawer only). */
  client?: { id: string; name: string } | null;
};

export type Kpi = {
  key: "leads" | "clients" | "projects" | "revenue";
  label: string;
  value: number | null;
  format: "count" | "usd";
  /** Percent vs previous period. null = nothing last period. undefined = doesn't apply (snapshot counts). */
  change?: number | null;
  note?: string;
  issue?: Issue;
};

export type ServiceSlice = { label: string; count: number; untagged?: boolean };

export type ActivityItem = {
  id: string;
  kind: "lead" | "status" | "payment" | "project";
  title: string;
  detail?: string;
  at: string;
  href?: string;
};

export type Overview = {
  kpis: Kpi[];
  recentLeads: Loaded<{ rows: Lead[]; total: number }>;
  services: Loaded<{ slices: ServiceSlice[]; total: number }>;
  activity: ActivityItem[];
};

type DbError = { code?: string; message: string } | null;
type Row = Record<string, unknown>;

function toIssue(table: string, error: NonNullable<DbError>): Issue {
  const missing =
    error.code === "42P01" || error.code === "PGRST205" || /does not exist|could not find the table/i.test(error.message);
  if (!missing) console.error(`[admin] ${table}:`, error.code, error.message);
  return { table, message: error.message, missing };
}

const str = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v.trim() : v == null ? null : String(v));

const L = tables.leads;
const leadSelect = selectAs(L.columns);

function toLead(r: Row): Lead {
  const email = str(r.email) ?? "";
  return {
    id: String(r.id),
    name: str(r.name) ?? (email ? email.split("@")[0] : "Unknown"),
    email,
    phone: str(r.phone),
    website: str(r.website),
    service: str(r.service),
    source: toLeadSource(r.source),
    status: toLeadStatus(r.status),
    message: str(r.message),
    createdAt: String(r.createdAt),
  };
}

/* Overview */

export async function getOverview(range: DateRange): Promise<Overview> {
  const db = await createSupabase();
  const from = range.from.toISOString();
  const to = range.to.toISOString();
  const prevFrom = range.prevFrom.toISOString();
  const now = new Date();

  const countLeads = (a: string, b: string) =>
    db.from(L.table).select(L.columns.id, { count: "exact", head: true }).gte(L.columns.createdAt, a).lt(L.columns.createdAt, b);

  const C = tables.clients;
  const P = tables.projects;
  const I = tables.invoices;
  const today = dayKey(zonedDay(now));
  const weekOut = dayKey(zonedDay(new Date(now.getTime() + 7 * 86_400_000)));
  const closed = `(${P.closedStatuses.join(",")})`;

  const [
    leadsNow,
    leadsPrev,
    recent,
    serviceRows,
    clientsActive,
    clientsNew,
    projectsOpen,
    projectsDue,
    paidNow,
    paidPrev,
    activity,
  ] = await Promise.all([
    countLeads(from, to),
    countLeads(prevFrom, from),
    db.from(L.table).select(leadSelect).gte(L.columns.createdAt, from).lt(L.columns.createdAt, to).order(L.columns.createdAt, { ascending: false }).limit(6),
    db.from(L.table).select(`service:${L.columns.service}`).gte(L.columns.createdAt, from).lt(L.columns.createdAt, to).limit(1000),
    db.from(C.table).select(C.columns.id, { count: "exact", head: true }).eq(C.columns.status, C.activeStatus),
    db.from(C.table).select(C.columns.id, { count: "exact", head: true }).gte(C.columns.createdAt, from).lt(C.columns.createdAt, to),
    db.from(P.table).select(P.columns.id, { count: "exact", head: true }).not(P.columns.status, "in", closed),
    db.from(P.table).select(P.columns.id, { count: "exact", head: true }).not(P.columns.status, "in", closed).gte(P.columns.dueDate, today).lte(P.columns.dueDate, weekOut),
    db.from(I.table).select(`amountCents:${I.columns.amountCents}`).eq(I.columns.status, I.paidStatus).gte(I.columns.paidAt, from).lt(I.columns.paidAt, to).limit(1000),
    db.from(I.table).select(`amountCents:${I.columns.amountCents}`).eq(I.columns.status, I.paidStatus).gte(I.columns.paidAt, prevFrom).lt(I.columns.paidAt, from).limit(1000),
    getActivity(db, range),
  ]);

  const k = overview.kpis;
  const kpis: Kpi[] = [];

  // New leads: a real period-over-period comparison.
  if (leadsNow.error) kpis.push({ key: "leads", label: k.leads.label, value: null, format: "count", issue: toIssue(L.table, leadsNow.error) });
  else {
    const cur = leadsNow.count ?? 0;
    const prev = leadsPrev.count ?? 0;
    kpis.push({ key: "leads", label: k.leads.label, value: cur, format: "count", change: pct(cur, prev) });
  }

  // Active clients and open projects are snapshots. A "% vs last 30 days" on them would be made-up
  // math without history, so they get a plain note instead.
  if (clientsActive.error) kpis.push({ key: "clients", label: k.clients.label, value: null, format: "count", issue: toIssue(C.table, clientsActive.error) });
  else kpis.push({ key: "clients", label: k.clients.label, value: clientsActive.count ?? 0, format: "count", note: k.clients.note(clientsNew.count ?? 0) });

  if (projectsOpen.error) kpis.push({ key: "projects", label: k.projects.label, value: null, format: "count", issue: toIssue(P.table, projectsOpen.error) });
  else kpis.push({ key: "projects", label: k.projects.label, value: projectsOpen.count ?? 0, format: "count", note: k.projects.note(projectsDue.count ?? 0) });

  if (paidNow.error) kpis.push({ key: "revenue", label: k.revenue.label, value: null, format: "usd", issue: toIssue(I.table, paidNow.error) });
  else {
    const sum = (rows: Row[] | null) => (rows ?? []).reduce((t, r) => t + (Number(r.amountCents) || 0), 0);
    const cur = sum(paidNow.data as unknown as Row[] | null);
    const prev = sum(paidPrev.data as unknown as Row[] | null);
    kpis.push({ key: "revenue", label: k.revenue.label, value: cur, format: "usd", change: pct(cur, prev), note: k.revenue.hint });
  }

  const recentLeads: Overview["recentLeads"] = recent.error
    ? { ok: false, issue: toIssue(L.table, recent.error) }
    : { ok: true, data: { rows: ((recent.data ?? []) as unknown as Row[]).map(toLead), total: leadsNow.count ?? 0 } };

  let services: Overview["services"];
  if (serviceRows.error) services = { ok: false, issue: toIssue(L.table, serviceRows.error) };
  else {
    const counts = new Map<string, number>();
    let untagged = 0;
    for (const r of (serviceRows.data ?? []) as unknown as Row[]) {
      const s = str(r.service);
      if (!s) untagged++;
      else counts.set(s, (counts.get(s) ?? 0) + 1);
    }
    const slices: ServiceSlice[] = [...counts].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
    if (untagged) slices.push({ label: overview.services.untagged, count: untagged, untagged: true });
    services = { ok: true, data: { slices, total: slices.reduce((t, s) => t + s.count, 0) } };
  }

  return { kpis, recentLeads, services, activity };
}

function pct(cur: number, prev: number): number | null {
  if (prev === 0) return cur === 0 ? 0 : null;
  return ((cur - prev) / prev) * 100;
}

/**
 * Recent activity is stitched together from tables you already have, not a separate log
 * you'd have to remember to write to. Any table that's missing just sits this out.
 */
async function getActivity(db: Awaited<ReturnType<typeof createSupabase>>, range: DateRange): Promise<ActivityItem[]> {
  const from = range.from.toISOString();
  const to = range.to.toISOString();
  const E = tables.leadEvents;
  const I = tables.invoices;
  const P = tables.projects;

  const [leads, events, payments, projects] = await Promise.all([
    db.from(L.table).select(selectAs(L.columns, ["id", "name", "email", "service", "source", "createdAt"])).gte(L.columns.createdAt, from).lt(L.columns.createdAt, to).order(L.columns.createdAt, { ascending: false }).limit(8),
    db.from(E.table).select(`id:${E.columns.id}, leadId:${E.columns.leadId}, toStatus:${E.columns.toStatus}, createdAt:${E.columns.createdAt}`).gte(E.columns.createdAt, from).lt(E.columns.createdAt, to).order(E.columns.createdAt, { ascending: false }).limit(8),
    db.from(I.table).select(`id:${I.columns.id}, amountCents:${I.columns.amountCents}, paidAt:${I.columns.paidAt}, client:${tables.clients.table}(name)`).eq(I.columns.status, I.paidStatus).gte(I.columns.paidAt, from).lt(I.columns.paidAt, to).order(I.columns.paidAt, { ascending: false }).limit(8),
    db.from(P.table).select(`id:${P.columns.id}, name:${P.columns.name}, completedAt:${P.columns.completedAt}`).gte(P.columns.completedAt, from).lt(P.columns.completedAt, to).order(P.columns.completedAt, { ascending: false }).limit(8),
  ]);

  const items: ActivityItem[] = [];
  const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  if (!leads.error)
    for (const r of (leads.data ?? []) as unknown as Row[]) {
      const lead = toLead(r);
      items.push({
        id: `lead-${lead.id}`,
        kind: "lead",
        title: `New lead: ${lead.name}`,
        detail: [lead.service, lead.source === "calendly" ? "booked a call" : lead.source === "contact_form" ? "sent a message" : lead.source === "home_form" ? "left their details" : null]
          .filter(Boolean)
          .join(", "),
        at: lead.createdAt,
        href: `/admin/leads?lead=${encodeURIComponent(lead.id)}`,
      });
    }

  if (!events.error && events.data?.length) {
    // Names come from a second small query instead of a join, so lead_events works whatever type leads.id is.
    const eventRows = events.data as unknown as Row[];
    const ids = [...new Set(eventRows.map((r) => String(r.leadId)))];
    const { data: named } = await db.from(L.table).select(selectAs(L.columns, ["id", "name", "email"])).in(L.columns.id, ids);
    const names = new Map(((named ?? []) as unknown as Row[]).map((r) => [String(r.id), toLead(r).name]));
    for (const r of eventRows) {
      const status = toLeadStatus(r.toStatus);
      items.push({
        id: `event-${String(r.id)}`,
        kind: "status",
        title: `${names.get(String(r.leadId)) ?? "A lead"} moved to ${leadStatusMeta[status].label}`,
        at: String(r.createdAt),
        href: `/admin/leads?lead=${encodeURIComponent(String(r.leadId))}`,
      });
    }
  }

  if (!payments.error)
    for (const r of (payments.data ?? []) as unknown as Row[]) {
      const client = r.client as Row | null;
      items.push({
        id: `pay-${String(r.id)}`,
        kind: "payment",
        title: `Payment received: ${usd.format((Number(r.amountCents) || 0) / 100)}`,
        detail: str(client?.name) ?? undefined,
        at: String(r.paidAt),
      });
    }

  if (!projects.error)
    for (const r of (projects.data ?? []) as unknown as Row[]) {
      items.push({ id: `proj-${String(r.id)}`, kind: "project", title: `Launched: ${str(r.name) ?? "a project"}`, at: String(r.completedAt) });
    }

  return items.sort((a, b) => Date.parse(b.at) - Date.parse(a.at)).slice(0, 8);
}

/* Leads page */

export const LEADS_PER_PAGE = 25;

export type LeadsQuery = { q?: string; status?: LeadStatus; page: number };

export type LeadsList = {
  rows: Lead[];
  total: number;
  pages: number;
  counts: Record<LeadStatus | "all", number>;
};

/** PostgREST's `or` filter has its own syntax; strip anything that could break out of it. */
function cleanSearch(q: string): string {
  return q.replace(/[,()*%\\:."']/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
}

export async function listLeads({ q, status, page }: LeadsQuery): Promise<Loaded<LeadsList>> {
  const db = await createSupabase();
  const c = L.columns;
  const term = q ? cleanSearch(q) : "";
  const start = (page - 1) * LEADS_PER_PAGE;

  let list = db.from(L.table).select(leadSelect, { count: "exact" });
  if (term) list = list.or(`${c.name}.ilike.*${term}*,${c.email}.ilike.*${term}*`);
  if (status) list = list.eq(c.status, status);
  const listPromise = list.order(c.createdAt, { ascending: false }).range(start, start + LEADS_PER_PAGE - 1);

  // Tab counts respect the search but not the status filter, so you can see where matches sit.
  const countFor = (s?: LeadStatus) => {
    let qy = db.from(L.table).select(c.id, { count: "exact", head: true });
    if (term) qy = qy.or(`${c.name}.ilike.*${term}*,${c.email}.ilike.*${term}*`);
    if (s) qy = qy.eq(c.status, s);
    return qy;
  };

  const [res, all, ...byStatus] = await Promise.all([listPromise, countFor(), ...leadStatuses.map((s) => countFor(s))]);
  if (res.error) return { ok: false, issue: toIssue(L.table, res.error) };

  const counts = { all: all.count ?? 0 } as LeadsList["counts"];
  leadStatuses.forEach((s, i) => (counts[s] = byStatus[i].count ?? 0));
  const total = res.count ?? 0;

  return {
    ok: true,
    data: { rows: ((res.data ?? []) as unknown as Row[]).map(toLead), total, pages: Math.max(1, Math.ceil(total / LEADS_PER_PAGE)), counts },
  };
}

export async function getLead(id: string): Promise<Lead | null> {
  const db = await createSupabase();
  const [{ data, error }, client] = await Promise.all([
    db.from(L.table).select(leadSelect).eq(L.columns.id, id).maybeSingle(),
    clientForLead(id).catch(() => null),
  ]);
  if (error || !data) return null;
  return { ...toLead(data as unknown as Row), client };
}

/** For the badge on "Leads" in the sidebar. */
export async function countNewLeads(): Promise<number> {
  const db = await createSupabase();
  const { count, error } = await db.from(L.table).select(L.columns.id, { count: "exact", head: true }).eq(L.columns.status, "new");
  return error ? 0 : (count ?? 0);
}
