import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { supabaseEnv } from "@/lib/admin/supabase";
import { dayKey, zonedDay } from "@/lib/admin/range";
import { classifySource, hostOf, isBot, parseHit } from "@/lib/admin/track-logic";

/**
 * Receives hits from /wtn.js on client sites. Public on purpose, so it:
 *   - uses the publishable key, never the service role (track_event checks the key and domain)
 *   - stores no IP and sets no cookie
 *   - always answers 204, so it can't be used to probe which site keys exist
 *
 * Short name and path on purpose: ad blockers love anything called /track or /analytics.
 */

const NO_CONTENT = () =>
  new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type",
      "cache-control": "no-store",
    },
  });

let warned = false;

/** Same person + same browser + same site + same day → same id. Tomorrow it's a new id. */
function visitorId(ip: string, ua: string, key: string, now: Date): string {
  const salt = process.env.TRACK_SALT;
  if (!salt && !warned) {
    warned = true;
    console.warn("[track] TRACK_SALT isn't set. Set any long random string so visitor ids can't be guessed.");
  }
  return createHash("sha256")
    .update(`${salt ?? "wtn"}|${dayKey(zonedDay(now))}|${ip}|${ua}|${key}`)
    .digest("hex")
    .slice(0, 20);
}

export async function OPTIONS() {
  return NO_CONTENT();
}

export async function POST(req: Request) {
  const ua = req.headers.get("user-agent") ?? "";
  if (isBot(ua)) return NO_CONTENT();

  const hit = parseHit(await req.text());
  if (!hit) return NO_CONTENT();

  // The browser sets Origin; it can't be faked from a page. The body's host is the fallback.
  const host = hostOf(req.headers.get("origin")) ?? hostOf(req.headers.get("referer")) ?? hit.host;
  if (!host) return NO_CONTENT();

  // Behind nginx on Lightsail this needs `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`
  const ip = (req.headers.get("x-forwarded-for")?.split(",")[0] ?? req.headers.get("x-real-ip") ?? "").trim();
  const now = new Date();

  const source = hit.kind === "view" && hit.first ? classifySource(hit.referrer, host, hit.utm) : null;
  const meta =
    hit.kind === "call" && hit.number ? { n: hit.number } : hit.kind === "form" && hit.form ? { f: hit.form } : null;

  try {
    const { url, key } = supabaseEnv();
    const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { error } = await db.rpc("track_event", {
      p_key: hit.key,
      p_host: host,
      p_kind: hit.kind,
      p_path: hit.path,
      p_source: source,
      p_visitor: hit.kind === "view" ? visitorId(ip, ua, hit.key, now) : null,
      p_meta: meta,
    });
    if (error) console.error("[track]", error.code, error.message);
  } catch (e) {
    console.error("[track]", e);
  }
  return NO_CONTENT();
}
