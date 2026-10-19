import { TIME_ZONE } from "./schema";

const usdFmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const usdCompact = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});
const numFmt = new Intl.NumberFormat("en-US");

export function usd(cents: number, compact = false): string {
  const dollars = cents / 100;
  return compact && Math.abs(dollars) >= 10_000 ? usdCompact.format(dollars) : usdFmt.format(dollars);
}

export function num(n: number): string {
  return numFmt.format(n);
}

/** "33%" or "8.2%". The sign is shown with an arrow, not a minus. */
export function formatPct(p: number): string {
  const abs = Math.abs(p);
  return `${abs >= 10 || abs === 0 ? Math.round(abs) : abs.toFixed(1)}%`;
}

const shortFmt = new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, month: "short", day: "numeric" });
const shortYearFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  month: "short",
  day: "numeric",
  year: "numeric",
});
const fullFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZoneName: "short",
});

export function shortDate(d: Date, now: Date = new Date()): string {
  return d.getFullYear() === now.getFullYear() ? shortFmt.format(d) : shortYearFmt.format(d);
}

export function fullDateTime(d: Date): string {
  return fullFmt.format(d);
}

/** "just now", "12m ago", "3h ago", "Yesterday", "4d ago", then a plain date. */
export function relativeTime(d: Date, now: Date = new Date()): string {
  const s = Math.round((now.getTime() - d.getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.round(h / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return shortDate(d, now);
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const letters = parts.length === 1 ? parts[0].slice(0, 2) : parts[0][0] + parts[parts.length - 1][0];
  return letters.toUpperCase();
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
}

/** Handles both full timestamps and date-only strings ("2026-11-01" would otherwise land on Oct 31 in Orlando). */
export function toDate(v: string): Date {
  return new Date(/^\d{4}-\d{2}-\d{2}$/.test(v) ? `${v}T12:00:00Z` : v);
}

/** "in 3 days", "today", "2 days ago". For renewals, where the direction matters. */
export function daysFrom(v: string, now: Date = new Date()): string {
  const d = Math.round((toDate(v).getTime() - now.getTime()) / 86_400_000);
  if (d === 0) return "today";
  if (d === 1) return "tomorrow";
  if (d === -1) return "yesterday";
  return d > 0 ? `in ${d} days` : `${-d} days ago`;
}
