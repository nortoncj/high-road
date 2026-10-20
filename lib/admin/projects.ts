import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabase } from "./supabase";
import type { Issue, Loaded } from "./data";
import { dayKey, zonedDay } from "./range";
import { nextTask, projectHealth, templateRows, type ProjectHealth } from "./project-logic";
import { selectAs, tables, toProjectStatus, type ProjectStatus } from "./schema";

type Row = Record<string, unknown>;
const P = tables.projects;
const T = tables.projectTasks;
const C = tables.clients;

export type ProjectTask = { id: string; phase: string; title: string; done: boolean; dueDate: string | null; position: number };

export type Project = {
  id: string;
  name: string;
  service: string | null;
  status: ProjectStatus;
  client: { id: string; name: string } | null;
  startDate: string | null;
  dueDate: string | null;
  completedAt: string | null;
  driveUrl: string | null;
  notes: string | null;
  createdAt: string;
  tasks: ProjectTask[];
  total: number;
  done: number;
  next: string | null;
  health: ProjectHealth;
  daysLate: number;
  overdueTasks: number;
};

export const today = () => dayKey(zonedDay(new Date()));

const str = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v.trim() : v == null ? null : String(v));

const projectSelect = `${selectAs(P.columns)}, client:${C.table}(id:${C.columns.id}, name:${C.columns.name}), tasks:${T.table}(${selectAs(T.columns, ["id", "phase", "title", "done", "dueDate", "position"])})`;

function toProject(r: Row, day: string): Project {
  const tasks: ProjectTask[] = ((r.tasks as Row[] | null) ?? [])
    .map((t) => ({
      id: String(t.id),
      phase: str(t.phase) ?? "Other",
      title: str(t.title) ?? "Untitled",
      done: Boolean(t.done),
      dueDate: str(t.dueDate),
      position: Number(t.position) || 0,
    }))
    .sort((a, b) => a.position - b.position);
  const status = toProjectStatus(r.status);
  const dueDate = str(r.dueDate);
  const h = projectHealth({ status, dueDate, tasks }, day);
  const client = r.client as Row | null;

  return {
    id: String(r.id),
    name: str(r.name) ?? "Untitled project",
    service: str(r.service),
    status,
    client: client ? { id: String(client.id), name: str(client.name) ?? "Client" } : null,
    startDate: str(r.startDate),
    dueDate,
    completedAt: str(r.completedAt),
    driveUrl: str(r.driveUrl),
    notes: str(r.notes),
    createdAt: String(r.createdAt),
    tasks,
    total: tasks.length,
    done: tasks.filter((t) => t.done).length,
    next: nextTask(tasks)?.title ?? null,
    ...h,
  };
}

function toIssue(table: string, error: { code?: string; message: string }): Issue {
  const missing = error.code === "42P01" || error.code === "PGRST205" || /does not exist|could not find/i.test(error.message);
  if (!missing) console.error(`[admin] ${table}:`, error.code, error.message);
  return { table, message: error.message, missing };
}

export type Board = { projects: Project[]; late: number; behind: number; dueSoon: number; today: string };

/** Everything not cancelled. A one-person shop has dozens of projects, not thousands. */
export async function listProjects(q?: string): Promise<Loaded<Board>> {
  const db = await createSupabase();
  const { data, error } = await db
    .from(P.table)
    .select(projectSelect)
    .neq(P.columns.status, "cancelled")
    .order(P.columns.dueDate, { ascending: true });
  if (error) return { ok: false, issue: toIssue(P.table, error) };

  const day = today();
  const needle = q?.trim().toLowerCase() ?? "";
  const projects = ((data ?? []) as unknown as Row[])
    .map((r) => toProject(r, day))
    .filter((p) => !needle || p.name.toLowerCase().includes(needle) || p.client?.name.toLowerCase().includes(needle));

  return {
    ok: true,
    data: {
      projects,
      late: projects.filter((p) => p.health === "late").length,
      behind: projects.filter((p) => p.health === "behind").length,
      dueSoon: projects.filter((p) => p.health === "due-soon").length,
      today: day,
    },
  };
}

export async function getProject(id: string): Promise<{ project: Project; today: string } | null> {
  const db = await createSupabase();
  const { data, error } = await db.from(P.table).select(projectSelect).eq(P.columns.id, id).maybeSingle();
  if (error || !data) return null;
  const day = today();
  return { project: toProject(data as unknown as Row, day), today: day };
}

/** Sidebar badge: projects past their launch date. */
export async function countLateProjects(): Promise<number> {
  const db = await createSupabase();
  const { count, error } = await db
    .from(P.table)
    .select(P.columns.id, { count: "exact", head: true })
    .lt(P.columns.dueDate, today())
    .not(P.columns.status, "in", `(${P.closedStatuses.join(",")})`);
  return error ? 0 : (count ?? 0);
}

export async function clientOptions(): Promise<{ id: string; name: string }[]> {
  const db = await createSupabase();
  const { data } = await db
    .from(C.table)
    .select(`id:${C.columns.id}, name:${C.columns.name}`)
    .neq(C.columns.status, "churned")
    .order(C.columns.name, { ascending: true });
  return ((data ?? []) as unknown as Row[]).map((r) => ({ id: String(r.id), name: str(r.name) ?? "Client" }));
}

/** Writes the standard checklist for a new project. Used by the New project form and the client page. */
export async function insertTemplateTasks(db: SupabaseClient, projectId: string, start: string | null, due: string | null) {
  const rows = templateRows(start, due).map((r) => ({
    [T.columns.projectId]: projectId,
    [T.columns.phase]: r.phase,
    [T.columns.title]: r.title,
    [T.columns.position]: r.position,
    [T.columns.dueDate]: r.dueDate,
  }));
  const { error } = await db.from(T.table).insert(rows);
  if (error) throw new Error(error.message);
}
