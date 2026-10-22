import "server-only";

export type LeadForEmail = {
  name: string;
  contactMethod: "email" | "phone";
  email: string | null;
  phone: string | null;
  website: string | null;
  message: string;
  source: string;
};

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const SOURCE_LABEL: Record<string, string> = {
  book: "/book (under the calendar)",
  home: "Homepage (book a call form)",
};

/** Emails you the lead through Brevo's transactional API. Returns true if Brevo accepted it. */
export async function sendLeadAlert(lead: LeadForEmail): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  const to = process.env.LEAD_ALERT_TO;
  const from = process.env.LEAD_ALERT_FROM;
  if (!apiKey || !to || !from) {
    console.error("[lead] Brevo env vars missing");
    return false;
  }

  const origin = SOURCE_LABEL[lead.source] ?? "/contact";
  const reach = lead.contactMethod === "email" ? `Email: ${lead.email}` : `Phone/text: ${lead.phone}`;
  const lines = [
    `Name: ${lead.name}`,
    reach,
    `Website: ${lead.website || "none"}`,
    `From: ${origin}`,
    "",
    lead.message,
  ];
  const adminUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/admin/leads`;

  const html = `
    <div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.5;color:#211c16">
      <p style="margin:0 0 12px"><strong>New lead from webtechninjas.com</strong></p>
      <p style="margin:0">Name: ${esc(lead.name)}</p>
      <p style="margin:0">${esc(reach)}</p>
      <p style="margin:0">Website: ${esc(lead.website || "none")}</p>
      <p style="margin:0 0 12px">From: ${esc(origin)}</p>
      <p style="margin:0 0 16px;white-space:pre-wrap;padding:12px;background:#f6f2ea;border-radius:6px">${esc(lead.message)}</p>
      <p style="margin:0"><a href="${esc(adminUrl)}">Open your leads</a></p>
    </div>`;

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": apiKey, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        sender: { name: "WebTech Ninjas site", email: from },
        to: [{ email: to }],
        // Hit reply and it goes straight to the lead (when they gave an email).
        ...(lead.email ? { replyTo: { email: lead.email, name: lead.name } } : {}),
        subject: `New lead: ${lead.name}`,
        htmlContent: html,
        textContent: lines.join("\n"),
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error("[lead] Brevo rejected", res.status, await res.text());
    return res.ok;
  } catch (err) {
    console.error("[lead] Brevo request failed", err);
    return false;
  }
}
