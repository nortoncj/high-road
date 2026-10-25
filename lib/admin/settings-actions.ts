"use server";

import { revalidatePath } from "next/cache";
import { inviteEmail, leadAlertEmail } from "./admin-email";
import { requireAdmin } from "./auth";
import { brevoConfigured, sendEmail } from "./brevo";
import type { FormState } from "./client-actions";
import { tables } from "./schema";
import { createSupabase } from "./supabase";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const A = tables.admins;
const base = () => process.env.ADMIN_SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://webtechninjas.com";
const day = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/New_York" });
const done = (message: string): FormState => {
  revalidatePath("/admin/settings");
  return { ok: true, message };
};

async function requireOwner() {
  const me = await requireAdmin();
  return me.role === "owner" ? me : null;
}

async function mailInvite(inviter: string, email: string, name: string | null, expiresAt: string) {
  if (!brevoConfigured()) return "Email isn't set up, so send them the link yourself: " + `${base()}/admin/login`;
  const mail = inviteEmail({ inviter, name, email, adminUrl: base(), expires: day(expiresAt) });
  const r = await sendEmail({ to: { email, name }, ...mail, tags: ["admin-invite"] });
  return r.ok ? null : `${r.error} Send them the link yourself: ${base()}/admin/login`;
}

export async function inviteAdmin(_prev: FormState, fd: FormData): Promise<FormState> {
  const me = await requireOwner();
  if (!me) return { error: "Only the owner can invite admins." };
  const values = { email: String(fd.get("email") ?? ""), name: String(fd.get("name") ?? "") };
  const email = values.email.trim().toLowerCase();
  const name = values.name.trim().slice(0, 120) || null;
  if (!EMAIL_RE.test(email)) return { error: "Fix the highlighted fields.", fields: { email: "That email doesn't look right." }, values };
  if (email === me.email.toLowerCase()) return { error: "Fix the highlighted fields.", fields: { email: "That's you." }, values };

  const db = await createSupabase();
  const { data, error } = await db
    .from("admin_invites")
    .insert({ email, full_name: name, invited_by: me.id })
    .select("id, accepted_at, expires_at")
    .single();
  if (error) {
    if (/already_admin/.test(error.message)) return { error: "Fix the highlighted fields.", fields: { email: "Already an admin." }, values };
    if (error.code === "23505") return { error: "Fix the highlighted fields.", fields: { email: "There's already an open invite. Resend it below." }, values };
    return { error: `Couldn't save the invite: ${error.message}`, values };
  }
  const row = data as { accepted_at: string | null; expires_at: string };
  // They already had an account (an admin you removed earlier): the database let them straight back in.
  if (row.accepted_at) return done(`${email} had an account already, so they're back in. No email needed.`);

  const problem = await mailInvite(me.name, email, name, row.expires_at);
  return problem ? { ok: true, message: `Invite saved. ${problem}` } : done(`Invite sent to ${email}.`);
}

export async function resendInvite(inviteId: string, _prev: FormState, _fd: FormData): Promise<FormState> {
  const me = await requireOwner();
  if (!me) return { error: "Only the owner can resend invites." };
  const db = await createSupabase();
  const expires = new Date(Date.now() + 7 * 86_400_000).toISOString();
  const { data, error } = await db.from("admin_invites").update({ expires_at: expires }).eq("id", inviteId).select("email, full_name").single();
  if (error || !data) return { error: `Couldn't resend: ${error?.message ?? "invite not found"}` };
  const inv = data as { email: string; full_name: string | null };
  const problem = await mailInvite(me.name, inv.email, inv.full_name, expires);
  return problem ? { error: problem } : done(`Sent again. Good for 7 more days.`);
}

export async function revokeInvite(inviteId: string, _prev: FormState, _fd: FormData): Promise<FormState> {
  if (!(await requireOwner())) return { error: "Only the owner can cancel invites." };
  const db = await createSupabase();
  const { error } = await db.from("admin_invites").delete().eq("id", inviteId);
  return error ? { error: `Couldn't cancel it: ${error.message}` } : done("Invite canceled. The link won't work now.");
}

export async function removeAdmin(userId: string, _prev: FormState, _fd: FormData): Promise<FormState> {
  const me = await requireOwner();
  if (!me) return { error: "Only the owner can remove admins." };
  if (userId === me.id) return { error: "You can't remove yourself." };
  const db = await createSupabase();
  // RLS refuses owners and yourself, so "0 rows" means the database said no.
  const { data, error } = await db.from(A.table).delete().eq(A.columns.userId, userId).select(A.columns.userId);
  if (error) return { error: `Couldn't remove them: ${error.message}` };
  if (!data?.length) return { error: "That admin can't be removed." };
  return done("Removed. They're signed out of everything on their next click.");
}

export async function setLeadAlerts(on: boolean): Promise<FormState> {
  const me = await requireAdmin();
  const db = await createSupabase();
  const { error } = await db.from(A.table).update({ [A.columns.leadAlerts]: on }).eq(A.columns.userId, me.id);
  return error ? { error: `Couldn't save that: ${error.message}` } : done(on ? "You'll get an email for every new lead." : "Lead emails are off for you.");
}

export async function sendTestAlert(_prev: FormState, _fd: FormData): Promise<FormState> {
  const me = await requireAdmin();
  if (!brevoConfigured()) return { error: "Email isn't set up yet. Add BREVO_API_KEY and REPORT_FROM_EMAIL." };
  const mail = leadAlertEmail(
    {
      id: "test",
      name: "Dana Ruiz",
      email: "dana@example.com",
      phone: "(407) 555-0142",
      website: "ruizheating.com",
      service: "Website design",
      source: "contact_form",
      message: "We get calls but the website form never sends anything. Can you help before spring rush?",
    },
    base(),
    true,
  );
  const r = await sendEmail({ to: { email: me.email, name: me.name }, ...mail, tags: ["lead-alert-test"] });
  return r.ok ? { ok: true, message: `Test sent to ${me.email}.` } : { error: r.error };
}
