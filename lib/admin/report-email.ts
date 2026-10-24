import { reportPage, reportPdf } from "@/content/admin";
import { formatChange, monthLabel, monthName, type Counts } from "./report-logic";
import type { ClientReport } from "./reports";

/**
 * The email that carries the PDF. Short on purpose: the numbers up top, the PDF for the rest.
 * Table layout and inline styles because that's what Outlook and Gmail actually render.
 */

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function reportEmail(r: ClientReport, note: string | null) {
  const e = reportPage.email;
  const month = r.month.partial ? `${monthName(r.month.ym)} so far` : monthLabel(r.month.ym);
  const first = r.client.contactName?.split(/\s+/)[0] ?? null;
  const subject = e.subject(r.client.name, month);
  const versus = r.month.partial ? r.month.compareLabel : `vs ${monthName(r.month.prev)}`;

  const stats: { label: string; k: keyof Counts }[] = [
    { label: reportPdf.stats.calls, k: "calls" },
    { label: reportPdf.stats.forms, k: "forms" },
    { label: reportPdf.stats.visits, k: "visits" },
  ];

  const cell = (s: (typeof stats)[number]) => {
    const change = formatChange(r.cur[s.k], r.prev[s.k]);
    const color = change.dir === "up" ? "#1F5C63" : change.dir === "down" ? "#C2185B" : "#44585B";
    return `<td width="33%" style="padding:14px 12px;border:1px solid #DCD4C6;border-radius:10px;background:#FFFFFF;">
      <div style="font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#44585B;">${esc(s.label)}</div>
      <div style="font-size:26px;font-weight:700;color:#223438;line-height:1.2;margin-top:4px;">${r.cur[s.k].toLocaleString("en-US")}</div>
      <div style="font-size:12px;color:#44585B;margin-top:2px;">${change.text ? `<b style="color:${color};">${change.text}</b> ${esc(versus)}` : "&nbsp;"}</div>
    </td>`;
  };

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#F6F2EA;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F6F2EA;">
  <tr><td align="center" style="padding:28px 12px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;font-family:Arial,Helvetica,sans-serif;color:#223438;">
      <tr><td style="padding:0 4px 16px 4px;font-size:18px;font-weight:800;font-style:italic;letter-spacing:.02em;">
        <span style="color:#30929D;">W</span><span style="color:#223438;">EBTECH</span> <span style="color:#1F5C63;">NINJAS</span>
      </td></tr>
      <tr><td style="background:#FBFAF7;border:1px solid #DCD4C6;border-radius:14px;padding:28px 24px;">
        <p style="margin:0 0 12px 0;font-size:15px;line-height:1.55;">${esc(e.greeting(first))}</p>
        <p style="margin:0 0 12px 0;font-size:15px;line-height:1.55;">${esc(e.intro(r.client.name, month))}</p>
        <p style="margin:0 0 20px 0;font-size:15px;line-height:1.55;padding:12px 14px;background:#EEF4F1;border-left:3px solid #30929D;border-radius:6px;">${esc(r.summary)}</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="6" style="border-collapse:separate;margin:0 -6px;">
          <tr>${stats.map(cell).join("")}</tr>
        </table>
        ${note ? `<p style="margin:20px 0 0 0;font-size:15px;line-height:1.55;white-space:pre-line;">${esc(note)}</p>` : ""}
        <p style="margin:20px 0 0 0;font-size:15px;line-height:1.55;">${esc(e.attached)} ${esc(e.signoff)}</p>
      </td></tr>
      <tr><td style="padding:16px 4px 0 4px;font-size:12px;line-height:1.5;color:#44585B;">${esc(reportPdf.howWeCount)}</td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;

  const text = [
    e.greeting(first),
    "",
    e.intro(r.client.name, month),
    "",
    r.summary,
    "",
    ...stats.map((s) => {
      const c = formatChange(r.cur[s.k], r.prev[s.k]);
      return `${s.label}: ${r.cur[s.k].toLocaleString("en-US")}${c.text ? ` (${c.text} ${versus})` : ""}`;
    }),
    ...(note ? ["", note] : []),
    "",
    `${e.attached} ${e.signoff}`,
  ].join("\n");

  return { subject, html, text };
}
