import "server-only";

/**
 * Brevo transactional email (the API, not SMTP: SMTP can't easily carry an attachment from here).
 * Brevo > Settings > SMTP & API > API Keys. The from address must be a verified sender in Brevo.
 */

export function brevoConfigured(): boolean {
  return Boolean(process.env.BREVO_API_KEY && process.env.REPORT_FROM_EMAIL);
}

export type Attachment = { name: string; content: Uint8Array };

export async function sendEmail(input: {
  to: { email: string; name?: string | null };
  subject: string;
  html: string;
  text: string;
  attachments?: Attachment[];
  /** Falls back to REPORT_REPLY_TO. */
  replyTo?: { email: string; name?: string | null } | null;
  tags?: string[];
}): Promise<{ ok: true; messageId: string | null } | { ok: false; error: string }> {
  const key = process.env.BREVO_API_KEY;
  const from = process.env.REPORT_FROM_EMAIL;
  if (!key || !from) return { ok: false, error: "Email isn't set up yet (BREVO_API_KEY and REPORT_FROM_EMAIL)." };

  const envReplyTo = process.env.REPORT_REPLY_TO;
  const replyTo = input.replyTo ?? (envReplyTo ? { email: envReplyTo } : null);
  const body = {
    sender: { email: from, name: process.env.REPORT_FROM_NAME ?? "WebTech Ninjas" },
    to: [{ email: input.to.email, ...(input.to.name ? { name: input.to.name } : {}) }],
    ...(replyTo ? { replyTo: { email: replyTo.email, ...(replyTo.name ? { name: replyTo.name } : {}) } } : {}),
    subject: input.subject,
    htmlContent: input.html,
    textContent: input.text,
    ...(input.attachments?.length
      ? { attachment: input.attachments.map((a) => ({ name: a.name, content: Buffer.from(a.content).toString("base64") })) }
      : {}),
    tags: input.tags ?? ["monthly-report"],
  };

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": key, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20_000),
    });
    const json = (await res.json().catch(() => ({}))) as { messageId?: string; message?: string; code?: string };
    if (!res.ok) {
      console.error("[brevo]", res.status, json.code, json.message);
      return { ok: false, error: json.message ? `Brevo said: ${json.message}` : `Brevo returned ${res.status}.` };
    }
    return { ok: true, messageId: json.messageId ?? null };
  } catch (e) {
    console.error("[brevo]", e);
    return { ok: false, error: "Couldn't reach Brevo. Try again in a minute." };
  }
}

export const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
