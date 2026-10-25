import { leadSourceLabel, toLeadSource } from "./schema";

/*
 * The two emails Settings sends: "new lead" alerts and admin invites.
 * Same rules as the report email: tables and inline styles, because that's what Outlook renders.
 */

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function shell(title: string, inner: string) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#F6F2EA;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F6F2EA;">
  <tr><td align="center" style="padding:24px 12px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;font-family:Arial,Helvetica,sans-serif;color:#223438;">
      <tr><td style="padding:0 4px 14px 4px;font-size:16px;font-weight:800;font-style:italic;letter-spacing:.02em;">
        <span style="color:#30929D;">W</span><span style="color:#223438;">EBTECH</span> <span style="color:#1F5C63;">NINJAS</span>
        <span style="font-style:normal;font-weight:700;font-size:11px;letter-spacing:.12em;color:#44585B;">&nbsp;ADMIN</span>
      </td></tr>
      <tr><td style="background:#FBFAF7;border:1px solid #DCD4C6;border-radius:14px;padding:24px;">${inner}</td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

function button(href: string, label: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0 0 0;"><tr>
    <td bgcolor="#1F5C63" style="background:#1F5C63;border-radius:8px;"><a href="${esc(href)}" style="display:inline-block;padding:11px 18px;font-size:14px;font-weight:700;color:#FFFFFF;text-decoration:none;">${esc(label)}</a></td>
  </tr></table>`;
}

export type LeadForAlert = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  service: string | null;
  source: string | null;
  message: string | null;
};

/** One look tells you who, how to reach them, and what they want. Reply goes to the lead. */
export function leadAlertEmail(lead: LeadForAlert, adminUrl: string, test = false) {
  const who = lead.name?.trim() || lead.email?.split("@")[0] || "Someone";
  const how = leadSourceLabel[toLeadSource(lead.source)];
  const subject = `${test ? "[Test] " : ""}New lead: ${who}${lead.service ? ` (${lead.service})` : ""}`;
  const href = `${adminUrl.replace(/\/+$/, "")}/admin/leads?lead=${encodeURIComponent(lead.id)}`;
  const tel = lead.phone ? lead.phone.replace(/[^\d+]/g, "") : null;
  const msg = lead.message?.trim() ? (lead.message.trim().length > 600 ? `${lead.message.trim().slice(0, 600)}...` : lead.message.trim()) : null;

  const rows: [string, string][] = [];
  if (lead.email) rows.push(["Email", `<a href="mailto:${esc(lead.email)}" style="color:#1F5C63;">${esc(lead.email)}</a>`]);
  if (lead.phone) rows.push(["Phone", `<a href="tel:${esc(tel!)}" style="color:#1F5C63;">${esc(lead.phone)}</a>`]);
  if (lead.service) rows.push(["Wants", esc(lead.service)]);
  if (lead.website) rows.push(["Website", esc(lead.website)]);
  rows.push(["Came in", esc(how)]);

  const html = shell(
    subject,
    `${test ? `<p style="margin:0 0 14px 0;padding:8px 12px;background:#F5ECCF;color:#6B5408;border-radius:6px;font-size:13px;">This is a test alert. Real ones look exactly like this.</p>` : ""}
    <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#30929D;">New lead</p>
    <p style="margin:4px 0 16px 0;font-size:22px;font-weight:700;line-height:1.25;">${esc(who)}</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.5;">
      ${rows.map(([k, v]) => `<tr><td style="padding:3px 16px 3px 0;color:#44585B;vertical-align:top;white-space:nowrap;">${k}</td><td style="padding:3px 0;">${v}</td></tr>`).join("")}
    </table>
    ${msg ? `<p style="margin:16px 0 0 0;padding:12px 14px;background:#EEF4F1;border-left:3px solid #30929D;border-radius:6px;font-size:14px;line-height:1.55;white-space:pre-line;">${esc(msg)}</p>` : ""}
    ${button(href, "Open in admin")}
    <p style="margin:18px 0 0 0;font-size:12px;line-height:1.5;color:#44585B;">${lead.email ? "Hit reply to email them directly. " : ""}Turn these off in Admin &gt; Settings.</p>`,
  );

  const text = [
    `${test ? "[Test] " : ""}New lead: ${who}`,
    lead.email ? `Email: ${lead.email}` : "",
    lead.phone ? `Phone: ${lead.phone}` : "",
    lead.service ? `Wants: ${lead.service}` : "",
    lead.website ? `Website: ${lead.website}` : "",
    `Came in: ${how}`,
    msg ? `\n${msg}` : "",
    `\nOpen in admin: ${href}`,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html, text };
}

export function inviteEmail(input: { inviter: string; name: string | null; email: string; adminUrl: string; expires: string }) {
  const base = input.adminUrl.replace(/\/+$/, "");
  const href = `${base}/admin/login?invite=1&email=${encodeURIComponent(input.email)}`;
  const hi = input.name?.split(/\s+/)[0];
  const subject = `${input.inviter} added you to the WebTech Ninjas admin`;
  const html = shell(
    subject,
    `<p style="margin:0 0 12px 0;font-size:15px;line-height:1.55;">${hi ? `Hi ${esc(hi)},` : "Hi,"}</p>
    <p style="margin:0 0 12px 0;font-size:15px;line-height:1.55;">${esc(input.inviter)} invited you to the WebTech Ninjas admin: leads, clients, projects and reports.</p>
    <p style="margin:0;font-size:15px;line-height:1.55;">No password. Sign in with this email address and you'll get a 6 digit code.</p>
    ${button(href, "Sign in")}
    <p style="margin:18px 0 0 0;font-size:12px;line-height:1.5;color:#44585B;">The invite works until ${esc(input.expires)}. Not expecting this? Ignore it and nothing happens.</p>`,
  );
  const text = `${hi ? `Hi ${hi},` : "Hi,"}\n\n${input.inviter} invited you to the WebTech Ninjas admin.\nSign in with this email address and you'll get a 6 digit code:\n${href}\n\nThe invite works until ${input.expires}.`;
  return { subject, html, text };
}
