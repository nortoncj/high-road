import "server-only";
import { randomUUID } from "node:crypto";
import { presign, type S3Config } from "./storage-sign";

/**
 * Studio file storage. Works with any S3-compatible bucket; set these and nothing else changes:
 *
 *   STORAGE_ENDPOINT   https://<account-id>.r2.cloudflarestorage.com   (R2)
 *                      https://nyc3.digitaloceanspaces.com             (Spaces)
 *                      https://s3.us-east-1.amazonaws.com              (S3)
 *   STORAGE_REGION     auto (R2) | nyc3 (Spaces) | us-east-1 (S3)
 *   STORAGE_BUCKET     wtn-studio
 *   STORAGE_ACCESS_KEY_ID / STORAGE_SECRET_ACCESS_KEY
 *   STORAGE_URL_STYLE  path (default) | virtual
 *
 * The database only ever stores the key ("studio/2026/10/<uuid>.png"), never a URL. To move providers:
 * copy the bucket (rclone sync), change the env, done. Every link is presigned and short-lived,
 * so the bucket stays private: client brand assets aren't sitting on a public URL.
 */

export function storageConfig(): S3Config | null {
  const e = process.env;
  if (!e.STORAGE_ENDPOINT || !e.STORAGE_BUCKET || !e.STORAGE_ACCESS_KEY_ID || !e.STORAGE_SECRET_ACCESS_KEY) return null;
  return {
    endpoint: e.STORAGE_ENDPOINT,
    region: e.STORAGE_REGION || "auto",
    bucket: e.STORAGE_BUCKET,
    accessKeyId: e.STORAGE_ACCESS_KEY_ID,
    secretAccessKey: e.STORAGE_SECRET_ACCESS_KEY,
    style: e.STORAGE_URL_STYLE === "virtual" ? "virtual" : "path",
  };
}

export const storageReady = () => storageConfig() !== null;

function cfg(): S3Config {
  const c = storageConfig();
  if (!c) throw new Error("Storage isn't set up. Add the STORAGE_* env vars (see ADMIN_SETUP.md, Studio).");
  return c;
}

const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
};
export const extFor = (mime: string) => EXT[mime.toLowerCase()] ?? "bin";
export const ALLOWED_UPLOADS = Object.keys(EXT);

/** studio/2026/10/3f2a....png. Dated folders make a manual cleanup in the provider's dashboard easy. */
export function newKey(mime: string, folder: "out" | "in" = "out", now = new Date()): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `studio/${folder}/${y}/${m}/${randomUUID()}.${extFor(mime)}`;
}

/** Server-side upload (finished generations). */
export async function putObject(key: string, body: Uint8Array, contentType: string): Promise<void> {
  const res = await fetch(presign(cfg(), "PUT", key, { expires: 300 }), {
    method: "PUT",
    headers: { "content-type": contentType, "content-length": String(body.byteLength) },
    body: new Uint8Array(body),
    signal: AbortSignal.timeout(120_000),
  });
  if (!res.ok) throw new Error(`Storage PUT failed (${res.status}): ${(await res.text().catch(() => "")).slice(0, 200)}`);
}

/** Deleting something that's already gone counts as success. */
export async function deleteObject(key: string): Promise<void> {
  const res = await fetch(presign(cfg(), "DELETE", key, { expires: 120 }), { method: "DELETE", signal: AbortSignal.timeout(30_000) });
  if (!res.ok && res.status !== 404) throw new Error(`Storage DELETE failed (${res.status})`);
}

/** Short-lived link for previews (and for fal to fetch reference images). */
export function viewUrl(key: string, expires = 3600): string {
  return presign(cfg(), "GET", key, { expires });
}

/** Same, but the browser saves it with a real filename instead of opening it. */
export function downloadUrl(key: string, filename: string, expires = 300): string {
  const safe = filename.replace(/[^\w.\- ]+/g, "").slice(0, 120) || "download";
  return presign(cfg(), "GET", key, { expires, query: { "response-content-disposition": `attachment; filename="${safe}"` } });
}

/** The browser uploads straight to the bucket: big videos never pass through the Lightsail box. */
export function uploadUrl(key: string, expires = 900): string {
  return presign(cfg(), "PUT", key, { expires });
}
