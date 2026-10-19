"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { login } from "@/content/admin";
import { createSupabase } from "@/lib/admin/supabase";
import { NEXT_COOKIE, safeNext } from "@/lib/admin/session";

export type LoginState = {
  step: "email" | "code";
  email?: string;
  error?: string;
  /** Bumps on every send so the client restarts its resend countdown. */
  sentAt?: number;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function siteOrigin(): Promise<string> {
  const fromEnv = process.env.ADMIN_SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/**
 * Step 1: email in, code and link out.
 *
 * Supabase sends the email through your Brevo SMTP (set up in the Supabase dashboard, no Brevo
 * code in here). shouldCreateUser: false means an address without an account gets nothing,
 * and we show the same "check your email" either way so the form can't be used to find out
 * which addresses are admins.
 */
export async function sendCode(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!EMAIL_RE.test(email)) return { step: "email", email, error: login.errors.email };

  const next = safeNext(String(formData.get("next") ?? ""));
  const cookieStore = await cookies();
  cookieStore.set(NEXT_COOKIE, next, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/admin", maxAge: 60 * 30 });

  const supabase = await createSupabase();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false, emailRedirectTo: `${await siteOrigin()}/admin/auth/confirm` },
  });

  if (error) {
    if (error.status === 429) return { step: "email", email, error: login.errors.rateLimited };
    // No account for this email. Say nothing different, on purpose.
    const unknownUser = error.code === "otp_disabled" || /signups not allowed/i.test(error.message);
    if (!unknownUser) {
      console.error("[admin] signInWithOtp failed", error.status, error.code, error.message);
      return { step: "email", email, error: login.errors.send };
    }
  }

  return { step: "code", email, sentAt: Date.now() };
}

/** Step 2a: typed the code. Works on any device, which is the point of having a code at all. */
export async function verifyCode(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const token = String(formData.get("code") ?? "").replace(/\D/g, "");
  if (token.length !== login.codeLength) return { step: "code", email, error: login.errors.code };

  const supabase = await createSupabase();
  const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
  if (error) return { step: "code", email, error: login.errors.badCode };

  const cookieStore = await cookies();
  const next = safeNext(cookieStore.get(NEXT_COOKIE)?.value);
  cookieStore.delete(NEXT_COOKIE);
  redirect(next);
}

/** Step 2b: tapped the link, then the button on /admin/auth/confirm. */
export async function confirmLink(formData: FormData): Promise<void> {
  const tokenHash = String(formData.get("token_hash") ?? "");
  const type = String(formData.get("type") ?? "email") as EmailOtpType;
  if (!tokenHash) redirect("/admin/login?error=link");

  const supabase = await createSupabase();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
  if (error) {
    // The code and the link share one token, so typing the code first "uses up" the link.
    // Already signed in? Carry on instead of showing an error.
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.error("[admin] verifyOtp (link) failed", error.status, error.code, error.message);
      redirect("/admin/login?error=link");
    }
  }

  const cookieStore = await cookies();
  const next = safeNext(cookieStore.get(NEXT_COOKIE)?.value);
  cookieStore.delete(NEXT_COOKIE);
  redirect(next);
}

export async function signOut(): Promise<void> {
  const supabase = await createSupabase();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
