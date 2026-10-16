"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isAdminEmail, requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";
import { allow } from "@/lib/rate-limit";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/leads";

// "use server" files may only export async functions (types are fine, they disappear at build).
export type LoginState = { sent?: boolean; error?: string };

/** Emails a magic login link, but only to ADMIN_EMAIL. Everyone gets the same "check your email" reply. */
export async function sendMagicLink(_prev: LoginState, fd: FormData): Promise<LoginState> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!allow(`login:${ip}`, 5, 15 * 60 * 1000)) return { error: "Too many tries. Wait a few minutes." };

  if (isAdminEmail(email)) {
    const supabase = await supabaseServer();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false, // nobody can sign themselves up
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });
    if (error) console.error("[admin] magic link failed", error.message);
  }
  return { sent: true };
}

export async function signOut() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

/** Changes a lead's status from the admin page. */
export async function updateLeadStatus(id: string, status: LeadStatus) {
  await requireAdmin();
  if (!LEAD_STATUSES.includes(status)) throw new Error("Bad status");

  const { error } = await supabaseAdmin().from("leads").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/leads");
}
