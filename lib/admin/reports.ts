import "server-only";
import { createSupabase } from "./supabase";
import type { Issue, Loaded } from "./data";
import { selectAs, tables } from "./schema";
import {
  fillTrend,
  parseMonth,
  sourceShares,
  summarize,
  zero,
  type Counts,
  type ReportMonth,
  type SourceShare,
  type TrendPoint,
} from "./report-logic";

/*
 * Report queries. The counting happens in Postgres (report_* functions in the reports migration);
 * this file just asks for the right ranges and shapes the answers.
 */

export type SiteStatus = "live" | "quiet" | "waiting" | "paused";

export type SiteInfo = {
  id: string;
  clientId: string;
  domain: string;
  siteKey: string;
  active: boolean;
  lastEventAt: string | null;
  status: SiteStatus;
};

type Row = Record<string, unknown>;
const QUIET_DAYS = 7;

function toIssue(table: string, error: { code?: string; message: string }): Issue {
  const missing =
    error.code === "42P01" || error.code === "42883" || error.code === "PGRST202" || error.code === "PGRST205" ||
    /does not exist|could not find the (table|function)/i.test(error.message);
  if (!missing) console.error(`[admin] ${table}:`, error.code, error.message);
  return { table, message: error.message, missing };
}

function siteStatus(active: boolean, last: string | null, now: Date): SiteStatus {
  if (!active) return "paused";
  if (!last) return "waiting";
  return now.getTime() - new Date(last).getTime() > QUIET_DAYS * 86_400_000 ? "quiet" : "live";
}

/** Worst news first: a site that went quiet beats one that's live. */
function overallStatus(sites: SiteInfo[]): SiteStatus {
  const order: SiteStatus[] = ["quiet", "live", "waiting", "paused"];
  for (const s of order) if (sites.some((x) => x.status === s)) return s;
  return "paused";
}

function toSite(r: Row, now: Date): SiteInfo {
  const active = r.active !== false;
  const last = r.last_event_at ? String(r.last_event_at) : null;
  return {
    id: String(r.id),
    clientId: String(r.client_id),
    domain: String(r.domain),
    siteKey: String(r.site_key),
    active,
    lastEventAt: last,
    status: siteStatus(active, last, now),
  };
}

const siteCols = "id, client_id, domain, site_key, active, last_event_at";

const counts = (r: Row | undefined): Counts =>
  r ? { views: Number(r.views ?? 0), visits: Number(r.visits ?? 0), calls: Number(r.calls ?? 0), forms: Number(r.forms ?? 0) } : zero();

/** The tag to paste on a client site. Served from your own domain, so it's first party to you. */
export function trackerSrc(): string {
  const base = (process.env.ADMIN_SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://webtechninjas.com").replace(/\/+$/, "");
  return `${base}/wtn.js`;
}

export function snippetFor(siteKey: string): string {
  return `<script defer src="${trackerSrc()}" data-site="${siteKey}"></script>`;
}

/* Client page: tracking card */

export async function sitesForClient(clientId: string): Promise<Loaded<SiteInfo[]>> {
  const db = await createSupabase();
  const { data, error } = await db.from("client_sites").select(siteCols).eq("client_id", clientId).order("created_at");
  if (error) return { ok: false, issue: toIssue("client_sites", error) };
  const now = new Date();
  return { ok: true, data: ((data ?? []) as Row[]).map((r) => toSite(r, now)) };
}

/* Reports list */

export type ReportRow = {
  client: { id: string; name: string; email: string | null };
  sites: SiteInfo[];
  status: SiteStatus;
  cur: Counts;
  prev: Counts;
  sentAt: string | null;
};

export type ReportList = {
  rows: ReportRow[];
  /** Active clients with no site set up yet. */
  untracked: { id: string; name: string }[];
  totals: { cur: Counts; prev: Counts };
};

const C = tables.clients;

export async function listReports(month: ReportMonth): Promise<Loaded<ReportList>> {
  const db = await createSupabase();
  const range = (a: Date, b: Date) => ({ p_from: a.toISOString(), p_to: b.toISOString() });

  const [sites, clients, cur, prev, sends] = await Promise.all([
    db.from("client_sites").select(siteCols),
    db.from(C.table).select(selectAs(C.columns, ["id", "name", "email", "status"])).order(C.columns.name),
    db.rpc("report_totals", range(month.from, month.to)),
    db.rpc("report_totals", range(month.prevFrom, month.prevTo)),
    db.from("report_sends").select("client_id, sent_at").eq("month", `${month.key}-01`),
  ]);

  for (const [name, r] of [
    ["client_sites", sites],
    ["clients", clients],
    ["report_totals", cur],
    ["report_totals", prev],
    ["report_sends", sends],
  ] as const) {
    if (r.error) return { ok: false, issue: toIssue(name, r.error) };
  }

  const now = new Date();
  const siteList = ((sites.data ?? []) as Row[]).map((r) => toSite(r, now));
  const curBy = new Map(((cur.data ?? []) as Row[]).map((r) => [String(r.client_id), r]));
  const prevBy = new Map(((prev.data ?? []) as Row[]).map((r) => [String(r.client_id), r]));
  const sentBy = new Map<string, string>();
  for (const r of (sends.data ?? []) as Row[]) {
    const id = String(r.client_id);
    const at = String(r.sent_at);
    if (!sentBy.has(id) || at > sentBy.get(id)!) sentBy.set(id, at);
  }

  const rows: ReportRow[] = [];
  const untracked: ReportList["untracked"] = [];
  for (const c of (clients.data ?? []) as unknown as Row[]) {
    const id = String(c.id);
    const mine = siteList.filter((s) => s.clientId === id);
    if (!mine.length) {
      if (c.status === C.activeStatus) untracked.push({ id, name: String(c.name) });
      continue;
    }
    rows.push({
      client: { id, name: String(c.name), email: c.email ? String(c.email) : null },
      sites: mine,
      status: overallStatus(mine),
      cur: counts(curBy.get(id)),
      prev: counts(prevBy.get(id)),
      sentAt: sentBy.get(id) ?? null,
    });
  }

  // Most leads first: that's who you want to brag to.
  rows.sort((a, b) => b.cur.calls + b.cur.forms - (a.cur.calls + a.cur.forms) || b.cur.visits - a.cur.visits);

  const sum = (pick: (r: ReportRow) => Counts): Counts =>
    rows.reduce((t, r) => {
      const c = pick(r);
      return { views: t.views + c.views, visits: t.visits + c.visits, calls: t.calls + c.calls, forms: t.forms + c.forms };
    }, zero());

  return { ok: true, data: { rows, untracked, totals: { cur: sum((r) => r.cur), prev: sum((r) => r.prev) } } };
}

/* One client's report: the page, the PDF and the email all use this. */

export type PageRow = { path: string; views: number; calls: number; forms: number };
export type ReportSend = { id: string; month: string; toEmail: string; sentAt: string };

export type ClientReport = {
  client: { id: string; name: string; email: string | null; contactName: string | null; website: string | null };
  sites: SiteInfo[];
  month: ReportMonth;
  cur: Counts;
  prev: Counts;
  trend: TrendPoint[];
  pages: PageRow[];
  sources: SourceShare[];
  summary: string;
  sends: ReportSend[];
  /** Who it went to last time, else the client's email. Prefills the send form. */
  suggestedTo: string | null;
};

export async function getClientReport(clientId: string, monthParam?: string): Promise<Loaded<ClientReport> | null> {
  const db = await createSupabase();
  const month = parseMonth(monthParam);
  const iso = (d: Date) => d.toISOString();

  const { data: c, error: cErr } = await db
    .from(C.table)
    .select(selectAs(C.columns, ["id", "name", "email", "contactName", "website"]))
    .eq(C.columns.id, clientId)
    .maybeSingle();
  if (cErr) return { ok: false, issue: toIssue("clients", cErr) };
  if (!c) return null;
  const client = c as unknown as Row;

  const args = { p_client: clientId };
  const [sites, trendRes, prevRes, pages, sources, sends] = await Promise.all([
    db.from("client_sites").select(siteCols).eq("client_id", clientId).order("created_at"),
    db.rpc("report_months", { ...args, p_from: iso(month.trendFrom), p_to: iso(month.to) }),
    // A whole month is already in the trend. A month in progress compares with the same days of last month.
    month.partial ? db.rpc("report_months", { ...args, p_from: iso(month.prevFrom), p_to: iso(month.prevTo) }) : null,
    db.rpc("report_pages", { ...args, p_from: iso(month.from), p_to: iso(month.to), p_limit: 10 }),
    db.rpc("report_sources", { ...args, p_from: iso(month.from), p_to: iso(month.to) }),
    db.from("report_sends").select("id, month, to_email, sent_at").eq("client_id", clientId).order("sent_at", { ascending: false }).limit(12),
  ]);

  for (const [name, r] of [
    ["client_sites", sites],
    ["report_months", trendRes],
    ["report_months", prevRes],
    ["report_pages", pages],
    ["report_sources", sources],
    ["report_sends", sends],
  ] as const) {
    if (r?.error) return { ok: false, issue: toIssue(name, r.error) };
  }

  const now = new Date();
  const trend = fillTrend(month.trend, ((trendRes.data ?? []) as Row[]).map((r) => ({ month: String(r.month), ...counts(r) })));
  const cur: Counts = trend[11];
  const prev: Counts = month.partial ? counts(((prevRes?.data ?? []) as Row[])[0]) : trend[10];

  const pageRows: PageRow[] = ((pages.data ?? []) as Row[]).map((r) => ({
    path: String(r.path),
    views: Number(r.views ?? 0),
    calls: Number(r.calls ?? 0),
    forms: Number(r.forms ?? 0),
  }));
  const shares = sourceShares(((sources.data ?? []) as Row[]).map((r) => ({ source: String(r.source), visits: Number(r.visits ?? 0) })));
  const sendRows: ReportSend[] = ((sends.data ?? []) as Row[]).map((r) => ({
    id: String(r.id),
    month: String(r.month).slice(0, 7),
    toEmail: String(r.to_email),
    sentAt: String(r.sent_at),
  }));

  const topPage = pageRows.find((p) => p.views > 0)?.path ?? null;
  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);

  return {
    ok: true,
    data: {
      client: {
        id: String(client.id),
        name: String(client.name),
        email: str(client.email),
        contactName: str(client.contactName),
        website: str(client.website),
      },
      sites: ((sites.data ?? []) as Row[]).map((r) => toSite(r, now)),
      month,
      cur: { views: cur.views, visits: cur.visits, calls: cur.calls, forms: cur.forms },
      prev: { views: prev.views, visits: prev.visits, calls: prev.calls, forms: prev.forms },
      trend,
      pages: pageRows,
      sources: shares,
      summary: summarize({ month, cur, prev, topPage, topSource: shares[0] ?? null }),
      sends: sendRows,
      suggestedTo: sendRows[0]?.toEmail ?? str(client.email),
    },
  };
}

/**
 * Sidebar badge: clients with a live site whose LAST month report hasn't gone out yet.
 * Zero on any error, so a missing table never breaks the nav.
 */
export async function countUnsentReports(): Promise<number> {
  try {
    const db = await createSupabase();
    const month = parseMonth(undefined);
    const [sites, sends] = await Promise.all([
      db.from("client_sites").select("client_id").eq("active", true).not("last_event_at", "is", null),
      db.from("report_sends").select("client_id").eq("month", `${month.key}-01`),
    ]);
    if (sites.error || sends.error) return 0;
    const sent = new Set(((sends.data ?? []) as Row[]).map((r) => String(r.client_id)));
    return new Set(((sites.data ?? []) as Row[]).map((r) => String(r.client_id)).filter((id) => !sent.has(id))).size;
  } catch {
    return 0;
  }
}
