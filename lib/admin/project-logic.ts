import { projectTemplate } from "@/content/admin";
import type { ProjectStatus } from "./schema";

/*
 * Pure project logic: schedule math and "is this slipping?". No database, no Next, so it's easy
 * to test and safe to import from anywhere.
 */

const DAY = 86_400_000;

/** "2026-10-19" ↔ day number. Date-only math in UTC so time zones never shift a day. */
export const dayNum = (key: string) => Math.round(Date.UTC(+key.slice(0, 4), +key.slice(5, 7) - 1, +key.slice(8, 10)) / DAY);
export const dayKeyOf = (n: number) => new Date(n * DAY).toISOString().slice(0, 10);
export const addDays = (key: string, days: number) => dayKeyOf(dayNum(key) + days);

export type TemplateRow = { phase: string; title: string; position: number; dueDate: string | null };

/**
 * The checklist for a new project. With both a start and a launch date, each phase's items get a
 * due date at that phase's spot on the timeline (Copy lands halfway, the launch checklist right
 * before launch). Asset collection is pinned to 3 days in, because that's the thing clients stall on.
 */
export function templateRows(start: string | null, due: string | null): TemplateRow[] {
  const span = start && due ? Math.max(0, dayNum(due) - dayNum(start)) : null;
  const rows: TemplateRow[] = [];
  let position = 0;
  for (const phase of projectTemplate) {
    for (const title of phase.items) {
      let dueDate: string | null = null;
      if (start && span !== null) {
        const offset = /assets|drive folder/i.test(title) ? Math.min(3, span) : Math.round(phase.at * span);
        dueDate = addDays(start, offset);
      }
      rows.push({ phase: phase.phase, title, position: (position += 10), dueDate });
    }
  }
  return rows;
}

export const launchPhases = new Set(projectTemplate.filter((p) => p.launch).map((p) => p.phase));
export const phaseOrder = projectTemplate.map((p) => p.phase);

export type TaskLike = { done: boolean; dueDate: string | null; title: string; phase: string; position: number };

/** Worst first: past its launch date, then checklist items overdue, then due within a week. */
export type ProjectHealth = "late" | "behind" | "due-soon" | "ok" | "done";

export function projectHealth(
  p: { status: ProjectStatus; dueDate: string | null; tasks: TaskLike[] },
  today: string,
): { health: ProjectHealth; daysLate: number; overdueTasks: number } {
  if (p.status === "done" || p.status === "cancelled") return { health: "done", daysLate: 0, overdueTasks: 0 };
  const t = dayNum(today);
  const overdueTasks = p.tasks.filter((x) => !x.done && x.dueDate && dayNum(x.dueDate) < t).length;
  if (p.dueDate && dayNum(p.dueDate) < t) return { health: "late", daysLate: t - dayNum(p.dueDate), overdueTasks };
  if (overdueTasks > 0) return { health: "behind", daysLate: 0, overdueTasks };
  if (p.dueDate && dayNum(p.dueDate) - t <= 7) return { health: "due-soon", daysLate: 0, overdueTasks };
  return { health: "ok", daysLate: 0, overdueTasks };
}

/** First unchecked item in checklist order. That's what the card shows as "Next". */
export function nextTask(tasks: TaskLike[]): TaskLike | null {
  return [...tasks].sort((a, b) => a.position - b.position).find((x) => !x.done) ?? null;
}

/** Due chip wording and tone, relative to today. */
export function dueLabel(due: string, today: string): { text: string; tone: "late" | "soon" | "normal" } {
  const d = dayNum(due) - dayNum(today);
  if (d < 0) return { text: d === -1 ? "1 day late" : `${-d} days late`, tone: "late" };
  if (d === 0) return { text: "Due today", tone: "soon" };
  if (d === 1) return { text: "Due tomorrow", tone: "soon" };
  if (d <= 7) {
    const wd = new Date(dayNum(due) * DAY).toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
    return { text: `Due ${wd}`, tone: "soon" };
  }
  const md = new Date(dayNum(due) * DAY).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  return { text: `Due ${md}`, tone: "normal" };
}
