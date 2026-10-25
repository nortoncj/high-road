import type { LeadForAlert } from "./admin-email";
import { tables } from "./schema";

/**
 * Pure helpers for /api/alerts/lead, kept out of the route so they're testable.
 * Supabase's database webhook posts { type, table, schema, record, old_record }.
 */

export function secretMatches(given: string | null, expected: string | undefined, eq: (a: Uint8Array, b: Uint8Array) => boolean): boolean {
  if (!given || !expected || expected.length < 16) return false;
  const a = new TextEncoder().encode(given);
  const b = new TextEncoder().encode(expected);
  return a.length === b.length && eq(a, b);
}

/** Pulls the lead out of the webhook payload using the column names in schema.ts. Null if it isn't a leads insert. */
export function leadFromPayload(body: unknown): LeadForAlert | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (b.type !== "INSERT" || b.table !== tables.leads.table) return null;
  const r = b.record as Record<string, unknown> | null;
  if (!r || r[tables.leads.columns.id] == null) return null;
  const c = tables.leads.columns;
  const s = (k: string) => {
    const v = r[k];
    return typeof v === "string" && v.trim() ? v.trim().slice(0, 2000) : v == null ? null : String(v);
  };
  return {
    id: String(r[c.id]),
    name: s(c.name),
    email: s(c.email),
    phone: s(c.phone),
    website: s(c.website),
    service: s(c.service),
    source: s(c.source),
    message: s(c.message),
  };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const validEmail = (e: string | null | undefined): e is string => Boolean(e && EMAIL_RE.test(e));
