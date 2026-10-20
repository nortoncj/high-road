import "server-only";
import { createSupabase } from "./supabase";
import type { Issue, Loaded } from "./data";
import { addDays, dayNum } from "./project-logic";
import { sortTodos, viewOf, type Todo, type TodoView } from "./task-view";
import { today } from "./projects";
import type { Ref } from "./task-parse";

export type { Todo, TodoView } from "./task-view";
import { selectAs, tables } from "./schema";

/*
 * One list for "what do I do today": your standalone tasks plus any project checklist item with a
 * due date coming up. Checklist items you can check off and reschedule from here; anything else
 * about them (renaming, deleting) happens on the project.
 */

type Row = Record<string, unknown>;
const K = tables.tasks;
const T = tables.projectTasks;
const P = tables.projects;
const C = tables.clients;

export type TodoList = {
  items: Todo[];
  counts: Record<TodoView, number>;
  overdue: number;
  today: string;
};

/** Checklist items show in Upcoming this far ahead. Further out they'd just be noise. */
const CHECKLIST_HORIZON_DAYS = 14;
const DONE_DAYS = 7;

const str = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v.trim() : v == null ? null : String(v));
const named = (v: unknown) => {
  const r = v as Row | null;
  return r ? { id: String(r.id), name: str(r.name) ?? "Untitled" } : null;
};

const taskSelect = `${selectAs(K.columns)}, client:${C.table}(id:${C.columns.id}, name:${C.columns.name}), project:${P.table}(id:${P.columns.id}, name:${P.columns.name})`;
const checklistSelect = `${selectAs(T.columns, ["id", "title", "phase", "done", "doneAt", "dueDate"])}, project:${P.table}!inner(id:${P.columns.id}, name:${P.columns.name}, status:${P.columns.status}, client:${C.table}(id:${C.columns.id}, name:${C.columns.name}))`;
const closed = `(${P.closedStatuses.join(",")})`;

function fromTask(r: Row): Todo {
  return {
    key: `task:${String(r.id)}`,
    kind: "task",
    id: String(r.id),
    title: str(r.title) ?? "Untitled",
    notes: str(r.notes),
    dueDate: str(r.dueDate),
    done: Boolean(r.done),
    doneAt: str(r.doneAt),
    client: named(r.client),
    project: named(r.project),
    phase: null,
  };
}

function fromChecklist(r: Row): Todo {
  const project = r.project as Row | null;
  return {
    key: `check:${String(r.id)}`,
    kind: "checklist",
    id: String(r.id),
    title: str(r.title) ?? "Untitled",
    notes: null,
    dueDate: str(r.dueDate),
    done: Boolean(r.done),
    doneAt: str(r.doneAt),
    client: named(project?.client),
    project: named(project),
    phase: str(r.phase),
  };
}

function toIssue(table: string, error: { code?: string; message: string }): Issue {
  const missing = error.code === "42P01" || error.code === "PGRST205" || /does not exist|could not find/i.test(error.message);
  if (!missing) console.error(`[admin] ${table}:`, error.code, error.message);
  return { table, message: error.message, missing };
}

export async function listTodos(): Promise<Loaded<TodoList>> {
  const db = await createSupabase();
  const day = today();
  const doneSince = new Date(Date.now() - DONE_DAYS * 86_400_000).toISOString();

  const [open, doneTasks, checklist, doneChecklist] = await Promise.all([
    db.from(K.table).select(taskSelect).eq(K.columns.done, false),
    db.from(K.table).select(taskSelect).eq(K.columns.done, true).gte(K.columns.doneAt, doneSince),
    db
      .from(T.table)
      .select(checklistSelect)
      .eq(T.columns.done, false)
      .lte(T.columns.dueDate, addDays(day, CHECKLIST_HORIZON_DAYS))
      .not(`project.${P.columns.status}`, "in", closed),
    db
      .from(T.table)
      .select(checklistSelect)
      .eq(T.columns.done, true)
      .gte(T.columns.doneAt, doneSince)
      .not(T.columns.dueDate, "is", null),
  ]);
  if (open.error) return { ok: false, issue: toIssue(K.table, open.error) };

  const items = [
    ...((open.data ?? []) as unknown as Row[]).map(fromTask),
    ...((doneTasks.data ?? []) as unknown as Row[]).map(fromTask),
    // A missing project_tasks table just means no checklist items show up here.
    ...(checklist.error ? [] : ((checklist.data ?? []) as unknown as Row[]).map(fromChecklist)),
    ...(doneChecklist.error ? [] : ((doneChecklist.data ?? []) as unknown as Row[]).map(fromChecklist)),
  ].sort(sortTodos);

  const counts: Record<TodoView, number> = { today: 0, upcoming: 0, someday: 0, done: 0 };
  let overdue = 0;
  for (const t of items) {
    counts[viewOf(t, day)]++;
    if (!t.done && t.dueDate && dayNum(t.dueDate) < dayNum(day)) overdue++;
  }
  return { ok: true, data: { items, counts, overdue, today: day } };
}

/** Sidebar badge: how many things are due today or late, and whether any are late. */
export async function countDueTodos(): Promise<{ due: number; overdue: number }> {
  const db = await createSupabase();
  const day = today();
  const [tasksDue, tasksLate, checkDue, checkLate] = await Promise.all([
    db.from(K.table).select(K.columns.id, { count: "exact", head: true }).eq(K.columns.done, false).lte(K.columns.dueDate, day),
    db.from(K.table).select(K.columns.id, { count: "exact", head: true }).eq(K.columns.done, false).lt(K.columns.dueDate, day),
    db
      .from(T.table)
      .select(`id:${T.columns.id}, project:${P.table}!inner(status:${P.columns.status})`, { count: "exact", head: true })
      .eq(T.columns.done, false)
      .lte(T.columns.dueDate, day)
      .not(`project.${P.columns.status}`, "in", closed),
    db
      .from(T.table)
      .select(`id:${T.columns.id}, project:${P.table}!inner(status:${P.columns.status})`, { count: "exact", head: true })
      .eq(T.columns.done, false)
      .lt(T.columns.dueDate, day)
      .not(`project.${P.columns.status}`, "in", closed),
  ]);
  const n = (r: { count: number | null; error: unknown }) => (r.error ? 0 : (r.count ?? 0));
  return { due: n(tasksDue) + n(checkDue), overdue: n(tasksLate) + n(checkLate) };
}

/** Open tasks for one client, for the card on their page. */
export async function todosForClient(clientId: string): Promise<Loaded<Todo[]>> {
  const db = await createSupabase();
  const { data, error } = await db.from(K.table).select(taskSelect).eq(K.columns.done, false).eq(K.columns.clientId, clientId);
  if (error) return { ok: false, issue: toIssue(K.table, error) };
  return { ok: true, data: ((data ?? []) as unknown as Row[]).map(fromTask).sort(sortTodos) };
}

/** What #name can link to: active clients and open projects. */
export async function taskRefs(): Promise<Ref[]> {
  const db = await createSupabase();
  const [clients, projects] = await Promise.all([
    db.from(C.table).select(`id:${C.columns.id}, name:${C.columns.name}`).neq(C.columns.status, "churned"),
    db
      .from(P.table)
      .select(`id:${P.columns.id}, name:${P.columns.name}, clientId:${P.columns.clientId}`)
      .not(P.columns.status, "in", closed),
  ]);
  return [
    ...((clients.data ?? []) as unknown as Row[]).map((r) => ({ id: String(r.id), name: str(r.name) ?? "Client", kind: "client" as const })),
    ...((projects.data ?? []) as unknown as Row[]).map((r) => ({
      id: String(r.id),
      name: str(r.name) ?? "Project",
      kind: "project" as const,
      clientId: str(r.clientId),
    })),
  ];
}
