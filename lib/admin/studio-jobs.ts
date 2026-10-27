import "server-only";
import { falCancel, falResult, falStatus, falSubmit, filesFrom } from "./fal";
import { deleteObject, newKey, putObject, viewUrl } from "./storage";
import { capCents, monthSpendCents } from "./studio";
import {
  anglesFor,
  buildImagePrompt,
  buildVideoPrompt,
  formats,
  lines,
  planCarousel,
  sliceRects,
  titleFrom,
  type Preset,
  type PromptInput,
} from "./studio-logic";
import { dollars, exportSize, imageCost, imageInput, imageModels, ratios, videoCost, videoModels, type Ratio } from "./studio-models";
import type { ComposerPayload } from "./studio-types";
import { createSupabase } from "./supabase";

type Row = Record<string, unknown>;
type Db = Awaited<ReturnType<typeof createSupabase>>;

/** What to do with a finished output. Stored on the job so finishing never needs the composer again. */
type Plan = {
  label?: string;
  editing?: boolean;
  carousel?: { n: number; slideRatio: Ratio };
  seconds?: number;
  presetId?: string | null;
  prompt: string;
  model: string;
};

type Planned = { endpoint: string; input: Record<string, unknown>; kind: "image" | "video"; cost: number; plan: Plan };

const MAX_WAIT_MIN = 30;

/* 1. Composer → fal requests */

function presetFor(r: Row | null): Preset | null {
  if (!r) return null;
  return {
    name: String(r.name),
    style: (r.style as string) ?? null,
    palette: Array.isArray(r.palette) ? (r.palette as Preset["palette"]) : [],
    displayFont: (r.display_font as string) ?? null,
    bodyFont: (r.body_font as string) ?? null,
    voice: (r.voice as string) ?? null,
    avoid: (r.avoid as string) ?? null,
  };
}

export function validatePayload(p: ComposerPayload): string | null {
  const f = formats[p.format];
  if (!f) return "Pick a format.";
  if (!ratios.includes(p.ratio) || !f.ratios.includes(p.ratio)) return `${f.label} doesn't come in ${p.ratio}.`;
  if (!f.textModes.includes(p.textMode)) return "Pick a text option.";
  if ((p.brief ?? "").length > 4000) return "That brief is too long (4,000 characters max).";
  if (f.kind === "video") {
    const m = p.video && videoModels[p.video.model];
    if (!m) return "Pick a video model.";
    if (!m.durations.includes(p.video!.seconds)) return `${m.label} does ${m.durations.join(" or ")} seconds.`;
  }
  if (!p.brief?.trim() && !Object.values(p.fields ?? {}).some((v) => v?.trim()) && !p.baseAssetId) return "Say what you want first.";
  return null;
}

/** Turns one composer send into one or more fal requests (an ad with 3 angles = 3 requests). */
export function planRequests(
  p: ComposerPayload,
  ctx: { preset: Preset | null; presetId: string | null; refUrls: string[]; baseUrl: string | null; baseIsVideo: boolean },
): Planned[] {
  const f = formats[p.format];

  if (f.kind === "video") {
    const m = videoModels[p.video!.model];
    const ratio = (m.ratios as string[]).includes(p.ratio) ? p.ratio : m.ratios[0];
    const start = ctx.baseUrl && !ctx.baseIsVideo ? ctx.baseUrl : ctx.refUrls[0] ?? null;
    const prompt = buildVideoPrompt({ brief: p.brief, preset: ctx.preset, fromImage: Boolean(start) });
    return [
      {
        endpoint: start ? m.imageToVideo : m.textToVideo,
        input: m.input({ prompt, ratio, seconds: p.video!.seconds, audio: p.video!.audio, imageUrl: start ?? undefined }),
        kind: "video",
        cost: videoCost(m, p.video!.seconds, p.video!.audio),
        plan: { seconds: p.video!.seconds, presetId: ctx.presetId, prompt, model: m.label },
      },
    ];
  }

  const editing = Boolean(ctx.baseUrl) && !ctx.baseIsVideo;
  const images = [...(editing ? [ctx.baseUrl!] : []), ...ctx.refUrls];

  if (f.kind === "carousel") {
    // Only Nano Banana 2 makes the extra-wide strips; it's also the cheap one.
    const m = imageModels["nano-banana-2"];
    const n = Math.min(6, Math.max(2, lines(p.fields.slides).length || p.slideCount || 4));
    const c = planCarousel(n, p.ratio, m.ratios);
    const pi: PromptInput = { format: "carousel", brief: p.brief, fields: p.fields, preset: ctx.preset, textMode: p.textMode, zone: p.zone, ratio: p.ratio, editing: false, refs: images.length, slides: n, safeBand: c.safeBand };
    const prompt = buildImagePrompt(pi);
    return [
      {
        endpoint: images.length ? m.edit : m.generate,
        input: imageInput(m, { prompt, aspectRatio: c.aspectRatio, quality: "max", count: 1, png: true, imageUrls: images }),
        kind: "image",
        cost: imageCost(m, "max", 1),
        plan: { carousel: { n, slideRatio: p.ratio }, presetId: ctx.presetId, prompt, model: m.label, label: `${n} slides` },
      },
    ];
  }

  const m = imageModels[p.imageModel ?? f.model] ?? imageModels[f.model];
  const angles = p.format === "ad" && !editing ? anglesFor(p.count) : [undefined];
  const perRequest = angles.length > 1 ? 1 : Math.min(Math.max(p.count, 1), 4);
  return angles.map((angle) => {
    const pi: PromptInput = {
      format: p.format,
      brief: p.brief,
      fields: p.fields,
      preset: ctx.preset,
      textMode: p.textMode,
      zone: p.zone,
      ratio: p.ratio,
      editing,
      refs: images.length,
      angle,
      platform: p.fields.platform,
    };
    const prompt = buildImagePrompt(pi);
    return {
      endpoint: images.length ? m.edit : m.generate,
      input: imageInput(m, { prompt, aspectRatio: p.ratio, quality: p.quality, count: perRequest, png: f.png, imageUrls: images }),
      kind: "image" as const,
      cost: imageCost(m, p.quality, perRequest),
      plan: { editing, presetId: ctx.presetId, prompt, model: m.label, label: angle ? `${angle.label} angle` : undefined },
    };
  });
}

export async function sendFromComposer(threadId: string, p: ComposerPayload): Promise<{ ok: true } | { ok: false; error: string }> {
  const problem = validatePayload(p);
  if (problem) return { ok: false, error: problem };
  const db = await createSupabase();

  const { data: thread } = await db.from("studio_threads").select("id, title, preset_id").eq("id", threadId).maybeSingle();
  if (!thread) return { ok: false, error: "That chat doesn't exist anymore." };
  const t = thread as Row;
  const presetId = (t.preset_id as string | null) ?? null;
  const { data: presetRow } = presetId
    ? await db.from("studio_presets").select("name, style, palette, display_font, body_font, voice, avoid, logo_key, reference_keys").eq("id", presetId).maybeSingle()
    : { data: null };
  const preset = presetFor(presetRow as Row | null);

  // Reference files: your attachments, plus the brand's logo and references if asked.
  const ids = [...new Set([...(p.attachmentIds ?? []), ...(p.baseAssetId ? [p.baseAssetId] : [])])].slice(0, 16);
  const { data: assetRows } = ids.length ? await db.from("studio_assets").select("id, kind, storage_key").in("id", ids) : { data: [] };
  const byId = new Map(((assetRows ?? []) as Row[]).map((r) => [String(r.id), r]));
  const base = p.baseAssetId ? byId.get(p.baseAssetId) : undefined;
  const refKeys = (p.attachmentIds ?? [])
    .map((id) => byId.get(id))
    .filter((r): r is Row => Boolean(r) && r!.kind === "image")
    .map((r) => String(r.storage_key));
  if (p.useBrandRefs && presetRow) {
    const pr = presetRow as Row;
    if (pr.logo_key) refKeys.push(String(pr.logo_key));
    refKeys.push(...(((pr.reference_keys as string[] | null) ?? []).slice(0, 4)));
  }
  // fal fetches these itself, so they get links that last 2 hours.
  const refUrls = refKeys.map((k) => viewUrl(k, 7200));
  const baseUrl = base ? viewUrl(String(base.storage_key), 7200) : null;

  const planned = planRequests(p, { preset, presetId, refUrls, baseUrl, baseIsVideo: base?.kind === "video" });
  const cost = planned.reduce((a, x) => a + x.cost, 0);
  const cap = capCents();
  if (cap !== null) {
    const spent = await monthSpendCents();
    if (spent + cost > cap) return { ok: false, error: `That would put you over this month's ${dollars(cap)} cap (${dollars(spent)} spent). Raise STUDIO_MONTHLY_CAP_USD to keep going.` };
  }

  const meta = { format: p.format, ratio: p.ratio, textMode: p.textMode, quality: p.quality, count: p.count, cost, fields: p.fields, editing: Boolean(baseUrl) };
  await db.from("studio_messages").insert({
    thread_id: threadId,
    role: "user",
    body: p.brief?.trim() || null,
    asset_ids: [...(p.baseAssetId ? [p.baseAssetId] : []), ...(p.attachmentIds ?? [])],
    meta,
  });

  for (const x of planned) {
    try {
      const sub = await falSubmit(x.endpoint, x.input);
      const { data: job } = await db
        .from("studio_jobs")
        .insert({
          thread_id: threadId,
          kind: x.kind,
          endpoint: x.endpoint,
          request_id: sub.requestId,
          status_url: sub.statusUrl,
          response_url: sub.responseUrl,
          format: p.format,
          ratio: p.ratio,
          input: x.input,
          plan: x.plan,
          cost_cents: x.cost,
        })
        .select("id")
        .single();
      await db.from("studio_messages").insert({ thread_id: threadId, role: "assistant", job_id: (job as Row).id, meta: { label: x.plan.label ?? null } });
    } catch (e) {
      await db.from("studio_messages").insert({ thread_id: threadId, role: "assistant", body: e instanceof Error ? e.message : "fal didn't take the request.", meta: { error: true } });
    }
  }

  const title = String(t.title);
  await db
    .from("studio_threads")
    .update(title === "Untitled" ? { title: titleFrom(p.format, p.brief, p.fields), updated_at: new Date().toISOString() } : { updated_at: new Date().toISOString() })
    .eq("id", threadId);
  return { ok: true };
}

/* 2. Checking on jobs and finishing them */

async function download(url: string): Promise<{ bytes: Uint8Array; type: string }> {
  const res = await fetch(url, { signal: AbortSignal.timeout(120_000) });
  if (!res.ok) throw new Error(`Couldn't download the result (${res.status}).`);
  return { bytes: new Uint8Array(await res.arrayBuffer()), type: (res.headers.get("content-type") ?? "").split(";")[0] };
}

async function finish(db: Db, job: Row): Promise<void> {
  const plan = (job.plan ?? {}) as Plan;
  const result = await falResult(String(job.response_url));
  if (!result.ok) throw new Error(result.error);
  const files = filesFrom(result.data);
  if (!files.length) throw new Error("fal finished but sent back no files. Usually a safety filter: reword and try again.");

  const sharp = (await import("sharp")).default;
  const base = { thread_id: job.thread_id, job_id: job.id, format: job.format, ratio: job.ratio, prompt: plan.prompt, model: plan.model, preset_id: plan.presetId ?? null };
  const saved: string[] = [];
  const keys: string[] = [];

  try {
    for (const [i, file] of files.entries()) {
      const { bytes, type } = await download(file.url);
      if (job.kind === "video") {
        const mime = type.startsWith("video/") ? type : "video/mp4";
        const key = newKey(mime);
        await putObject(key, bytes, mime);
        keys.push(key);
        const { data } = await db
          .from("studio_assets")
          .insert({ ...base, kind: "video", origin: "generated", storage_key: key, mime, bytes: bytes.byteLength, duration_s: plan.seconds ?? null })
          .select("id")
          .single();
        saved.push(String((data as Row).id));
        continue;
      }

      const meta = await sharp(bytes).metadata();
      const mime = meta.format === "png" ? "image/png" : meta.format === "webp" ? "image/webp" : "image/jpeg";
      const key = newKey(mime);
      await putObject(key, bytes, mime);
      keys.push(key);
      const { data: strip } = await db
        .from("studio_assets")
        .insert({
          ...base,
          kind: "image",
          origin: plan.editing ? "edited" : "generated",
          storage_key: key,
          mime,
          bytes: bytes.byteLength,
          width: meta.width ?? null,
          height: meta.height ?? null,
          label: plan.carousel ? "Full strip" : plan.label ? (files.length > 1 ? `${plan.label} ${i + 1}` : plan.label) : null,
          ratio: plan.carousel ? null : job.ratio,
        })
        .select("id")
        .single();
      const stripId = String((strip as Row).id);

      if (!plan.carousel) {
        saved.push(stripId);
        continue;
      }

      // Carousel: cut the strip into slides, sized for Instagram.
      const { n, slideRatio } = plan.carousel;
      const size = exportSize[slideRatio];
      const rects = sliceRects(meta.width ?? 0, meta.height ?? 0, n, slideRatio);
      for (const [k, r] of rects.entries()) {
        const slide = await sharp(bytes).extract(r).resize(size.w, size.h, { kernel: "lanczos3" }).sharpen({ sigma: 0.6 }).png({ compressionLevel: 9 }).toBuffer();
        const sk = newKey("image/png");
        await putObject(sk, new Uint8Array(slide), "image/png");
        keys.push(sk);
        const { data: sr } = await db
          .from("studio_assets")
          .insert({
            ...base,
            kind: "image",
            origin: "slide",
            storage_key: sk,
            mime: "image/png",
            bytes: slide.byteLength,
            width: size.w,
            height: size.h,
            ratio: slideRatio,
            group_id: job.id,
            slide_index: k + 1,
            parent_id: stripId,
            label: `Slide ${k + 1} of ${n}`,
          })
          .select("id")
          .single();
        saved.push(String((sr as Row).id));
      }
      saved.push(stripId);
    }
  } catch (e) {
    // Don't leave half a carousel in the bucket.
    await Promise.allSettled(keys.map(deleteObject));
    if (saved.length) await db.from("studio_assets").delete().in("id", saved);
    throw e;
  }

  const body = plan.carousel ? `${plan.carousel.n} slides, cut and sized ${exportSize[plan.carousel.slideRatio].w}x${exportSize[plan.carousel.slideRatio].h}.` : null;
  await db.from("studio_messages").update({ asset_ids: saved, body }).eq("job_id", job.id).eq("role", "assistant");
  await db.from("studio_jobs").update({ status: "done", completed_at: new Date().toISOString() }).eq("id", job.id);
}

/**
 * Called every few seconds while a chat has work in flight (and on page load, so jobs finish even
 * if you closed the tab). Only one caller can finish a job: the "finalizing" claim is atomic.
 */
export async function advanceJobs(threadId: string): Promise<void> {
  const db = await createSupabase();
  const { data } = await db.from("studio_jobs").select("*").eq("thread_id", threadId).in("status", ["queued", "running", "finalizing"]);
  const now = Date.now();

  await Promise.all(
    ((data ?? []) as Row[]).map(async (job) => {
      const age = (now - new Date(String(job.created_at)).getTime()) / 60_000;
      if (job.status === "finalizing") {
        if (age > MAX_WAIT_MIN + 10) await fail(db, job, "Saving the result got interrupted. Run it again.");
        return;
      }
      if (age > MAX_WAIT_MIN) {
        await falCancel(String(job.status_url));
        return fail(db, job, `fal didn't finish in ${MAX_WAIT_MIN} minutes, so it was canceled. Try again, or try a different model.`);
      }
      const st = await falStatus(String(job.status_url));
      if (st === "IN_PROGRESS" && job.status === "queued") await db.from("studio_jobs").update({ status: "running" }).eq("id", job.id).eq("status", "queued");
      if (st !== "COMPLETED") return;

      const { data: claimed } = await db.from("studio_jobs").update({ status: "finalizing" }).eq("id", job.id).in("status", ["queued", "running"]).select("id");
      if (!claimed?.length) return;
      try {
        await finish(db, job);
      } catch (e) {
        await fail(db, job, e instanceof Error ? e.message : "Couldn't save the result.");
      }
    }),
  );
}

async function fail(db: Db, job: Row, error: string) {
  await db.from("studio_jobs").update({ status: "failed", error, completed_at: new Date().toISOString() }).eq("id", job.id);
  await db.from("studio_messages").update({ body: error, meta: { error: true } }).eq("job_id", job.id).eq("role", "assistant");
}

export async function cancelJob(jobId: string): Promise<void> {
  const db = await createSupabase();
  const { data } = await db.from("studio_jobs").update({ status: "canceled", completed_at: new Date().toISOString() }).eq("id", jobId).in("status", ["queued", "running"]).select("status_url");
  const row = ((data ?? []) as Row[])[0];
  if (row?.status_url) await falCancel(String(row.status_url));
  await db.from("studio_messages").update({ body: "Canceled." }).eq("job_id", jobId).eq("role", "assistant");
}
