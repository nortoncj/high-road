"use client";

import { registerUpload, requestUpload } from "@/lib/admin/studio-actions";
import type { AssetView } from "@/lib/admin/studio-types";

/** Size of an image or the length of a video, read in the browser before it uploads. */
export function measure(file: Blob): Promise<{ width: number | null; height: number | null; durationS: number | null }> {
  const url = URL.createObjectURL(file);
  const done = <T,>(v: T) => {
    URL.revokeObjectURL(url);
    return v;
  };
  if (file.type.startsWith("video/")) {
    return new Promise((resolve) => {
      const v = document.createElement("video");
      v.preload = "metadata";
      v.onloadedmetadata = () => resolve(done({ width: v.videoWidth || null, height: v.videoHeight || null, durationS: Number.isFinite(v.duration) ? Math.round(v.duration * 100) / 100 : null }));
      v.onerror = () => resolve(done({ width: null, height: null, durationS: null }));
      v.src = url;
    });
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(done({ width: img.naturalWidth, height: img.naturalHeight, durationS: null }));
    img.onerror = () => resolve(done({ width: null, height: null, durationS: null }));
    img.src = url;
  });
}

/** Puts a file straight into the bucket with a one-time link. Returns just the key (presets use this). */
export async function putFile(file: Blob, onProgress?: (pct: number) => void): Promise<{ ok: true; key: string } | { ok: false; error: string }> {
  const req = await requestUpload({ type: file.type, size: file.size });
  if (!req.ok || !req.data) return { ok: false, error: req.ok ? "Couldn't start the upload." : req.error };
  const { key, url } = req.data;
  const ok = await new Promise<boolean>((resolve) => {
    // XHR, not fetch, so big videos can show progress.
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("content-type", file.type);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => resolve(xhr.status >= 200 && xhr.status < 300);
    xhr.onerror = () => resolve(false);
    xhr.send(file);
  });
  return ok ? { ok: true, key } : { ok: false, error: "The upload was blocked. Usually the bucket's CORS rules: see ADMIN_SETUP.md, Studio." };
}

/** Upload + record as a Studio asset (chat attachments, text-layer saves, video frames). */
export async function uploadAsset(
  file: Blob,
  opts: { threadId: string | null; origin?: "upload" | "text-layer" | "frame"; parentId?: string | null; label?: string | null; onProgress?: (pct: number) => void },
): Promise<{ ok: true; asset: AssetView } | { ok: false; error: string }> {
  const dims = await measure(file);
  const put = await putFile(file, opts.onProgress);
  if (!put.ok) return put;
  const reg = await registerUpload({ threadId: opts.threadId, key: put.key, mime: file.type, ...dims, origin: opts.origin, parentId: opts.parentId, label: opts.label });
  return reg.ok && reg.data ? { ok: true, asset: reg.data } : { ok: false, error: reg.ok ? "Couldn't save it." : reg.error };
}
