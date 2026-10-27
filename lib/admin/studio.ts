import "server-only";
import { falReady } from "./fal";
import { zonedDay, zonedMidnight } from "./range";
import { storageReady, viewUrl } from "./storage";
import { createSupabase } from "./supabase";
import type { AssetView, JobView, MessageView, PresetView, ThreadState } from "./studio-types";

type Row = Record<string, unknown>;
const s = (v: unknown) => (typeof v === "string" && v.trim() ? v : null);
const n = (v: unknown) => (v == null ? null : Number(v));

const safeUrl = (key: string | null) => {
  if (!key || !storageReady()) return "";
  try {
    return viewUrl(key);
  } catch {
    return "";
  }
};

export const assetCols =
  "id, kind, origin, storage_key, mime, bytes, width, height, duration_s, ratio, format, label, group_id, slide_index, parent_id, prompt, created_at";

export function toAsset(r: Row): AssetView {
  return {
    id: String(r.id),
    kind: r.kind === "video" ? "video" : "image",
    origin: String(r.origin) as AssetView["origin"],
    url: safeUrl(String(r.storage_key)),
    mime: String(r.mime),
    bytes: Number(r.bytes ?? 0),
    width: n(r.width),
    height: n(r.height),
    durationS: n(r.duration_s),
    ratio: s(r.ratio),
    format: s(r.format),
    label: s(r.label),
    groupId: s(r.group_id),
    slideIndex: n(r.slide_index),
    parentId: s(r.parent_id),
    prompt: s(r.prompt),
    createdAt: String(r.created_at),
  };
}

function toJob(r: Row): JobView {
  const plan = (r.plan ?? {}) as { label?: string };
  return {
    id: String(r.id),
    status: String(r.status) as JobView["status"],
    kind: r.kind === "video" ? "video" : "image",
    format: s(r.format),
    ratio: s(r.ratio),
    costCents: Number(r.cost_cents ?? 0),
    error: s(r.error),
    label: plan.label ?? null,
    createdAt: String(r.created_at),
  };
}

export function toPreset(r: Row): PresetView {
  const refs = (r.reference_keys as string[] | null) ?? [];
  const client = r.client as { name?: string } | null;
  return {
    id: String(r.id),
    name: String(r.name),
    clientId: s(r.client_id),
    clientName: client?.name ?? null,
    style: s(r.style),
    palette: Array.isArray(r.palette) ? (r.palette as { name: string; hex: string }[]).filter((c) => /^#[0-9a-f]{6}$/i.test(c?.hex ?? "")) : [],
    displayFont: s(r.display_font),
    bodyFont: s(r.body_font),
    voice: s(r.voice),
    avoid: s(r.avoid),
    logoKey: s(r.logo_key),
    logoUrl: safeUrl(s(r.logo_key)),
    referenceKeys: refs,
    referenceUrls: refs.map((k) => safeUrl(k)),
    isBuiltin: r.is_builtin === true,
  };
}

export const presetCols = "id, name, client_id, style, palette, display_font, body_font, voice, avoid, logo_key, reference_keys, is_builtin, client:clients(name)";

export async function listPresets(): Promise<PresetView[]> {
  const db = await createSupabase();
  const { data, error } = await db.from("studio_presets").select(presetCols).order("is_builtin", { ascending: false }).order("name");
  if (error) {
    console.error("[studio] presets:", error.message);
    return [];
  }
  return ((data ?? []) as Row[]).map(toPreset);
}

export async function getPreset(id: string): Promise<PresetView | null> {
  const db = await createSupabase();
  const { data } = await db.from("studio_presets").select(presetCols).eq("id", id).maybeSingle();
  return data ? toPreset(data as Row) : null;
}

export type ThreadSummary = { id: string; title: string; updatedAt: string; presetName: string | null; thumb: string | null; pending: number };

export async function listThreads(limit = 40): Promise<ThreadSummary[]> {
  const db = await createSupabase();
  const { data, error } = await db
    .from("studio_threads")
    .select("id, title, updated_at, preset:studio_presets(name)")
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[studio] threads:", error.message);
    return [];
  }
  const rows = (data ?? []) as Row[];
  const ids = rows.map((r) => String(r.id));
  if (!ids.length) return [];
  const [thumbs, pending] = await Promise.all([
    db.from("studio_assets").select("thread_id, storage_key, kind, created_at").in("thread_id", ids).eq("kind", "image").order("created_at", { ascending: false }).limit(400),
    db.from("studio_jobs").select("thread_id").in("thread_id", ids).in("status", ["queued", "running", "finalizing"]),
  ]);
  const thumbBy = new Map<string, string>();
  for (const a of (thumbs.data ?? []) as Row[]) if (!thumbBy.has(String(a.thread_id))) thumbBy.set(String(a.thread_id), String(a.storage_key));
  const pend = new Map<string, number>();
  for (const j of (pending.data ?? []) as Row[]) pend.set(String(j.thread_id), (pend.get(String(j.thread_id)) ?? 0) + 1);
  return rows.map((r) => ({
    id: String(r.id),
    title: String(r.title),
    updatedAt: String(r.updated_at),
    presetName: (r.preset as { name?: string } | null)?.name ?? null,
    thumb: safeUrl(thumbBy.get(String(r.id)) ?? null) || null,
    pending: pend.get(String(r.id)) ?? 0,
  }));
}

/** What you've spent this calendar month (Orlando time), from fal price estimates. */
export async function monthSpendCents(now = new Date()): Promise<number> {
  const db = await createSupabase();
  const t = zonedDay(now);
  const from = zonedMidnight({ y: t.y, m: t.m, d: 1 }).toISOString();
  const { data } = await db.from("studio_jobs").select("cost_cents").gte("created_at", from).not("status", "in", "(failed,canceled)");
  return ((data ?? []) as Row[]).reduce((a, r) => a + Number(r.cost_cents ?? 0), 0);
}

export function capCents(): number | null {
  const v = Number(process.env.STUDIO_MONTHLY_CAP_USD);
  return Number.isFinite(v) && v > 0 ? Math.round(v * 100) : null;
}

export async function getThreadState(threadId: string): Promise<ThreadState | null> {
  const db = await createSupabase();
  const { data: t } = await db.from("studio_threads").select("id, title, preset_id").eq("id", threadId).maybeSingle();
  if (!t) return null;
  const [m, a, j, spend] = await Promise.all([
    db.from("studio_messages").select("id, role, body, asset_ids, job_id, meta, created_at").eq("thread_id", threadId).order("created_at"),
    db.from("studio_assets").select(assetCols).eq("thread_id", threadId).order("created_at"),
    db.from("studio_jobs").select("id, status, kind, format, ratio, cost_cents, error, plan, created_at").eq("thread_id", threadId),
    monthSpendCents(),
  ]);
  const tr = t as Row;
  return {
    thread: { id: String(tr.id), title: String(tr.title), presetId: s(tr.preset_id) },
    messages: ((m.data ?? []) as Row[]).map(
      (r): MessageView => ({
        id: String(r.id),
        role: r.role === "assistant" ? "assistant" : "user",
        body: s(r.body),
        assetIds: ((r.asset_ids as string[] | null) ?? []).map(String),
        jobId: s(r.job_id),
        meta: (r.meta as Record<string, unknown>) ?? {},
        createdAt: String(r.created_at),
      }),
    ),
    assets: Object.fromEntries(((a.data ?? []) as Row[]).map((r) => [String(r.id), toAsset(r)])),
    jobs: Object.fromEntries(((j.data ?? []) as Row[]).map((r) => [String(r.id), toJob(r)])),
    spend: { monthCents: spend, capCents: capCents() },
    ready: { fal: falReady(), storage: storageReady() },
  };
}

export type LibraryFilter = { kind?: "image" | "video"; origin?: string; format?: string; preset?: string; page?: number };

export async function listLibrary(f: LibraryFilter) {
  const db = await createSupabase();
  const per = 60;
  const page = Math.max(1, f.page ?? 1);
  let q = db.from("studio_assets").select(`${assetCols}, thread:studio_threads(title)`, { count: "exact" }).order("created_at", { ascending: false });
  if (f.kind) q = q.eq("kind", f.kind);
  if (f.origin) q = q.eq("origin", f.origin);
  if (f.format) q = q.eq("format", f.format);
  if (f.preset) q = q.eq("preset_id", f.preset);
  const [{ data, count, error }, usage] = await Promise.all([q.range((page - 1) * per, page * per - 1), db.from("studio_assets").select("bytes")]);
  if (error) console.error("[studio] library:", error.message);
  const totalBytes = ((usage.data ?? []) as Row[]).reduce((a, r) => a + Number(r.bytes ?? 0), 0);
  return {
    items: ((data ?? []) as Row[]).map((r) => ({ ...toAsset(r), threadTitle: (r.thread as { title?: string } | null)?.title ?? null })),
    total: count ?? 0,
    page,
    pages: Math.max(1, Math.ceil((count ?? 0) / per)),
    totalBytes,
  };
}
