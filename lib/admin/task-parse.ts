import { addDays, dayNum } from "./project-logic";

/*
 * Quick add, Todoist style. Type "Send Ruiz the invoice fri #ruiz" and you get:
 *   title "Send Ruiz the invoice", due this Friday, linked to Ruiz Heating & Air.
 * Pure function: runs in the browser as you type (for the preview chips) and nowhere else,
 * so what you see in the chips is exactly what gets saved.
 */

export type Ref = { id: string; name: string; kind: "client" | "project"; clientId?: string | null };

export type Parsed = {
  title: string;
  dueDate: string | null;
  /** The words that became the date, so the chip can say what it understood. */
  dueText: string | null;
  ref: Ref | null;
  refText: string | null;
};

const WEEKDAY = /\b(?:(?:on|by|due)\s+)?(mon(?:day)?|tue(?:s(?:day)?)?|wed(?:nesday)?|thu(?:r(?:s(?:day)?)?)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)\b/i;
const WEEKDAY_INDEX: Record<string, number> = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const MONTH_DAY = /\b(?:(?:on|by|due)\s+)?(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?\b/i;
const SLASH = /\b(?:(?:on|by|due)\s+)?(\d{1,2})\/(\d{1,2})(?:\/(\d{2}|\d{4}))?\b/;

/** 1970-01-01 was a Thursday (4). */
const weekdayOf = (key: string) => (((dayNum(key) + 4) % 7) + 7) % 7;

function validDate(y: number, m: number, d: number): string | null {
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return dt.toISOString().slice(0, 10);
}

/** A month/day with no year means the next time it comes around, never last March. */
function upcoming(m: number, d: number, today: string): string | null {
  const y = Number(today.slice(0, 4));
  const thisYear = validDate(y, m, d);
  if (thisYear && dayNum(thisYear) >= dayNum(today)) return thisYear;
  return validDate(y + 1, m, d);
}

type Hit = { date: string; match: string };

function findDate(text: string, today: string): Hit | null {
  let m: RegExpMatchArray | null;

  if ((m = text.match(/\b(?:(?:due|by)\s+)?(today|tonight|tod)\b/i))) return { date: today, match: m[0] };
  if ((m = text.match(/\b(?:(?:due|by)\s+)?(tomorrow|tmrw|tmr)\b/i))) return { date: addDays(today, 1), match: m[0] };
  if ((m = text.match(/\bnext\s+week\b/i))) {
    const w = weekdayOf(today);
    return { date: addDays(today, ((8 - w) % 7) || 7), match: m[0] };
  }
  if ((m = text.match(/\bin\s+(\d{1,2})\s+(day|days|week|weeks)\b/i))) {
    const n = Number(m[1]) * (m[2].toLowerCase().startsWith("week") ? 7 : 1);
    return { date: addDays(today, n), match: m[0] };
  }
  if ((m = text.match(SLASH))) {
    const mo = Number(m[1]);
    const d = Number(m[2]);
    const y = m[3] ? (m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3])) : null;
    const date = y ? validDate(y, mo, d) : upcoming(mo, d, today);
    if (date) return { date, match: m[0] };
  }
  if ((m = text.match(MONTH_DAY))) {
    const mo = MONTHS.indexOf(m[1].toLowerCase().slice(0, 3)) + 1;
    const date = upcoming(mo, Number(m[2]), today);
    if (date) return { date, match: m[0] };
  }
  if ((m = text.match(WEEKDAY))) {
    // "fri" on a Friday means today: that's what you mean when you say it out loud.
    const target = WEEKDAY_INDEX[m[1].toLowerCase().slice(0, 3)];
    const diff = (target - weekdayOf(today) + 7) % 7;
    return { date: addDays(today, diff), match: m[0] };
  }
  return null;
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/** #ruiz → Ruiz Heating & Air. Clients win over projects (project names repeat: "New website"). */
function findRef(text: string, refs: Ref[]): { ref: Ref; match: string } | null {
  const m = text.match(/(?:^|\s)#([\p{L}\p{N}&'._-]+)/u);
  if (!m) return null;
  const token = norm(m[1]);
  if (!token) return null;
  const rank = (r: Ref) => {
    const n = norm(r.name);
    return n.startsWith(token) ? 0 : n.includes(token) ? 1 : 2;
  };
  for (const kind of ["client", "project"] as const) {
    const hits = refs
      .filter((r) => r.kind === kind && rank(r) < 2)
      .sort((a, b) => rank(a) - rank(b) || a.name.length - b.name.length);
    if (hits[0]) return { ref: hits[0], match: m[0] };
  }
  return null;
}

export function parseQuickAdd(
  input: string,
  today: string,
  refs: Ref[],
  opts: { date?: boolean; ref?: boolean } = {},
): Parsed {
  let text = input;
  let dueDate: string | null = null;
  let dueText: string | null = null;
  let ref: Ref | null = null;
  let refText: string | null = null;

  if (opts.ref !== false) {
    const r = findRef(text, refs);
    if (r) {
      ref = r.ref;
      refText = r.match.trim();
      text = text.replace(r.match, " ");
    }
  }
  if (opts.date !== false) {
    const d = findDate(text, today);
    if (d) {
      dueDate = d.date;
      dueText = d.match.trim();
      text = text.replace(d.match, " ");
    }
  }

  const title = text.replace(/\s+/g, " ").replace(/^[\s:;,.-]+|[\s:;,-]+$/g, "").trim();
  return { title: title || input.trim(), dueDate, dueText, ref, refText };
}
