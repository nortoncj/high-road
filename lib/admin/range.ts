import { TIME_ZONE } from "./schema";

/**
 * Date ranges live in the URL (`?range=30d` or `?from=2026-09-01&to=2026-09-30`) so the server
 * fetches the right data, the back button works, and a link to a view is shareable.
 *
 * Days are counted in your time zone, not the server's. Lightsail runs on UTC, and without this
 * a lead at 9pm Orlando time would land on tomorrow.
 */

export const rangePresets = [
  { id: "7d", label: "Last 7 days", days: 7 },
  { id: "30d", label: "Last 30 days", days: 30 },
  { id: "90d", label: "Last 90 days", days: 90 },
  { id: "mtd", label: "Month to date" },
  { id: "ytd", label: "Year to date" },
] as const;

export type RangePresetId = (typeof rangePresets)[number]["id"];
export const DEFAULT_RANGE: RangePresetId = "30d";

export type DateRange = {
  preset: RangePresetId | "custom";
  /** Start instant, inclusive. */
  from: Date;
  /** End instant, exclusive (midnight after the last day). */
  to: Date;
  prevFrom: Date;
  prevTo: Date;
  days: number;
  /** First and last calendar day, inclusive, as YYYY-MM-DD. */
  fromDay: string;
  toDay: string;
  label: string;
  compareLabel: string;
};

export type SearchParams = Record<string, string | string[] | undefined>;

const DAY_MS = 86_400_000;
const MAX_DAYS = 366;

type Ymd = { y: number; m: number; d: number };

function zonedParts(at: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(at);
  const p: Record<string, number> = {};
  for (const part of parts) if (part.type !== "literal") p[part.type] = Number(part.value);
  return { y: p.year, m: p.month, d: p.day, h: p.hour, mi: p.minute, s: p.second };
}

/** How far TIME_ZONE is from UTC at a given instant, in ms. Handles DST. */
function tzOffset(at: Date): number {
  const p = zonedParts(at);
  const asUtc = Date.UTC(p.y, p.m - 1, p.d, p.h, p.mi, p.s);
  return asUtc - Math.floor(at.getTime() / 1000) * 1000;
}

/** The UTC instant of midnight, in TIME_ZONE, at the start of a calendar day. */
export function zonedMidnight({ y, m, d }: Ymd): Date {
  const guess = Date.UTC(y, m - 1, d);
  const first = tzOffset(new Date(guess));
  let t = guess - first;
  const second = tzOffset(new Date(t));
  if (second !== first) t = guess - second;
  return new Date(t);
}

/** The calendar day an instant falls on in TIME_ZONE. */
export function zonedDay(at: Date): Ymd {
  const { y, m, d } = zonedParts(at);
  return { y, m, d };
}

export function dayKey({ y, m, d }: Ymd): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function parseDayKey(s: string | undefined): Ymd | null {
  const match = s && /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!match) return null;
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const check = new Date(Date.UTC(y, m - 1, d));
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== m - 1 || check.getUTCDate() !== d) return null;
  return { y, m, d };
}

function shiftDay({ y, m, d }: Ymd, days: number): Ymd {
  const t = new Date(Date.UTC(y, m - 1, d) + days * DAY_MS);
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}

function compareYmd(a: Ymd, b: Ymd): number {
  return Date.UTC(a.y, a.m - 1, a.d) - Date.UTC(b.y, b.m - 1, b.d);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function dayLabel(day: Ymd, today: Ymd): string {
  return `${MONTHS[day.m - 1]} ${day.d}${day.y === today.y ? "" : `, ${day.y}`}`;
}

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export function parseRange(params: SearchParams, now: Date = new Date()): DateRange {
  const today = zonedDay(now);
  let preset: DateRange["preset"] = DEFAULT_RANGE;
  let fromDay: Ymd;
  let toDay: Ymd = today;

  const customFrom = parseDayKey(first(params.from));
  const customTo = parseDayKey(first(params.to));
  const presetParam = first(params.range);

  if (customFrom && customTo) {
    preset = "custom";
    // No future days: there's nothing there yet.
    fromDay = compareYmd(customFrom, today) > 0 ? today : customFrom;
    toDay = compareYmd(customTo, today) > 0 ? today : customTo;
    if (compareYmd(fromDay, toDay) > 0) [fromDay, toDay] = [toDay, fromDay];
    if (compareYmd(toDay, fromDay) / DAY_MS + 1 > MAX_DAYS) fromDay = shiftDay(toDay, -(MAX_DAYS - 1));
  } else {
    const found = rangePresets.find((p) => p.id === presetParam) ?? rangePresets.find((p) => p.id === DEFAULT_RANGE)!;
    preset = found.id;
    if (found.id === "mtd") fromDay = { y: today.y, m: today.m, d: 1 };
    else if (found.id === "ytd") fromDay = { y: today.y, m: 1, d: 1 };
    else fromDay = shiftDay(today, -((found as { days: number }).days - 1));
  }

  const from = zonedMidnight(fromDay);
  const to = zonedMidnight(shiftDay(toDay, 1));
  // Round, because a DST switch makes one day 23 or 25 hours long.
  const days = Math.max(1, Math.round((to.getTime() - from.getTime()) / DAY_MS));
  const prevFrom = zonedMidnight(shiftDay(fromDay, -days));

  const presetLabel = rangePresets.find((p) => p.id === preset)?.label;
  const label =
    presetLabel ??
    (compareYmd(fromDay, toDay) === 0 ? dayLabel(fromDay, today) : `${dayLabel(fromDay, today)} – ${dayLabel(toDay, today)}`);

  return {
    preset,
    from,
    to,
    prevFrom,
    prevTo: from,
    days,
    fromDay: dayKey(fromDay),
    toDay: dayKey(toDay),
    label,
    compareLabel: days === 1 ? "vs the day before" : `vs previous ${days} days`,
  };
}

/** Query string that keeps the current range when linking between pages. */
export function rangeQuery(range: DateRange): string {
  if (range.preset === "custom") return `from=${range.fromDay}&to=${range.toDay}`;
  if (range.preset === DEFAULT_RANGE) return "";
  return `range=${range.preset}`;
}

/** Morning, afternoon or evening in TIME_ZONE, for the greeting. */
export function dayPart(now: Date = new Date()): "morning" | "afternoon" | "evening" {
  const { h } = zonedParts(now);
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
