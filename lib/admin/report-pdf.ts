import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage, type RGB } from "pdf-lib";
import { reportPdf } from "@/content/admin";
import { brandColors, wordmark } from "@/lib/brand/logo-paths";
import { formatChange, monthName, pageLabel, type Counts } from "./report-logic";
import type { ClientReport } from "./reports";

/**
 * One page, US Letter, built with pdf-lib: pure JavaScript, so no headless Chrome on the Lightsail box.
 * Everything is drawn from the top down with `top` values in points; `y()` flips to PDF coordinates.
 * Fonts are the built-in Helvetica (no font files to ship). The logo is real vector paths.
 */

const W = 612;
const H = 792;
const M = 44;
const CW = W - M * 2;

const hex = (h: string): RGB => {
  const n = parseInt(h.slice(1), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};
const C = {
  ink: hex(brandColors.ink),
  muted: hex(brandColors.muted),
  teal: hex(brandColors.teal),
  blade: hex(brandColors.blade),
  foam: hex(brandColors.seaFoam),
  tint: hex("#EEF4F1"),
  bar: hex("#B9D9D6"),
  empty: hex("#E4DED3"),
  line: hex(brandColors.line),
  coral: hex(brandColors.coral),
  white: rgb(1, 1, 1),
};

/** Helvetica only speaks WinAnsi. Swap the usual suspects, drop anything else (emoji, CJK). */
const WIN_ANSI_EXTRA = "€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ";
export function pdfSafe(s: string): string {
  return s
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, "...")
    .replace(/[   ]/g, " ")
    .split("")
    .filter((ch) => ch.charCodeAt(0) <= 0xff || WIN_ANSI_EXTRA.includes(ch))
    .join("")
    .replace(/[\u0000-\u0009\u000B-\u001F]/g, "");
}

type Fonts = { reg: PDFFont; bold: PDFFont };

function rounded(w: number, h: number, r: number): string {
  return `M${r} 0H${w - r}Q${w} 0 ${w} ${r}V${h - r}Q${w} ${h} ${w - r} ${h}H${r}Q0 ${h} 0 ${h - r}V${r}Q0 0 ${r} 0Z`;
}

class Sheet {
  constructor(
    readonly page: PDFPage,
    readonly f: Fonts,
  ) {}

  y = (top: number) => H - top;

  text(s: string, x: number, top: number, size: number, o: { bold?: boolean; color?: RGB; align?: "left" | "right" | "center"; maxW?: number } = {}) {
    const font = o.bold ? this.f.bold : this.f.reg;
    let t = pdfSafe(s);
    if (o.maxW) t = this.fit(t, font, size, o.maxW);
    const w = font.widthOfTextAtSize(t, size);
    const dx = o.align === "right" ? -w : o.align === "center" ? -w / 2 : 0;
    // `top` is the top of the cap height, which is what lines up with boxes visually.
    this.page.drawText(t, { x: x + dx, y: this.y(top) - size * 0.72, size, font, color: o.color ?? C.ink });
    return w;
  }

  /** Cuts with an ellipsis when it won't fit. */
  fit(t: string, font: PDFFont, size: number, maxW: number): string {
    if (font.widthOfTextAtSize(t, size) <= maxW) return t;
    let lo = 0;
    let hi = t.length;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      if (font.widthOfTextAtSize(`${t.slice(0, mid)}...`, size) <= maxW) lo = mid;
      else hi = mid - 1;
    }
    return `${t.slice(0, lo).trimEnd()}...`;
  }

  /** Word wraps, returns the height used. */
  para(s: string, x: number, top: number, size: number, maxW: number, lead: number, o: { bold?: boolean; color?: RGB } = {}) {
    const font = o.bold ? this.f.bold : this.f.reg;
    const lines = this.wrap(s, size, maxW, o.bold);
    lines.forEach((l, i) => this.page.drawText(l, { x, y: this.y(top + i * lead) - size * 0.72, size, font, color: o.color ?? C.ink }));
    return lines.length * lead;
  }

  wrap(s: string, size: number, maxW: number, bold = false): string[] {
    const font = bold ? this.f.bold : this.f.reg;
    const words = pdfSafe(s).split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let line = "";
    for (const w of words) {
      const next = line ? `${line} ${w}` : w;
      if (font.widthOfTextAtSize(next, size) > maxW && line) {
        lines.push(line);
        line = w;
      } else line = next;
    }
    if (line) lines.push(line);
    return lines;
  }

  box(x: number, top: number, w: number, h: number, o: { fill?: RGB; stroke?: RGB; r?: number } = {}) {
    this.page.drawSvgPath(rounded(w, h, o.r ?? 8), {
      x,
      y: this.y(top),
      color: o.fill,
      borderColor: o.stroke,
      borderWidth: o.stroke ? 0.75 : 0,
    });
  }

  rule(x1: number, x2: number, top: number, color: RGB = C.line, t = 0.75) {
    this.page.drawLine({ start: { x: x1, y: this.y(top) }, end: { x: x2, y: this.y(top) }, thickness: t, color });
  }

  logo(x: number, top: number, height: number) {
    const scale = height / wordmark.height;
    const at = { x, y: this.y(top), scale };
    this.page.drawSvgPath(wordmark.blade, { ...at, color: C.blade });
    this.page.drawSvgPath(wordmark.n, { ...at, color: C.teal });
    this.page.drawSvgPath(wordmark.ink, { ...at, color: C.ink });
    this.page.drawSvgPath(wordmark.teal, { ...at, color: C.teal });
    return wordmark.width * scale;
  }
}

const fmt = (n: number) => n.toLocaleString("en-US");

function kpi(s: Sheet, r: ClientReport, k: keyof Counts, label: string, x: number, top: number, w: number, h: number) {
  const cur = r.cur[k];
  const prev = r.prev[k];
  s.box(x, top, w, h, { stroke: C.line, fill: C.white });
  const px = x + 14;
  s.text(label.toUpperCase(), px, top + 14, 7.5, { bold: true, color: C.muted });
  s.text(fmt(cur), px, top + 30, 26, { bold: true });

  const change = formatChange(cur, prev);
  const tone = change.dir === "up" ? C.teal : change.dir === "down" ? C.coral : C.muted;
  const versus = r.month.partial ? r.month.compareLabel : `vs ${monthName(r.month.prev)}`;
  const cw = s.text(change.text || "None", px, top + 64, 8.5, { bold: true, color: tone });
  s.text(` ${change.dir === "none" ? "this month or last" : versus}`, px + cw, top + 64, 8.5, { color: C.muted });

  // 12 month bars. Report month solid teal, the rest pale, empty months a hairline.
  const values = r.trend.map((p) => p[k]);
  const max = Math.max(1, ...values);
  const chartTop = top + 80;
  const chartH = 24;
  const gap = 3;
  const bw = (w - 28 - gap * 11) / 12;
  values.forEach((v, i) => {
    const bh = v === 0 ? 0.8 : Math.max(2, (v / max) * chartH);
    s.page.drawRectangle({
      x: px + i * (bw + gap),
      y: s.y(chartTop + chartH),
      width: bw,
      height: bh,
      color: i === 11 ? C.teal : v === 0 ? C.empty : C.bar,
    });
  });
  s.text(r.trend[0].short.toUpperCase(), px, chartTop + chartH + 5, 6.5, { color: C.muted });
  s.text(r.trend[11].short.toUpperCase(), x + w - 14, chartTop + chartH + 5, 6.5, { color: C.ink, bold: true, align: "right" });
}

export async function buildReportPdf(r: ClientReport, now: Date = new Date()): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const label = r.month.partial ? `${r.month.label}` : r.month.label;
  doc.setTitle(pdfSafe(`${r.client.name}: website report, ${label}`));
  doc.setAuthor("WebTech Ninjas");
  doc.setCreator("WebTech Ninjas admin");
  doc.setCreationDate(now);

  const page = doc.addPage([W, H]);
  const s = new Sheet(page, {
    reg: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
  });
  const P = reportPdf;

  // Header
  s.logo(M, 40, 15);
  s.text(P.eyebrow, W - M, 38, 7.5, { bold: true, color: C.teal, align: "right" });
  s.text(label, W - M, 49, 11, { bold: true, align: "right" });
  s.rule(M, W - M, 72);

  // Client
  // Long names shrink before they get cut. Nobody likes their business name chopped off.
  let nameSize = 22;
  while (nameSize > 15 && s.f.bold.widthOfTextAtSize(pdfSafe(r.client.name), nameSize) > CW) nameSize -= 1;
  s.text(r.client.name, M, 92 + (22 - nameSize) * 0.5, nameSize, { bold: true, maxW: CW });
  const domains = r.sites.map((x) => x.domain).join("  ·  ");
  if (domains) s.text(domains, M, 120, 9.5, { color: C.muted, maxW: CW });

  // Summary
  let top = 140;
  const sumPad = 14;
  const sumW = CW - sumPad * 2 - 6;
  const sumH = s.wrap(r.summary, 10.5, sumW).length * 15 - 4.5 + sumPad * 2;
  s.box(M, top, CW, sumH, { fill: C.tint, r: 10 });
  page.drawRectangle({ x: M, y: s.y(top + sumH) + 8, width: 3, height: sumH - 16, color: C.blade });
  s.para(r.summary, M + sumPad + 4, top + sumPad, 10.5, sumW, 15);
  top += sumH + 18;

  // KPIs
  const gap = 12;
  const kw = (CW - gap * 2) / 3;
  const kh = 128;
  kpi(s, r, "calls", P.stats.calls, M, top, kw, kh);
  kpi(s, r, "forms", P.stats.forms, M + kw + gap, top, kw, kh);
  kpi(s, r, "visits", P.stats.visits, M + (kw + gap) * 2, top, kw, kh);
  top += kh + 22;

  // Month by month: the numbers behind the bars, so nobody has to eyeball them.
  s.text(P.history.title, M, top, 12, { bold: true });
  top += 20;
  const labelW = 58;
  const colW = (CW - labelW) / 12;
  s.box(M + labelW + colW * 11, top - 5, colW, 58, { fill: C.tint, r: 5 });
  r.trend.forEach((p, i) => {
    const cx = M + labelW + colW * i + colW / 2;
    const last = i === 11;
    s.text(p.short.toUpperCase(), cx, top, 7, { bold: last, color: last ? C.teal : C.muted, align: "center" });
    s.text(fmt(p.calls + p.forms), cx, top + 17, 9, { bold: last, color: last ? C.teal : C.ink, align: "center" });
    s.text(fmt(p.visits), cx, top + 36, 9, { bold: last, color: last ? C.teal : C.muted, align: "center" });
  });
  s.text(P.history.leads, M, top + 17, 8.5, { bold: true });
  s.text(P.history.visits, M, top + 36, 8.5, { bold: true, color: C.muted });
  s.rule(M, W - M, top + 30, C.line, 0.5);
  top += 72;

  // Top pages (left) and sources (right)
  const leftW = 318;
  const rightX = M + leftW + 24;
  const rightW = W - M - rightX;

  s.text(P.pages.title, M, top, 12, { bold: true });
  s.text(P.sources.title, rightX, top, 12, { bold: true });
  top += 22;

  const cols = [M + leftW - 92, M + leftW - 46, M + leftW];
  s.text(P.pages.page, M, top, 7.5, { bold: true, color: C.muted });
  [P.pages.views, P.pages.calls, P.pages.forms].forEach((h, i) => s.text(h, cols[i], top, 7.5, { bold: true, color: C.muted, align: "right" }));
  let rowTop = top + 13;
  const pages = r.pages.slice(0, 8);
  if (!pages.length) {
    s.text(P.pages.empty, M, rowTop + 6, 9, { color: C.muted });
  }
  for (const p of pages) {
    s.rule(M, M + leftW, rowTop, C.line, 0.5);
    s.text(pageLabel(p.path), M, rowTop + 6, 9, { maxW: leftW - 150 });
    s.text(fmt(p.views), cols[0], rowTop + 6, 9, { align: "right" });
    s.text(fmt(p.calls), cols[1], rowTop + 6, 9, { align: "right", bold: p.calls > 0, color: p.calls ? C.teal : C.muted });
    s.text(fmt(p.forms), cols[2], rowTop + 6, 9, { align: "right", bold: p.forms > 0, color: p.forms ? C.teal : C.muted });
    rowTop += 19;
  }

  let srcTop = top;
  if (!r.sources.length) s.text(P.sources.empty, rightX, srcTop + 6, 9, { color: C.muted });
  r.sources.slice(0, 7).forEach((x, i) => {
    s.text(x.label, rightX, srcTop, 9, { maxW: rightW - 40 });
    s.text(`${Math.round(x.share)}%`, W - M, srcTop, 9, { bold: true, align: "right" });
    s.box(rightX, srcTop + 13, rightW, 4, { fill: C.empty, r: 2 });
    s.box(rightX, srcTop + 13, Math.max(4, (rightW * x.share) / 100), 4, { fill: i === 0 ? C.teal : C.bar, r: 2 });
    srcTop += 27;
  });

  // Footer
  const footTop = H - 70;
  s.rule(M, W - M, footTop);
  s.para(P.howWeCount, M, footTop + 10, 7.5, CW, 10.5, { color: C.muted });
  s.text(P.footer, M, H - 34, 7.5, { bold: true, color: C.teal });
  s.text(
    `Generated ${now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/New_York" })}`,
    W - M,
    H - 34,
    7.5,
    { color: C.muted, align: "right" },
  );

  return doc.save();
}

/** "webtech-ninjas-report-acme-hvac-2026-09.pdf" */
export function reportFileName(clientName: string, monthKey: string): string {
  const slug = clientName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "client";
  return `webtech-ninjas-report-${slug}-${monthKey}.pdf`;
}
