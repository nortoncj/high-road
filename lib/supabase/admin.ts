import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client. Bypasses Row Level Security, so it must never reach the browser.
 * The "server-only" import makes the build fail if a client component imports this file.
 */
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
