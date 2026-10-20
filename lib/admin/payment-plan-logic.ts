import { addDays, dayKeyOf, dayNum } from "./project-logic";

/*
 * Pure payment plan math: how a fixed price splits into installments. No database, no Next, so the
 * new plan form can preview the split as you type and the server can check it the same way.
 */

export const MAX_INSTALLMENTS = 24;

export type Frequency = "month" | "2weeks" | "week";
export const frequencies: { value: Frequency; label: string }[] = [
  { value: "month", label: "Monthly" },
  { value: "2weeks", label: "Every 2 weeks" },
  { value: "week", label: "Weekly" },
];

export type ScheduleRow = { label: string; amountCents: number; dueOn: string | null };

/** Same day next month, clamped: Jan 31 → Feb 28. */
export function addMonths(key: string, months: number): string {
  const y = +key.slice(0, 4);
  const m = +key.slice(5, 7) - 1 + months;
  const d = +key.slice(8, 10);
  const last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return dayKeyOf(Math.round(Date.UTC(y, m, Math.min(d, last)) / 86_400_000));
}

function step(key: string, n: number, every: Frequency): string {
  if (every === "month") return addMonths(key, n);
  return addDays(key, n * (every === "week" ? 7 : 14));
}

/**
 * Splits evenly in whole dollars when the total is whole dollars ($2,000 / 3 = $668 + $666 + $666),
 * with the odd amount on the first payment so the last one is never the weird number.
 * A deposit, if given, is payment 1 and the rest splits over the remaining payments.
 */
export function splitSchedule({
  totalCents,
  count,
  depositCents = 0,
  firstDue,
  every,
}: {
  totalCents: number;
  count: number;
  depositCents?: number;
  firstDue: string | null;
  every: Frequency;
}): ScheduleRow[] {
  const n = Math.max(1, Math.min(MAX_INSTALLMENTS, Math.floor(count)));
  if (totalCents <= 0) return [];
  const deposit = n > 1 && depositCents > 0 && depositCents < totalCents ? depositCents : 0;
  const rest = totalCents - deposit;
  const parts = deposit ? n - 1 : n;
  const unit = rest % 100 === 0 ? 100 : 1;
  const base = Math.floor(rest / unit / parts) * unit;
  const amounts = Array.from({ length: parts }, () => base);
  amounts[0] += rest - base * parts;
  if (deposit) amounts.unshift(deposit);

  return amounts.map((amountCents, i) => ({
    label: n === 1 ? "Paid in full" : i === 0 && deposit ? "Deposit" : i === n - 1 ? "Final payment" : `Payment ${i + 1}`,
    amountCents,
    dueOn: firstDue ? step(firstDue, i, every) : null,
  }));
}

/** "$1,250.50" / "1250.5" / "1,250" → cents. Null for blank, NaN for junk. */
export function parseDollars(v: string | null | undefined): number | null {
  const s = (v ?? "").replace(/[$,\s]/g, "");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : NaN;
}

export const isOverdue = (dueOn: string | null, today: string) => Boolean(dueOn) && dayNum(dueOn!) < dayNum(today);
