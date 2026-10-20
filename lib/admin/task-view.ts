import { dayNum } from "./project-logic";

/** Shared by the server (counts) and the browser (instant regrouping after a tap). No server imports. */

export type Todo = {
  key: string;
  kind: "task" | "checklist";
  id: string;
  title: string;
  notes: string | null;
  dueDate: string | null;
  done: boolean;
  doneAt: string | null;
  client: { id: string; name: string } | null;
  project: { id: string; name: string } | null;
  phase: string | null;
};

export type TodoView = "today" | "upcoming" | "someday" | "done";
export const todoViews: TodoView[] = ["today", "upcoming", "someday", "done"];

export function viewOf(t: Todo, day: string): TodoView {
  if (t.done) return "done";
  if (!t.dueDate) return "someday";
  return dayNum(t.dueDate) <= dayNum(day) ? "today" : "upcoming";
}

/** Oldest due first (overdue floats up), tasks before checklist items on the same day. */
export function sortTodos(a: Todo, b: Todo): number {
  if (a.done && b.done) return (b.doneAt ?? "").localeCompare(a.doneAt ?? "");
  return (
    (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999") ||
    (a.kind === b.kind ? 0 : a.kind === "task" ? -1 : 1) ||
    a.title.localeCompare(b.title)
  );
}
