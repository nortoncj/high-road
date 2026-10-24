import { zonedDay, zonedMidnight } from "./range";
import { sourceLabel } from "./track-logic";

/*
 * Pure report math: which month, what it's compared to, the 12 month series, the plain-English summary.
 * Shared by the pages, the PDF and the email, so all three always say the same thing.
 */

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY_MS = 86_400_000;

export type Ym = { y: number; m: number };

export const ymKey = ({ y, m }: Ym) => `${y}-${String(m).padStart(2, "0")}`;
export const shiftYm = ({ y, m }: Ym, by: number): Ym => {
  const i = y * 12 + (m - 1) + by;
  return { y: Math.floor(i / 12), m: (i % 12) + 1 };
};
export const monthName = ({ m }: Ym) => MONTHS[m - 1];
export const monthLabel = (ym: Ym) => `${monthName(ym)} ${ym.y}`;
export const monthShort = (ym: Ym) => MONTHS[ym.m - 1].slice(0, 3);
const start = ({ y, m }: Ym) => zonedMidnight({ y, m, d: 1 });

export type ReportMonth = {
  ym: Ym;
  key: string;
  label: string;
  from: Date;
  to: Date;
  /** Still in progress: `to` is now, and the comparison is the same days of last month. */
  partial: boolean;
  prev: Ym;
  prevFrom: Date;
  prevTo: Date;
  /** "vs August" or "vs Sep 1 to 24". */
  compareLabel: string;
  /** First of the 12 month window that ends with this month. */
  trendFrom: Date;
  trend: Ym[];
};

/**
 * `?m=2026-09`. Default is LAST month, because that's the one you send.
 * Future months clamp to this month. Older than 24 months clamps too.
 */
export function parseMonth(param: string | undefined, now: Date = new Date()): ReportMonth {
  const today = zonedDay(now);
  const current: Ym = { y: today.y, m: today.m };
  let ym = shiftYm(current, -1);
  const match = param && /^(\d{4})-(\d{2})$/.exec(param);
  if (match) {
    const want = { y: Number(match[1]), m: Number(match[2]) };
    if (want.m >= 1 && want.m <= 12) {
      const idx = (v: Ym) => v.y * 12 + v.m;
      ym = idx(want) > idx(current) ? current : idx(want) < idx(current) - 24 ? shiftYm(current, -24) : want;
    }
  }

  const partial = ym.y === current.y && ym.m === current.m;
  const from = start(ym);
  const to = partial ? now : start(shiftYm(ym, 1));
  const prev = shiftYm(ym, -1);
  const prevFrom = start(prev);
  let prevTo = from;
  let compareLabel = `vs ${monthName(prev)}`;
  if (partial) {
    // Same stretch of last month, so the 24th isn't compared with a whole month.
    const elapsed = to.getTime() - from.getTime();
    prevTo = new Date(Math.min(prevFrom.getTime() + elapsed, from.getTime()));
    const lastDay = Math.max(1, Math.ceil(elapsed / DAY_MS));
    compareLabel = `vs ${monthShort(prev)} 1 to ${Math.min(lastDay, 31)}`;
  }
  const trend = Array.from({ length: 12 }, (_, i) => shiftYm(ym, i - 11));

  return {
    ym,
    key: ymKey(ym),
    label: partial ? `${monthLabel(ym)} so far` : monthLabel(ym),
    from,
    to,
    partial,
    prev,
    prevFrom,
    prevTo,
    compareLabel,
    trendFrom: start(trend[0]),
    trend,
  };
}

/** The last 13 months, newest first, for the picker. */
export function monthOptions(now: Date = new Date()): { key: string; label: string }[] {
  const t = zonedDay(now);
  const cur = { y: t.y, m: t.m };
  return Array.from({ length: 13 }, (_, i) => {
    const ym = shiftYm(cur, -i);
    return { key: ymKey(ym), label: i === 0 ? `${monthLabel(ym)} (so far)` : monthLabel(ym) };
  });
}

export type Counts = { views: number; visits: number; calls: number; forms: number };
export const zero = (): Counts => ({ views: 0, visits: 0, calls: 0, forms: 0 });
export const leadsOf = (c: Counts) => c.calls + c.forms;

/** Percent change. null when there's nothing to compare against (0 last month). */
export function pctChange(cur: number, prev: number): number | null {
  if (prev === 0) return cur === 0 ? 0 : null;
  return ((cur - prev) / prev) * 100;
}

export type TrendPoint = Counts & { key: string; label: string; short: string };

/** Lines up whatever months came back from Postgres with the 12 month window, zero filling gaps. */
export function fillTrend(trend: Ym[], rows: { month: string; views: number; visits: number; calls: number; forms: number }[]): TrendPoint[] {
  const byKey = new Map(rows.map((r) => [r.month.slice(0, 7), r]));
  return trend.map((ym) => {
    const r = byKey.get(ymKey(ym));
    return {
      key: ymKey(ym),
      label: monthLabel(ym),
      short: monthShort(ym),
      views: Number(r?.views ?? 0),
      visits: Number(r?.visits ?? 0),
      calls: Number(r?.calls ?? 0),
      forms: Number(r?.forms ?? 0),
    };
  });
}

/** "/" is "Home". "/services/ac-repair" stays a path: clients recognize their own URLs. */
export const pageLabel = (path: string) => (path === "/" ? "Home" : path);

const plural = (n: number, one: string, many = `${one}s`) => `${n.toLocaleString("en-US")} ${n === 1 ? one : many}`;

export type SourceShare = { id: string; label: string; visits: number; share: number };

export function sourceShares(rows: { source: string; visits: number }[], top = 6): SourceShare[] {
  const total = rows.reduce((a, r) => a + Number(r.visits), 0);
  if (!total) return [];
  const sorted = rows.map((r) => ({ id: r.source, visits: Number(r.visits) })).sort((a, b) => b.visits - a.visits);
  const head = sorted.slice(0, top);
  const rest = sorted.slice(top).reduce((a, r) => a + r.visits, 0);
  const out = head.map((r) => ({ ...r, label: sourceLabel(r.id), share: (r.visits / total) * 100 }));
  if (rest) out.push({ id: "other", label: "Everything else", visits: rest, share: (rest / total) * 100 });
  return out;
}

/**
 * Two or three plain sentences a business owner can read in five seconds.
 * Only states what the numbers show. No hype, no guesses about why.
 */
export function summarize(input: {
  month: ReportMonth;
  cur: Counts;
  prev: Counts;
  topPage?: string | null;
  topSource?: SourceShare | null;
}): string {
  const { month, cur, prev, topPage, topSource } = input;
  const when = month.partial ? `so far in ${monthName(month.ym)}` : `in ${monthName(month.ym)}`;
  const leads = leadsOf(cur);
  const prevLeads = leadsOf(prev);
  const parts: string[] = [];

  if (cur.visits === 0 && leads === 0) {
    return `No visits were recorded ${when}.`;
  }

  if (leads === 0) {
    parts.push(`Your website had ${plural(cur.visits, "visit")} ${when}, but no calls or form fills came from it.`);
  } else {
    const how = [cur.calls ? plural(cur.calls, "call tap") : "", cur.forms ? plural(cur.forms, "form fill") : ""].filter(Boolean).join(" and ");
    parts.push(`Your website brought in ${plural(leads, "lead")} ${when} (${how}) from ${plural(cur.visits, "visit")}.`);
  }

  const change = pctChange(leads, prevLeads);
  const prevName = monthName(month.prev);
  const than = month.partial ? `the same days of ${prevName}` : prevName;
  if (leads > 0 || prevLeads > 0) {
    if (leads === prevLeads) parts.push(`That's the same as ${than}.`);
    // Small numbers get counts, not percents: "down 50%" for 2 to 1 scares people for no reason.
    else if (change === null || Math.max(leads, prevLeads) < 10)
      parts.push(`That's ${leads > prevLeads ? "up" : "down"} from ${prevLeads === 0 ? "none" : prevLeads} in ${than}.`);
    else parts.push(`That's ${change > 0 ? "up" : "down"} ${Math.round(Math.abs(change))}% from ${than}.`);
  }

  const bits: string[] = [];
  if (topSource && topSource.id !== "other" && topSource.share >= 20) {
    bits.push(`${topSource.label} sent the most visitors (${Math.round(topSource.share)}%)`);
  }
  if (topPage) bits.push(`the most visited page was ${topPage === "/" ? "your home page" : topPage}`);
  if (bits.length) {
    const s = bits.join(", and ");
    parts.push(`${s.charAt(0).toUpperCase()}${s.slice(1)}.`);
  }
  return parts.join(" ");
}

export type Change = { text: string; dir: "up" | "down" | "flat" | "none" };

/**
 * How a number moved, said the same way on the page, the PDF and the email.
 * Under 10 it's the plain difference ("+2"): 1 to 3 isn't "+200%" to anyone but a spreadsheet.
 * Nothing either month is "none", so it can be hidden instead of shouting "0%".
 */
export function formatChange(cur: number, prev: number): Change {
  if (cur === 0 && prev === 0) return { text: "", dir: "none" };
  if (cur === prev) return { text: "Same", dir: "flat" };
  const dir = cur > prev ? "up" : "down";
  if (Math.max(cur, prev) < 10) return { text: `${cur > prev ? "+" : "-"}${Math.abs(cur - prev)}`, dir };
  return { text: changeText(pctChange(cur, prev)), dir };
}

/** "+25%", "-8%", "New", "Same". Used in the PDF where arrows aren't available. */
export function changeText(change: number | null): string {
  if (change === null) return "New";
  if (Math.abs(change) < 0.5) return "Same";
  return `${change > 0 ? "+" : "-"}${Math.abs(change) >= 10 ? Math.round(Math.abs(change)) : Math.abs(change).toFixed(1)}%`;
}
