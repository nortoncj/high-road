import "server-only";
import { checkBrevo, checkCalendly, type Connection } from "./connections";
import type { Issue, Loaded } from "./data";
import { tables } from "./schema";
import { createSupabase } from "./supabase";

export type TeamMember = { id: string; name: string; email: string | null; role: "owner" | "admin"; leadAlerts: boolean; since: string };
export type Invite = { id: string; email: string; name: string | null; createdAt: string; expiresAt: string; expired: boolean };
export type Team = { members: TeamMember[]; invites: Invite[] };
export type AlertStats = { lastSentAt: string | null; last30: number; webhookReady: boolean };

type Row = Record<string, unknown>;
const A = tables.admins;

function toIssue(table: string, error: { code?: string; message: string }): Issue {
  const missing = error.code === "42P01" || error.code === "42703" || error.code === "PGRST205" || /does not exist|could not find/i.test(error.message);
  if (!missing) console.error(`[admin] ${table}:`, error.code, error.message);
  return { table, message: error.message, missing };
}

export async function getTeam(): Promise<Loaded<Team>> {
  const db = await createSupabase();
  const [m, i] = await Promise.all([
    db.from(A.table).select(`id:${A.columns.userId}, name:${A.columns.fullName}, email:${A.columns.email}, role:${A.columns.role}, leadAlerts:${A.columns.leadAlerts}, since:${A.columns.createdAt}`).order(A.columns.createdAt),
    db.from("admin_invites").select("id, email, full_name, created_at, expires_at").is("accepted_at", null).order("created_at", { ascending: false }),
  ]);
  if (m.error) return { ok: false, issue: toIssue("admin_users", m.error) };
  if (i.error) return { ok: false, issue: toIssue("admin_invites", i.error) };
  const now = Date.now();
  return {
    ok: true,
    data: {
      members: ((m.data ?? []) as Row[]).map((r) => {
        const email = r.email ? String(r.email) : null;
        return {
          id: String(r.id),
          name: (r.name as string | null)?.trim() || email?.split("@")[0] || "Admin",
          email,
          role: r.role === "owner" ? "owner" : "admin",
          leadAlerts: r.leadAlerts !== false,
          since: String(r.since),
        };
      }),
      invites: ((i.data ?? []) as Row[]).map((r) => ({
        id: String(r.id),
        email: String(r.email),
        name: (r.full_name as string | null) ?? null,
        createdAt: String(r.created_at),
        expiresAt: String(r.expires_at),
        expired: new Date(String(r.expires_at)).getTime() < now,
      })),
    },
  };
}

const latest = async (table: string, col: string, filter?: (q: any) => any): Promise<string | null> => {
  const db = await createSupabase();
  let q = db.from(table).select(col).order(col, { ascending: false }).limit(1);
  if (filter) q = filter(q);
  const { data, error } = await q;
  if (error) return null;
  const row = ((data ?? []) as unknown as Row[])[0];
  return row ? String(row[col]) : null;
};

export function alertWebhookReady(): boolean {
  return Boolean(process.env.LEAD_ALERT_SECRET && (process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY));
}

export async function getAlertStats(): Promise<AlertStats> {
  const db = await createSupabase();
  const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const [last, count] = await Promise.all([
    latest("lead_alerts_sent", "sent_at"),
    db.from("lead_alerts_sent").select("lead_id", { count: "exact", head: true }).gte("sent_at", since),
  ]);
  return { lastSentAt: last, last30: count.error ? 0 : (count.count ?? 0), webhookReady: alertWebhookReady() };
}

/** Both checks run at once; each has its own timeout, so a slow Calendly can't hang the page. */
export async function getConnections(): Promise<Connection[]> {
  const L = tables.leads;
  const [lastReport, lastAlert, lastBooking, anyLead] = await Promise.all([
    latest("report_sends", "sent_at"),
    latest("lead_alerts_sent", "sent_at"),
    latest(L.table, L.columns.createdAt, (q) => q.or(`${L.columns.source}.ilike.%calendly%,${L.columns.source}.ilike.%book%`)),
    latest(L.table, L.columns.createdAt),
  ]);
  return Promise.all([checkCalendly({ lastBooking, anyLeads: Boolean(anyLead) }), checkBrevo({ lastReport, lastAlert })]);
}
