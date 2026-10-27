"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "./auth";
import type { FormState } from "./client-actions";
import { falReady } from "./fal";
import { ALLOWED_UPLOADS, deleteObject, newKey, storageConfig, storageReady, uploadUrl } from "./storage";
import { presign } from "./storage-sign";
import { assetCols, toAsset } from "./studio";
import { cancelJob, sendFromComposer } from "./studio-jobs";
import type { AssetView, ComposerPayload } from "./studio-types";
import { createSupabase } from "./supabase";

const MAX_IMAGE = 25 * 1024 * 1024;
const MAX_VIDEO = 300 * 1024 * 1024;
const UUID = /^[0-9a-f-]{36}$/i;
type Result<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

export async function createThread(presetId: string | null, format?: string): Promise<void> {
  await requireAdmin();
  const db = await createSupabase();
  const { data, error } = await db
    .from("studio_threads")
    .insert({ preset_id: presetId && UUID.test(presetId) ? presetId : null })
    .select("id")
    .single();
  if (error || !data) throw new Error(`Couldn't start a chat: ${error?.message}`);
  redirect(`/admin/studio/${(data as { id: string }).id}${format ? `?format=${encodeURIComponent(format)}` : ""}`);
}

/** The "New chat" buttons on the Studio page post here. */
export async function startThread(fd: FormData): Promise<void> {
  const preset = String(fd.get("preset") ?? "");
  const format = String(fd.get("format") ?? "");
  await createThread(preset || null, /^[a-z-]{2,20}$/.test(format) ? format : undefined);
}

export async function sendStudioMessage(threadId: string, payload: ComposerPayload): Promise<Result> {
  await requireAdmin();
  if (!falReady()) return { ok: false, error: "Add FAL_KEY to your env first." };
  if (!storageReady()) return { ok: false, error: "Set up storage first (the STORAGE_* env vars)." };
  const r = await sendFromComposer(threadId, payload);
  revalidatePath(`/admin/studio/${threadId}`);
  return r;
}

export async function cancelStudioJob(jobId: string): Promise<Result> {
  await requireAdmin();
  await cancelJob(jobId);
  return { ok: true };
}

/** Step 1 of an upload: a one-time link the browser PUTs the file to, straight into the bucket. */
export async function requestUpload(file: { type: string; size: number }): Promise<Result<{ key: string; url: string }>> {
  await requireAdmin();
  if (!storageReady()) return { ok: false, error: "Set up storage first (the STORAGE_* env vars)." };
  const type = file.type.toLowerCase();
  if (!ALLOWED_UPLOADS.includes(type)) return { ok: false, error: "PNG, JPG, WebP, GIF, MP4, MOV or WebM only." };
  const limit = type.startsWith("video/") ? MAX_VIDEO : MAX_IMAGE;
  if (file.size > limit) return { ok: false, error: `Too big. ${type.startsWith("video/") ? "300" : "25"} MB max.` };
  const key = newKey(type, "in");
  return { ok: true, data: { key, url: uploadUrl(key) } };
}

/** Step 2: the file is in the bucket; record it. Checks it really landed and how big it is. */
export async function registerUpload(input: {
  threadId: string | null;
  key: string;
  mime: string;
  width?: number | null;
  height?: number | null;
  durationS?: number | null;
  origin?: "upload" | "text-layer" | "frame";
  parentId?: string | null;
  label?: string | null;
}): Promise<Result<AssetView>> {
  await requireAdmin();
  if (!/^studio\/in\/\d{4}\/\d{2}\/[0-9a-f-]{36}\.\w+$/.test(input.key)) return { ok: false, error: "That upload link isn't one of ours." };
  const cfg = storageConfig();
  if (!cfg) return { ok: false, error: "Storage isn't set up." };
  const head = await fetch(presign(cfg, "HEAD", input.key, { expires: 60 }), { method: "HEAD" }).catch(() => null);
  if (!head?.ok) return { ok: false, error: "The upload didn't make it to storage. Check the bucket's CORS settings (ADMIN_SETUP.md, Studio)." };
  const bytes = Number(head.headers.get("content-length") ?? 0);

  const db = await createSupabase();
  let parent: { format?: string | null; ratio?: string | null; prompt?: string | null } = {};
  if (input.parentId && UUID.test(input.parentId)) {
    const { data } = await db.from("studio_assets").select("format, ratio, prompt").eq("id", input.parentId).maybeSingle();
    parent = (data as typeof parent) ?? {};
  }
  const { data, error } = await db
    .from("studio_assets")
    .insert({
      thread_id: input.threadId && UUID.test(input.threadId) ? input.threadId : null,
      kind: input.mime.startsWith("video/") ? "video" : "image",
      origin: input.origin ?? "upload",
      storage_key: input.key,
      mime: input.mime,
      bytes,
      width: input.width ?? null,
      height: input.height ?? null,
      duration_s: input.durationS ?? null,
      parent_id: input.parentId && UUID.test(input.parentId) ? input.parentId : null,
      format: parent.format ?? null,
      ratio: parent.ratio ?? null,
      label: input.label ?? null,
    })
    .select(assetCols)
    .single();
  if (error || !data) {
    await deleteObject(input.key).catch(() => undefined);
    return { ok: false, error: `Couldn't save it: ${error?.message}` };
  }
  // Text-layer saves and video frames show up in the chat as their own message.
  if (input.threadId && input.origin && input.origin !== "upload") {
    await db.from("studio_messages").insert({
      thread_id: input.threadId,
      role: "assistant",
      body: input.origin === "text-layer" ? "Text added." : "Frame saved. Attach it to use as a reference.",
      asset_ids: [(data as { id: string }).id],
    });
  }
  return { ok: true, data: toAsset(data as Record<string, unknown>) };
}

/** Deletes the files from the bucket first, then the rows. A file that's already gone isn't an error. */
export async function deleteAssets(ids: string[]): Promise<Result<{ deleted: number }>> {
  await requireAdmin();
  const clean = ids.filter((id) => UUID.test(id)).slice(0, 500);
  if (!clean.length) return { ok: true, data: { deleted: 0 } };
  const db = await createSupabase();
  // Deleting a carousel strip takes its slides with it, and vice versa the whole set goes together.
  const { data: rows } = await db.from("studio_assets").select("id, storage_key, group_id").in("id", clean);
  const groups = [...new Set(((rows ?? []) as { group_id: string | null }[]).map((r) => r.group_id).filter(Boolean))] as string[];
  const { data: siblings } = groups.length ? await db.from("studio_assets").select("id, storage_key").in("group_id", groups) : { data: [] };
  const all = new Map<string, string>();
  for (const r of [...((rows ?? []) as { id: string; storage_key: string }[]), ...((siblings ?? []) as { id: string; storage_key: string }[])]) all.set(r.id, r.storage_key);
  const results = await Promise.allSettled([...all.values()].map(deleteObject));
  const gone = [...all.keys()].filter((_, i) => results[i].status === "fulfilled");
  if (gone.length) await db.from("studio_assets").delete().in("id", gone);
  revalidatePath("/admin/studio", "layout");
  if (gone.length < all.size) return { ok: false, error: `Deleted ${gone.length}, but ${all.size - gone.length} couldn't be removed from storage. Try again.` };
  return { ok: true, data: { deleted: gone.length } };
}

export async function deleteThread(threadId: string): Promise<Result> {
  await requireAdmin();
  const db = await createSupabase();
  const { data } = await db.from("studio_assets").select("id").eq("thread_id", threadId);
  const ids = ((data ?? []) as { id: string }[]).map((r) => r.id);
  if (ids.length) {
    const r = await deleteAssets(ids);
    if (!r.ok) return r;
  }
  await db.from("studio_threads").delete().eq("id", threadId);
  revalidatePath("/admin/studio", "layout");
  return { ok: true };
}

export async function updateThread(threadId: string, patch: { title?: string; presetId?: string | null }): Promise<Result> {
  await requireAdmin();
  const row: Record<string, unknown> = {};
  if (patch.title !== undefined) row.title = patch.title.trim().slice(0, 120) || "Untitled";
  if (patch.presetId !== undefined) row.preset_id = patch.presetId && UUID.test(patch.presetId) ? patch.presetId : null;
  const db = await createSupabase();
  const { error } = await db.from("studio_threads").update(row).eq("id", threadId);
  revalidatePath(`/admin/studio/${threadId}`);
  return error ? { ok: false, error: error.message } : { ok: true };
}

/* Presets */

const HEX = /^#[0-9a-f]{6}$/i;

export async function savePreset(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const values = Object.fromEntries([...fd.entries()].filter((e): e is [string, string] => typeof e[1] === "string"));
  const id = values.id && UUID.test(values.id) ? values.id : null;
  const name = (values.name ?? "").trim().slice(0, 80);
  if (!name) return { error: "Fix the highlighted fields.", fields: { name: "Give it a name." }, values };

  let palette: { name: string; hex: string }[] = [];
  try {
    palette = (JSON.parse(values.palette || "[]") as { name: string; hex: string }[])
      .filter((c) => HEX.test(c.hex))
      .map((c) => ({ name: (c.name ?? "").trim().slice(0, 40) || c.hex.toUpperCase(), hex: c.hex.toUpperCase() }))
      .slice(0, 12);
  } catch {
    return { error: "The colors didn't save right. Try again.", values };
  }
  const refs = (values.reference_keys || "").split(",").map((k) => k.trim()).filter((k) => /^studio\/in\//.test(k)).slice(0, 8);
  const logo = /^studio\/in\//.test(values.logo_key ?? "") ? values.logo_key : null;
  const txt = (k: string, max = 2000) => (values[k] ?? "").trim().slice(0, max) || null;
  const row = {
    name,
    client_id: values.client_id && UUID.test(values.client_id) ? values.client_id : null,
    style: txt("look"),
    palette,
    display_font: txt("display_font", 60),
    body_font: txt("body_font", 60),
    voice: txt("voice"),
    avoid: txt("avoid"),
    logo_key: logo,
    reference_keys: refs,
  };

  const db = await createSupabase();
  let oldKeys: string[] = [];
  if (id) {
    const { data: old } = await db.from("studio_presets").select("logo_key, reference_keys").eq("id", id).maybeSingle();
    const o = old as { logo_key: string | null; reference_keys: string[] | null } | null;
    oldKeys = [o?.logo_key, ...(o?.reference_keys ?? [])].filter(Boolean) as string[];
  }
  const { data, error } = id
    ? await db.from("studio_presets").update(row).eq("id", id).select("id").single()
    : await db.from("studio_presets").insert(row).select("id").single();
  if (error || !data) return { error: `Couldn't save: ${error?.message}`, values };

  // Files you swapped out are deleted from the bucket.
  const keep = new Set([logo, ...refs].filter(Boolean));
  await Promise.allSettled(oldKeys.filter((k) => !keep.has(k)).map(deleteObject));
  revalidatePath("/admin/studio", "layout");
  redirect("/admin/studio/presets?saved=1");
}

export async function deletePreset(id: string): Promise<Result> {
  await requireAdmin();
  const db = await createSupabase();
  const { data } = await db.from("studio_presets").select("is_builtin, logo_key, reference_keys").eq("id", id).maybeSingle();
  const p = data as { is_builtin: boolean; logo_key: string | null; reference_keys: string[] } | null;
  if (!p) return { ok: false, error: "Not found." };
  if (p.is_builtin) return { ok: false, error: "The two built-in presets can be edited but not deleted." };
  const { error } = await db.from("studio_presets").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  await Promise.allSettled([p.logo_key, ...(p.reference_keys ?? [])].filter(Boolean).map((k) => deleteObject(k!)));
  revalidatePath("/admin/studio", "layout");
  return { ok: true };
}
