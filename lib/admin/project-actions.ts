"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { projectPage, projectsPage } from "@/content/admin";
import { requireAdmin } from "./auth";
import { createSupabase } from "./supabase";
import { addDays, dayNum, launchPhases } from "./project-logic";
import { insertTemplateTasks } from "./projects";
import { projectStatuses, tables } from "./schema";
import type { FormState } from "./client-actions";

const P = tables.projects;
const T = tables.projectTasks;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const text = (fd: FormData, k: string) => {
  const v = String(fd.get(k) ?? "").trim();
  return v === "" ? null : v;
};
const typed = (fd: FormData) =>
  Object.fromEntries([...fd.entries()].filter((e): e is [string, string] => typeof e[1] === "string"));

function cleanUrl(v: string | null): string | null | "bad" {
  if (!v) return null;
  const withProto = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try {
    const u = new URL(withProto);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : "bad";
  } catch {
    return "bad";
  }
}

const isDrive = (url: string) => /(^|\.)(drive|docs)\.google\.com$/i.test(new URL(url).hostname);

function refresh(id?: string) {
  revalidatePath("/admin/projects");
  if (id) revalidatePath(`/admin/projects/${id}`);
  revalidatePath("/admin", "layout");
}

function readProject(fd: FormData) {
  const fields: Record<string, string> = {};
  const name = text(fd, "name");
  if (!name) fields.name = "Give the project a name.";
  const status = text(fd, "status") ?? "planning";
  if (!(projectStatuses as readonly string[]).includes(status)) fields.status = "Pick a status.";
  const start = text(fd, "start_date");
  if (start && !DATE_RE.test(start)) fields.start_date = "Use a full date.";
  const due = text(fd, "due_date");
  if (due && !DATE_RE.test(due)) fields.due_date = "Use a full date.";
  if (start && due && DATE_RE.test(start) && DATE_RE.test(due) && dayNum(due) < dayNum(start))
    fields.due_date = "Launch date is before the start date.";
  const drive = cleanUrl(text(fd, "drive_url"));
  if (drive === "bad") fields.drive_url = "That doesn't look like a link.";
  const client = text(fd, "client_id");

  return {
    fields,
    start,
    due,
    row: {
      [P.columns.name]: name,
      [P.columns.clientId]: client && client !== "none" ? client : null,
      [P.columns.service]: text(fd, "service"),
      [P.columns.status]: status,
      [P.columns.startDate]: start,
      [P.columns.dueDate]: due,
      [P.columns.driveUrl]: drive === "bad" ? null : drive,
      [P.columns.notes]: text(fd, "notes"),
    },
  };
}

export async function createProject(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const { fields, row, start, due } = readProject(fd);
  if (Object.keys(fields).length) return { error: "Fix the highlighted fields.", fields, values: typed(fd) };

  const db = await createSupabase();
  const { data, error } = await db.from(P.table).insert(row).select(P.columns.id).single();
  if (error) return { error: error.message, values: typed(fd) };
  const id = String((data as Record<string, unknown>)[P.columns.id]);

  if (fd.get("template") === "on") {
    try {
      await insertTemplateTasks(db, id, start, due);
    } catch (e) {
      console.error("[admin] template tasks", e);
    }
  }
  refresh(id);
  redirect(`/admin/projects/${id}`);
}

/** Edit. If the launch date moves and "shift" is on, every unfinished dated item moves by the same amount. */
export async function saveProject(id: string, _prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const { fields, row, due } = readProject(fd);
  if (Object.keys(fields).length) return { error: "Fix the highlighted fields.", fields, values: typed(fd) };

  const db = await createSupabase();
  const { data: before } = await db.from(P.table).select(`due:${P.columns.dueDate}`).eq(P.columns.id, id).maybeSingle();
  const oldDue = (before as { due: string | null } | null)?.due ?? null;

  const { error } = await db.from(P.table).update(row).eq(P.columns.id, id);
  if (error) return { error: error.message, values: typed(fd) };

  if (fd.get("shift") === "on" && oldDue && due && oldDue !== due) {
    const delta = dayNum(due) - dayNum(oldDue);
    const { data: open } = await db
      .from(T.table)
      .select(`id:${T.columns.id}, due:${T.columns.dueDate}`)
      .eq(T.columns.projectId, id)
      .eq(T.columns.done, false)
      .not(T.columns.dueDate, "is", null);
    await Promise.all(
      ((open ?? []) as { id: string; due: string }[]).map((t) =>
        db.from(T.table).update({ [T.columns.dueDate]: addDays(t.due, delta) }).eq(T.columns.id, t.id),
      ),
    );
  }

  refresh(id);
  redirect(`/admin/projects/${id}`);
}

export type MoveResult = { ok: true; warning?: string } | { ok: false; error: string };

/** Board drag and the status menu. Moving to Done with launch items open is allowed, but it tells you. */
export async function moveProject(id: string, status: string): Promise<MoveResult> {
  await requireAdmin();
  if (!(projectStatuses as readonly string[]).includes(status)) return { ok: false, error: "Unknown status" };

  const db = await createSupabase();
  const { error, count } = await db.from(P.table).update({ [P.columns.status]: status }, { count: "exact" }).eq(P.columns.id, id);
  if (error) return { ok: false, error: error.message };
  if (count === 0) return { ok: false, error: "Nothing was updated. Check the projects policy in Supabase." };

  let warning: string | undefined;
  if (status === "done") {
    const { data } = await db
      .from(T.table)
      .select(`phase:${T.columns.phase}`)
      .eq(T.columns.projectId, id)
      .eq(T.columns.done, false);
    const open = ((data ?? []) as { phase: string }[]).filter((t) => launchPhases.has(t.phase)).length;
    if (open) warning = projectsPage.openLaunch(open);
  }

  refresh(id);
  return { ok: true, warning };
}

/* Drive folder */

export async function setDriveUrl(projectId: string, _prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const url = cleanUrl(text(fd, "drive_url"));
  if (url === "bad") return { error: "That doesn't look like a link.", values: typed(fd) };
  const db = await createSupabase();
  const { error } = await db.from(P.table).update({ [P.columns.driveUrl]: url }).eq(P.columns.id, projectId);
  if (error) return { error: error.message, values: typed(fd) };
  refresh(projectId);
  return { ok: true, message: url && !isDrive(url) ? projectPage.drive.notDrive : projectPage.drive.saved };
}

/* Checklist */

export type TaskResult = { ok: true } | { ok: false; error: string };

async function taskProject(id: string): Promise<string | null> {
  const db = await createSupabase();
  const { data } = await db.from(T.table).select(`p:${T.columns.projectId}`).eq(T.columns.id, id).maybeSingle();
  return (data as { p: string } | null)?.p ?? null;
}

export async function toggleTask(id: string, done: boolean): Promise<TaskResult> {
  await requireAdmin();
  const db = await createSupabase();
  const { error } = await db.from(T.table).update({ [T.columns.done]: done }).eq(T.columns.id, id);
  if (error) return { ok: false, error: error.message };
  refresh((await taskProject(id)) ?? undefined);
  return { ok: true };
}

export async function setTaskDue(id: string, due: string | null): Promise<TaskResult> {
  await requireAdmin();
  if (due && !DATE_RE.test(due)) return { ok: false, error: "Use a full date." };
  const db = await createSupabase();
  const { error } = await db.from(T.table).update({ [T.columns.dueDate]: due }).eq(T.columns.id, id);
  if (error) return { ok: false, error: error.message };
  refresh((await taskProject(id)) ?? undefined);
  return { ok: true };
}

export async function addTask(projectId: string, phase: string, title: string): Promise<TaskResult> {
  await requireAdmin();
  const clean = title.trim().slice(0, 200);
  if (!clean) return { ok: false, error: "Type something first." };
  const db = await createSupabase();
  // Goes at the end of its phase: one past the phase's last position.
  const { data } = await db
    .from(T.table)
    .select(`pos:${T.columns.position}`)
    .eq(T.columns.projectId, projectId)
    .eq(T.columns.phase, phase)
    .order(T.columns.position, { ascending: false })
    .limit(1)
    .maybeSingle();
  const pos = ((data as { pos: number } | null)?.pos ?? 100000) + 1;
  const { error } = await db.from(T.table).insert({
    [T.columns.projectId]: projectId,
    [T.columns.phase]: phase,
    [T.columns.title]: clean,
    [T.columns.position]: pos,
  });
  if (error) return { ok: false, error: error.message };
  refresh(projectId);
  return { ok: true };
}

export async function deleteTask(id: string): Promise<TaskResult> {
  await requireAdmin();
  const project = await taskProject(id);
  const db = await createSupabase();
  const { error } = await db.from(T.table).delete().eq(T.columns.id, id);
  if (error) return { ok: false, error: error.message };
  refresh(project ?? undefined);
  return { ok: true };
}
