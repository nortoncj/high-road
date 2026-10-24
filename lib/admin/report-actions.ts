"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "./auth";
import { brevoConfigured, sendEmail } from "./brevo";
import type { FormState } from "./client-actions";
import { buildReportPdf, reportFileName } from "./report-pdf";
import { reportEmail } from "./report-email";
import { getClientReport } from "./reports";
import { createSupabase } from "./supabase";
import { normalizeDomain } from "./track-logic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MONTH_RE = /^\d{4}-\d{2}$/;

function touch(clientId: string) {
  revalidatePath("/admin/reports");
  revalidatePath(`/admin/reports/${clientId}`);
  revalidatePath(`/admin/clients/${clientId}`);
}

/** Builds the PDF, emails it through Brevo, logs the send. */
export async function emailReport(clientId: string, monthKey: string, _prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const values = { to: String(fd.get("to") ?? ""), note: String(fd.get("note") ?? "") };
  const to = values.to.trim().toLowerCase();
  const note = values.note.trim().slice(0, 1500) || null;

  if (!EMAIL_RE.test(to)) return { error: "Fix the highlighted fields.", fields: { to: "That email doesn't look right." }, values };
  if (!MONTH_RE.test(monthKey)) return { error: "Pick a month first." };
  if (!brevoConfigured()) return { error: "Email isn't set up yet. Add BREVO_API_KEY and REPORT_FROM_EMAIL to your env.", values };

  const loaded = await getClientReport(clientId, monthKey);
  if (!loaded) return { error: "That client doesn't exist anymore." };
  if (!loaded.ok) return { error: `Couldn't load the report: ${loaded.issue.message}`, values };
  const r = loaded.data;
  if (!r.sites.length) return { error: "This client has no tracked site, so there's nothing to send.", values };

  const pdf = await buildReportPdf(r);
  const mail = reportEmail(r, note);
  const sent = await sendEmail({
    to: { email: to, name: to === r.client.email ? r.client.contactName : null },
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
    attachments: [{ name: reportFileName(r.client.name, r.month.key), content: pdf }],
  });
  if (!sent.ok) return { error: sent.error, values };

  const db = await createSupabase();
  const { error } = await db
    .from("report_sends")
    .insert({ client_id: clientId, month: `${r.month.key}-01`, to_email: to, message_id: sent.messageId });
  // The email already went. Say so, even if the log write failed.
  if (error) {
    console.error("[reports] send log:", error.message);
    return { ok: true, message: `Sent to ${to}, but it didn't get logged (${error.message}).` };
  }
  touch(clientId);
  return { ok: true, message: `Sent to ${to}.` };
}

/** Adds a domain to track. The snippet shows up right away on the client page. */
export async function addSite(clientId: string, _prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const raw = String(fd.get("domain") ?? "");
  const domain = normalizeDomain(raw);
  if (!domain) return { error: "Fix the highlighted fields.", fields: { domain: "Use a domain like acmehvac.com." }, values: { domain: raw } };

  const db = await createSupabase();
  const { error } = await db.from("client_sites").insert({ client_id: clientId, domain });
  if (error) {
    const dupe = error.code === "23505";
    return {
      error: dupe ? "Fix the highlighted fields." : `Couldn't add it: ${error.message}`,
      fields: dupe ? { domain: "That site is already on this client." } : undefined,
      values: { domain: raw },
    };
  }
  touch(clientId);
  return { ok: true, message: `Added ${domain}. Paste the snippet on the site next.` };
}

/** Pause keeps the history and stops counting. Nothing is deleted. */
export async function setSiteActive(siteId: string, clientId: string, active: boolean, _prev: FormState, _fd: FormData): Promise<FormState> {
  await requireAdmin();
  const db = await createSupabase();
  const { error } = await db.from("client_sites").update({ active }).eq("id", siteId);
  if (error) return { error: `Couldn't update it: ${error.message}` };
  touch(clientId);
  return { ok: true, message: active ? "Tracking is back on." : "Paused. History is kept." };
}
