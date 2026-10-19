import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Service role client. Skips RLS, so it's ONLY for the Stripe webhook, where there's no signed-in
 * user. Never import this into a page or a server action that a person triggers.
 */
export function createServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Supabase renamed "service_role" to "secret". Either works.
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Stripe sync needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
