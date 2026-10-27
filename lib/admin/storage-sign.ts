import { createHash, createHmac } from "node:crypto";

/**
 * AWS Signature V4 presigned URLs. Every S3-compatible store speaks this: Cloudflare R2,
 * DigitalOcean Spaces, AWS S3, Lightsail buckets, Backblaze B2, Wasabi. So one tiny file,
 * zero dependencies, and switching providers is an env change.
 *
 * Verified against the worked examples in AWS's SigV4 docs (see admin-preview/storage-test.ts).
 */

export type S3Config = {
  endpoint: string; // https://<account>.r2.cloudflarestorage.com, https://nyc3.digitaloceanspaces.com, https://s3.us-east-1.amazonaws.com
  region: string; // "auto" for R2, "nyc3" for Spaces, "us-east-1" for S3
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  /** "path": endpoint/bucket/key (works everywhere). "virtual": bucket.endpoint/key (AWS's preferred style). */
  style: "path" | "virtual";
};

const sha256 = (s: string) => createHash("sha256").update(s, "utf8").digest("hex");
const hmac = (key: Buffer | string, s: string) => createHmac("sha256", key).update(s, "utf8").digest();

/** RFC 3986 encoding, the way S3 wants it. Keeps / in paths, encodes it in query values. */
export function uriEncode(s: string, keepSlash: boolean): string {
  let out = "";
  for (const byte of Buffer.from(s, "utf8")) {
    const c = String.fromCharCode(byte);
    if (/[A-Za-z0-9\-._~]/.test(c) || (keepSlash && c === "/")) out += c;
    else out += `%${byte.toString(16).toUpperCase().padStart(2, "0")}`;
  }
  return out;
}

export function amzDate(d: Date): { long: string; short: string } {
  const long = d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return { long, short: long.slice(0, 8) };
}

function signingKey(secret: string, short: string, region: string, service = "s3"): Buffer {
  return hmac(hmac(hmac(hmac(`AWS4${secret}`, short), region), service), "aws4_request");
}

export function objectUrl(cfg: S3Config, key: string): URL {
  const base = new URL(cfg.endpoint);
  const path = `/${uriEncode(key.replace(/^\/+/, ""), true)}`;
  if (cfg.style === "virtual") return new URL(`${base.protocol}//${cfg.bucket}.${base.host}${path}`);
  return new URL(`${base.protocol}//${base.host}/${uriEncode(cfg.bucket, false)}${path}`);
}

/**
 * A URL anyone can use for `expires` seconds to do exactly one thing (GET, PUT, DELETE, HEAD) to one key.
 * `query` adds signed extras like response-content-disposition for downloads.
 */
export function presign(
  cfg: S3Config,
  method: "GET" | "PUT" | "DELETE" | "HEAD",
  key: string,
  opts: { expires?: number; now?: Date; query?: Record<string, string> } = {},
): string {
  const url = objectUrl(cfg, key);
  const { long, short } = amzDate(opts.now ?? new Date());
  const scope = `${short}/${cfg.region}/s3/aws4_request`;
  const params: Record<string, string> = {
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${cfg.accessKeyId}/${scope}`,
    "X-Amz-Date": long,
    "X-Amz-Expires": String(Math.min(Math.max(opts.expires ?? 3600, 1), 604800)),
    "X-Amz-SignedHeaders": "host",
    ...(opts.query ?? {}),
  };
  const query = Object.keys(params)
    .sort()
    .map((k) => `${uriEncode(k, false)}=${uriEncode(params[k], false)}`)
    .join("&");
  const canonical = [method, url.pathname, query, `host:${url.host}\n`, "host", "UNSIGNED-PAYLOAD"].join("\n");
  const toSign = ["AWS4-HMAC-SHA256", long, scope, sha256(canonical)].join("\n");
  const sig = createHmac("sha256", signingKey(cfg.secretAccessKey, short, cfg.region)).update(toSign, "utf8").digest("hex");
  return `${url.origin}${url.pathname}?${query}&X-Amz-Signature=${sig}`;
}

/** Header-signed request (used only to prove the signer against AWS's documented header example). */
export function signHeaders(
  cfg: S3Config,
  method: string,
  key: string,
  headers: Record<string, string>,
  payloadHash: string,
  now: Date,
): { authorization: string; signature: string } {
  const url = objectUrl(cfg, key);
  const { long, short } = amzDate(now);
  const all: Record<string, string> = { host: url.host, "x-amz-content-sha256": payloadHash, "x-amz-date": long };
  for (const [k, v] of Object.entries(headers)) all[k.toLowerCase()] = v.trim();
  const names = Object.keys(all).sort();
  const canonical = [method, url.pathname, "", names.map((n) => `${n}:${all[n]}\n`).join(""), names.join(";"), payloadHash].join("\n");
  const scope = `${short}/${cfg.region}/s3/aws4_request`;
  const toSign = ["AWS4-HMAC-SHA256", long, scope, sha256(canonical)].join("\n");
  const signature = createHmac("sha256", signingKey(cfg.secretAccessKey, short, cfg.region)).update(toSign, "utf8").digest("hex");
  return { signature, authorization: `AWS4-HMAC-SHA256 Credential=${cfg.accessKeyId}/${scope},SignedHeaders=${names.join(";")},Signature=${signature}` };
}
