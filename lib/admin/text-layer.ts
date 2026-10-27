/**
 * "Exact text" mode: your words drawn on top of the AI art with canvas, in your brand fonts.
 * Never misspells. Browser only (needs a canvas), but no React, so it can be tested on its own.
 */

export type Scrim = "none" | "fade" | "band";
export type LayerZone = "top" | "bottom" | "left" | "center";

export type TextLayerOptions = {
  headline: string;
  sub: string;
  cta: string;
  zone: LayerZone;
  align: "left" | "center";
  scale: number; // 0.6 to 1.6
  color: string; // text
  accent: string; // button
  scrim: Scrim;
  scrimColor: string;
  scrimOpacity: number; // 0 to 1
  displayFont: string;
  bodyFont: string;
};

type Box = { x: number; y: number; w: number; h: number };

const hexToRgb = (hex: string) => {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const rgba = (hex: string, a: number) => `rgba(${hexToRgb(hex).join(",")},${a})`;
/** Black or white, whichever reads better on this color. */
export function readableOn(hex: string): string {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.4 ? "#14171C" : "#FFFFFF";
}

export function zoneBox(zone: LayerZone, W: number, H: number): Box {
  const pad = Math.round(Math.min(W, H) * 0.06);
  switch (zone) {
    case "top":
      return { x: pad, y: pad, w: W - pad * 2, h: Math.round(H * 0.38) };
    case "bottom":
      return { x: pad, y: Math.round(H * 0.62) - pad, w: W - pad * 2, h: Math.round(H * 0.38) };
    case "left":
      return { x: pad, y: pad, w: Math.round(W * 0.5) - pad, h: H - pad * 2 };
    default:
      return { x: Math.round(W * 0.1), y: Math.round(H * 0.18), w: Math.round(W * 0.8), h: Math.round(H * 0.64) };
  }
}

/** Greedy word wrap with the real font metrics. A single word longer than the line still gets its own line. */
export function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const out: string[] = [];
  for (const para of text.split(/\n/)) {
    const words = para.split(/\s+/).filter(Boolean);
    let line = "";
    for (const w of words) {
      const next = line ? `${line} ${w}` : w;
      if (ctx.measureText(next).width > maxW && line) {
        out.push(line);
        line = w;
      } else line = next;
    }
    if (line) out.push(line);
  }
  return out;
}

/** Same line count, but the narrowest width that keeps it: lines come out even, no lonely last word. */
export function balance(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const first = wrap(ctx, text, maxW);
  if (first.length < 2) return first;
  let lo = maxW * 0.5;
  let hi = maxW;
  for (let i = 0; i < 12; i++) {
    const mid = (lo + hi) / 2;
    if (wrap(ctx, text, mid).length > first.length) lo = mid;
    else hi = mid;
  }
  return wrap(ctx, text, hi);
}

export type Laid = { box: Box; headSize: number; head: string[]; subSize: number; sub: string[]; ctaSize: number; blockH: number; top: number };

/** Biggest text that fits the zone. Shrinks in 8% steps until everything fits. */
export function layout(ctx: CanvasRenderingContext2D, o: TextLayerOptions, W: number, H: number): Laid {
  const box = zoneBox(o.zone, W, H);
  let headSize = Math.min(W, H) * 0.09 * Math.min(Math.max(o.scale, 0.6), 1.6);
  for (let i = 0; i < 30; i++) {
    const subSize = headSize * 0.42;
    const ctaSize = headSize * 0.36;
    ctx.font = `800 ${headSize}px "${o.displayFont}", system-ui, sans-serif`;
    const head = o.headline.trim() ? balance(ctx, o.headline.trim(), box.w) : [];
    ctx.font = `500 ${subSize}px "${o.bodyFont}", system-ui, sans-serif`;
    const sub = o.sub.trim() ? wrap(ctx, o.sub.trim(), box.w) : [];
    const gap = headSize * 0.35;
    const blockH =
      head.length * headSize * 1.08 + (sub.length ? gap + sub.length * subSize * 1.35 : 0) + (o.cta.trim() ? gap * 1.4 + ctaSize * 2.4 : 0);
    if (blockH <= box.h || headSize < Math.min(W, H) * 0.025) {
      const top = o.zone === "top" ? box.y : o.zone === "bottom" ? box.y + box.h - blockH : box.y + (box.h - blockH) / 2;
      return { box, headSize, head, subSize, sub, ctaSize, blockH, top };
    }
    headSize *= 0.92;
  }
  throw new Error("layout didn't converge");
}

function scrim(ctx: CanvasRenderingContext2D, o: TextLayerOptions, l: Laid, W: number, H: number) {
  if (o.scrim === "none") return;
  const pad = Math.round(Math.min(W, H) * 0.06);
  if (o.scrim === "band") {
    ctx.fillStyle = rgba(o.scrimColor, o.scrimOpacity);
    if (o.zone === "left") ctx.fillRect(0, 0, l.box.x + l.box.w + pad, H);
    else if (o.zone === "center") {
      const r = pad * 0.6;
      const x = l.box.x - pad;
      const y = l.top - pad;
      const w = l.box.w + pad * 2;
      const h = l.blockH + pad * 2;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, r);
      ctx.fill();
    } else ctx.fillRect(0, l.top - pad, W, l.blockH + pad * 2);
    return;
  }
  // Soft fade from the edge the text sits on.
  const g =
    o.zone === "top"
      ? ctx.createLinearGradient(0, 0, 0, l.top + l.blockH + pad * 2)
      : o.zone === "bottom"
        ? ctx.createLinearGradient(0, H, 0, l.top - pad * 2)
        : o.zone === "left"
          ? ctx.createLinearGradient(0, 0, l.box.x + l.box.w + pad * 3, 0)
          : ctx.createRadialGradient(W / 2, l.top + l.blockH / 2, 0, W / 2, l.top + l.blockH / 2, Math.max(l.box.w, l.blockH) * 0.75);
  g.addColorStop(0, rgba(o.scrimColor, o.scrimOpacity));
  g.addColorStop(o.zone === "center" ? 0.6 : 0.55, rgba(o.scrimColor, o.scrimOpacity * 0.75));
  g.addColorStop(1, rgba(o.scrimColor, 0));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

/** Draws the image and the text. Returns the layout so tests can check it. */
export function drawTextLayer(ctx: CanvasRenderingContext2D, img: CanvasImageSource, W: number, H: number, o: TextLayerOptions): Laid {
  ctx.clearRect(0, 0, W, H);
  ctx.drawImage(img, 0, 0, W, H);
  const l = layout(ctx, o, W, H);
  scrim(ctx, o, l, W, H);

  const x = o.align === "center" ? l.box.x + l.box.w / 2 : l.box.x;
  ctx.textAlign = o.align;
  ctx.textBaseline = "top";
  if (o.scrim === "none") {
    // Without a backdrop, a soft shadow keeps text readable on busy art.
    ctx.shadowColor = "rgba(0,0,0,0.45)";
    ctx.shadowBlur = l.headSize * 0.25;
    ctx.shadowOffsetY = l.headSize * 0.04;
  }
  let y = l.top;
  ctx.fillStyle = o.color;
  ctx.font = `800 ${l.headSize}px "${o.displayFont}", system-ui, sans-serif`;
  for (const line of l.head) {
    ctx.fillText(line, x, y);
    y += l.headSize * 1.08;
  }
  if (l.sub.length) {
    y += l.headSize * 0.35;
    ctx.font = `500 ${l.subSize}px "${o.bodyFont}", system-ui, sans-serif`;
    for (const line of l.sub) {
      ctx.fillText(line, x, y);
      y += l.subSize * 1.35;
    }
  }
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  if (o.cta.trim()) {
    y += l.headSize * 0.35 * 1.4;
    ctx.font = `700 ${l.ctaSize}px "${o.bodyFont}", system-ui, sans-serif`;
    const tw = ctx.measureText(o.cta.trim()).width;
    const bw = tw + l.ctaSize * 2;
    const bh = l.ctaSize * 2.4;
    const bx = o.align === "center" ? x - bw / 2 : x;
    ctx.fillStyle = o.accent;
    ctx.beginPath();
    ctx.roundRect(bx, y, bw, bh, bh / 2);
    ctx.fill();
    ctx.fillStyle = readableOn(o.accent);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(o.cta.trim(), bx + bw / 2, y + bh / 2 + l.ctaSize * 0.04);
  }
  return l;
}

/** Loads any Google Font by name for the canvas. Falls back to system sans if it can't. */
const loaded = new Set<string>();
export async function ensureFont(family: string): Promise<void> {
  if (!family || loaded.has(family)) return;
  loaded.add(family);
  const id = `gf-${family.replace(/\W+/g, "-")}`;
  if (!document.getElementById(id)) {
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@500;700;800&display=swap`;
    document.head.appendChild(link);
  }
  try {
    await Promise.race([Promise.all([document.fonts.load(`800 48px "${family}"`), document.fonts.load(`500 24px "${family}"`)]), new Promise((r) => setTimeout(r, 3000))]);
  } catch {
    // System font it is.
  }
}
