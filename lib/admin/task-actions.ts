"use server";

import { revalidatePath } from "next/cache";
import { tasksPage } from "@/content/admin";
import { requireAdmin } from "./auth";
import { createSupabase } from "./supabase";
import { tables } from "./schema";
import type { FormState } from "./client-actions";

const K = tables.tasks;
const T = tables.projectTasks;
const P = tables.projects;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export type TodoResult = { ok: true } | { ok: false; error: string };

const text = (fd: FormData, k: string) => {
  const v = String(fd.get(k) ?? "").trim();
  return v === "" || v === "none" ? null : v;
};

function refresh() {
  // Tasks show up on the Tasks page, the client page, the project page and in the sidebar badge.
  revalidatePath("/admin", "layout");
}

/** A task tied to a project belongs to that project's client too, so it shows on the client page. */
async function clientOfProject(projectId: string | null): Promise<string | null> {
  if (!projectId) return null;
  const db = await createSupabase();
  const { data } = await db.from(P.table).select(`c:${P.columns.clientId}`).eq(P.columns.id, projectId).maybeSingle();
  return (data as { c: string | null } | null)?.c ?? null;
}

function readTask(fd: FormData): { row: Record<string, unknown>; error?: string; projectId: string | null } {
  const title = text(fd, "title")?.slice(0, 300) ?? null;
  const due = text(fd, "due_date");
  if (!title) return { row: {}, error: "Type the task first.", projectId: null };
  if (due && !DATE_RE.test(due)) return { row: {}, error: "Use a full date.", projectId: null };
  const projectId = text(fd, "project_id");
  return {
    projectId,
    row: {
      [K.columns.title]: title,
      [K.columns.dueDate]: due,
      [K.columns.clientId]: text(fd, "client_id"),
      [K.columns.projectId]: projectId,
    },
  };
}

/** Quick add. The browser already parsed "tomorrow #ruiz" into hidden fields; this just checks them. */
export async function quickAdd(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const { row, error, projectId } = readTask(fd);
  if (error) return { error };
  if (!row[K.columns.clientId]) row[K.columns.clientId] = await clientOfProject(projectId);

  const db = await createSupabase();
  const { error: dbError } = await db.from(K.table).insert(row);
  if (dbError) return { error: dbError.message };
  refresh();
  return { ok: true, message: tasksPage.quickAdd.added };
}

export async function updateTask(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = text(fd, "id");
  if (!id) return { error: "Missing task." };
  const { row, error, projectId } = readTask(fd);
  if (error) return { error };
  if (!row[K.columns.clientId]) row[K.columns.clientId] = await clientOfProject(projectId);
  row[K.columns.notes] = text(fd, "notes");

  const db = await createSupabase();
  const { error: dbError } = await db.from(K.table).update(row).eq(K.columns.id, id);
  if (dbError) return { error: dbError.message };
  refresh();
  return { ok: true, message: "Saved" };
}

const tableFor = (kind: "task" | "checklist") => (kind === "task" ? K : T);

export async function toggleTodo(kind: "task" | "checklist", id: string, done: boolean): Promise<TodoResult> {
  await requireAdmin();
  const t = tableFor(kind);
  const db = await createSupabase();
  const { error } = await db.from(t.table).update({ [t.columns.done]: done }).eq(t.columns.id, id);
  if (error) return { ok: false, error: error.message };
  refresh();
  return { ok: true };
}

export async function rescheduleTodo(kind: "task" | "checklist", id: string, due: string | null): Promise<TodoResult> {
  await requireAdmin();
  if (due && !DATE_RE.test(due)) return { ok: false, error: "Use a full date." };
  const t = tableFor(kind);
  const db = await createSupabase();
  const { error } = await db.from(t.table).update({ [t.columns.dueDate]: due }).eq(t.columns.id, id);
  if (error) return { ok: false, error: error.message };
  refresh();
  return { ok: true };
}

/** Standalone tasks only. Checklist items are deleted from their project. */
export async function deleteTodo(id: string): Promise<TodoResult> {
  await requireAdmin();
  const db = await createSupabase();
  const { error } = await db.from(K.table).delete().eq(K.columns.id, id);
  if (error) return { ok: false, error: error.message };
  refresh();
  return { ok: true };
}
