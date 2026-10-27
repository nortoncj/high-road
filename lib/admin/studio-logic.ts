import { ratioValue, type ImageModelId, type Ratio } from "./studio-models";

/*
 * Pure Studio logic: the formats, how a prompt is written for each one, and the carousel math.
 * No I/O, so it's all unit tested (admin-preview/studio-test.ts).
 */

export type TextMode = "none" | "ai" | "exact";
export const textModeLabel: Record<TextMode, string> = { none: "No text", ai: "AI text", exact: "Exact text" };
export type Zone = "top" | "bottom" | "left" | "center";
export const zoneLabel: Record<Zone, string> = { top: "Top", bottom: "Bottom", left: "Left side", center: "Center" };

export type FormatId = "free" | "blog-hero" | "infographic" | "thumbnail" | "single" | "carousel" | "quote" | "ad" | "video";

export type Field = {
  key: string;
  label: string;
  kind: "text" | "textarea" | "lines" | "select";
  placeholder?: string;
  options?: { value: string; label: string }[];
  /** For "lines": how many lines at most. */
  max?: number;
};

export type FormatSpec = {
  id: FormatId;
  label: string;
  blurb: string;
  kind: "image" | "carousel" | "video";
  ratios: Ratio[];
  defaultRatio: Ratio;
  textModes: TextMode[];
  defaultTextMode: TextMode;
  defaultZone: Zone;
  model: ImageModelId;
  /** PNG keeps text crisp; JPEG is a third of the size for photo-style images. */
  png: boolean;
  fields: Field[];
};

export const formats: Record<FormatId, FormatSpec> = {
  free: {
    id: "free",
    label: "Anything",
    blurb: "Just describe it.",
    kind: "image",
    ratios: ["1:1", "4:5", "9:16", "16:9"],
    defaultRatio: "1:1",
    textModes: ["none", "ai", "exact"],
    defaultTextMode: "none",
    defaultZone: "bottom",
    model: "nano-banana-2",
    png: false,
    fields: [],
  },
  "blog-hero": {
    id: "blog-hero",
    label: "Blog hero",
    blurb: "Wide header image for a post.",
    kind: "image",
    ratios: ["16:9", "1:1"],
    defaultRatio: "16:9",
    textModes: ["none", "ai", "exact"],
    defaultTextMode: "none",
    defaultZone: "left",
    model: "nano-banana-2",
    png: false,
    fields: [{ key: "title", label: "Post title (only used if there's text)", kind: "text", placeholder: "5 signs your website is losing you calls" }],
  },
  infographic: {
    id: "infographic",
    label: "Infographic",
    blurb: "For PowerPoint (16:9), LinkedIn and Instagram (4:5), Stories (9:16).",
    kind: "image",
    ratios: ["4:5", "1:1", "16:9", "9:16"],
    defaultRatio: "4:5",
    textModes: ["ai", "exact"],
    defaultTextMode: "ai",
    defaultZone: "top",
    model: "nano-banana-pro",
    png: true,
    fields: [
      { key: "title", label: "Title", kind: "text", placeholder: "How a lead finds you" },
      { key: "points", label: "Points (one per line, up to 6)", kind: "lines", max: 6, placeholder: "Searches on Google\nSees your reviews\nTaps to call" },
    ],
  },
  thumbnail: {
    id: "thumbnail",
    label: "Thumbnail",
    blurb: "YouTube, LinkedIn or Facebook. Desktop is 16:9, mobile is 9:16 for Shorts and Reels.",
    kind: "image",
    ratios: ["16:9", "9:16"],
    defaultRatio: "16:9",
    textModes: ["ai", "exact", "none"],
    defaultTextMode: "ai",
    defaultZone: "left",
    model: "nano-banana-pro",
    png: false,
    fields: [
      { key: "headline", label: "Headline (5 words max reads best)", kind: "text", placeholder: "I fixed it in 10 min" },
      {
        key: "platform",
        label: "Platform",
        kind: "select",
        options: [
          { value: "youtube", label: "YouTube" },
          { value: "linkedin", label: "LinkedIn" },
          { value: "facebook", label: "Facebook" },
        ],
      },
    ],
  },
  single: {
    id: "single",
    label: "Instagram post",
    blurb: "One image for the feed. 4:5 takes up the most screen.",
    kind: "image",
    ratios: ["4:5", "1:1", "9:16"],
    defaultRatio: "4:5",
    textModes: ["none", "ai", "exact"],
    defaultTextMode: "none",
    defaultZone: "bottom",
    model: "nano-banana-2",
    png: false,
    fields: [{ key: "headline", label: "Text on it (optional)", kind: "text", placeholder: "New site, who dis" }],
  },
  carousel: {
    id: "carousel",
    label: "Carousel",
    blurb: "2 to 6 slides made as one wide image, then cut, so the swipe flows.",
    kind: "carousel",
    ratios: ["1:1", "4:5"],
    defaultRatio: "4:5",
    textModes: ["ai", "exact", "none"],
    defaultTextMode: "ai",
    defaultZone: "top",
    model: "nano-banana-2",
    png: true,
    fields: [{ key: "slides", label: "Slide text, one line per slide (2 to 6 lines)", kind: "lines", max: 6, placeholder: "Your site gets visits but no calls?\nIt's probably one of these\n1. No tap to call\n2. Slow on phones\n3. No reviews\nBook a free 20 min call" }],
  },
  quote: {
    id: "quote",
    label: "Quote graphic",
    blurb: "A quote, styled to your brand.",
    kind: "image",
    ratios: ["1:1", "4:5", "9:16"],
    defaultRatio: "4:5",
    textModes: ["ai", "exact"],
    defaultTextMode: "ai",
    defaultZone: "center",
    model: "nano-banana-pro",
    png: true,
    fields: [
      { key: "quote", label: "Quote", kind: "textarea", placeholder: "Your website should answer the phone at 2am." },
      { key: "author", label: "Who said it", kind: "text", placeholder: "Chris Norton Jr" },
    ],
  },
  ad: {
    id: "ad",
    label: "Ad",
    blurb: "Up to 4 variants, each with a different angle, so you can test them.",
    kind: "image",
    ratios: ["1:1", "4:5", "9:16", "16:9"],
    defaultRatio: "4:5",
    textModes: ["ai", "exact", "none"],
    defaultTextMode: "ai",
    defaultZone: "bottom",
    model: "nano-banana-pro",
    png: false,
    fields: [
      { key: "offer", label: "Offer", kind: "text", placeholder: "New website in 2 weeks, from $600" },
      { key: "audience", label: "Who it's for", kind: "text", placeholder: "Local HVAC owners" },
      { key: "headline", label: "Headline (optional, else one per angle)", kind: "text", placeholder: "Stop losing calls to slow sites" },
      { key: "cta", label: "Button text", kind: "text", placeholder: "Book a free call" },
    ],
  },
  video: {
    id: "video",
    label: "Video",
    blurb: "From a prompt, or animate the image you've selected.",
    kind: "video",
    ratios: ["9:16", "16:9", "1:1"],
    defaultRatio: "9:16",
    textModes: ["none"],
    defaultTextMode: "none",
    defaultZone: "bottom",
    model: "nano-banana-2",
    png: false,
    fields: [],
  },
};

export const formatOrder: FormatId[] = ["free", "single", "carousel", "quote", "thumbnail", "blog-hero", "infographic", "ad", "video"];

/** Ad variants each lead with a different angle. Proof never invents reviews or numbers. */
export const adAngles = [
  { id: "benefit", label: "Benefit", line: "Lead with the outcome the customer gets." },
  { id: "problem", label: "Problem", line: "Lead with the pain they have right now, then the fix." },
  { id: "offer", label: "Offer", line: "Lead with the offer and price, big and clear." },
  { id: "proof", label: "Credibility", line: "Show competence: real-looking work, process, the result on a phone screen. No reviews, star ratings or statistics." },
] as const;

export type Preset = {
  name: string;
  style: string | null;
  palette: { name: string; hex: string }[];
  displayFont: string | null;
  bodyFont: string | null;
  voice: string | null;
  avoid: string | null;
};

export type PromptInput = {
  format: FormatId;
  brief: string;
  fields: Record<string, string>;
  preset: Preset | null;
  textMode: TextMode;
  zone: Zone;
  ratio: Ratio;
  /** Editing the selected image (it's image 1 in image_urls). */
  editing: boolean;
  /** How many reference images ride along (logo, brand refs, uploads). */
  refs: number;
  slides?: number;
  safeBand?: number;
  angle?: (typeof adAngles)[number];
  platform?: string;
};

const clean = (s: string | undefined | null) => (s ?? "").replace(/\s+/g, " ").trim();
const quote = (s: string) => `"${clean(s).replace(/"/g, "'")}"`;
export const lines = (s: string | undefined, max = 6) =>
  (s ?? "")
    .split(/\r?\n/)
    .map((l) => clean(l))
    .filter(Boolean)
    .slice(0, max);

function brandBlock(p: Preset | null): string[] {
  if (!p) return [];
  const out: string[] = [];
  if (clean(p.style)) out.push(`Brand look (${p.name}): ${clean(p.style)}`);
  if (p.palette.length) out.push(`Color palette, use these and stay close to them: ${p.palette.map((c) => `${c.name} ${c.hex}`).join(", ")}.`);
  const fonts = [p.displayFont && `headlines in a bold font like ${p.displayFont}`, p.bodyFont && `small text in a clean sans like ${p.bodyFont}`].filter(Boolean);
  if (fonts.length) out.push(`Typography: ${fonts.join(", ")}.`);
  return out;
}

/** The words that should appear on this piece, from the format's fields. */
export function textFor(input: Pick<PromptInput, "format" | "fields" | "angle">): string[] {
  const f = input.fields;
  switch (input.format) {
    case "quote":
      return [f.quote && quote(f.quote), f.author && `- ${clean(f.author)}`].filter(Boolean) as string[];
    case "infographic":
      return [f.title && quote(f.title), ...lines(f.points).map((l, i) => `${i + 1}. ${l}`)].filter(Boolean) as string[];
    case "ad":
      return [f.headline && quote(f.headline), f.offer && quote(f.offer), f.cta && `button: ${quote(f.cta)}`].filter(Boolean) as string[];
    case "blog-hero":
      return f.title ? [quote(f.title)] : [];
    case "thumbnail":
    case "single":
      return f.headline ? [quote(f.headline)] : [];
    default:
      return [];
  }
}

function textBlock(i: PromptInput): string[] {
  if (i.textMode === "none") return ["No text, letters, numbers, logos or watermarks anywhere in the image."];
  if (i.textMode === "exact") {
    return [
      `Do not render any text, letters, numbers or logos. Leave a clean, calm, uncluttered area across the ${zoneLabel[i.zone].toLowerCase()} of the image (about a third of it) where text will be added later. Keep the subject out of that area.`,
    ];
  }
  const words = textFor(i);
  if (!words.length) return ["If you add text, keep it to a short, bold headline that is spelled correctly. No other words."];
  return [`Render this text exactly as written, spelled correctly, large and easy to read, and add no other words: ${words.join(" / ")}.`];
}

const formatBrief: Record<FormatId, (i: PromptInput) => string[]> = {
  free: () => [],
  "blog-hero": () => ["An editorial hero image for the top of a blog post. One clear focal subject, depth, natural light, room to breathe."],
  infographic: (i) => [
    `A clean infographic${i.ratio === "16:9" ? " designed as a presentation slide" : " for a social media post"}. Strong visual hierarchy: title on top, then the points as clearly separated numbered blocks with simple flat icons. Generous whitespace, consistent spacing, nothing decorative that hurts readability.`,
  ],
  thumbnail: (i) => [
    `A ${i.platform ?? "YouTube"} thumbnail${i.ratio === "9:16" ? " for a vertical Short or Reel, viewed on a phone" : ""}. It must read at a glance at small size: one big focal subject, huge bold text with a strong outline or contrast, high contrast colors, no clutter, nothing important near the edges.`,
  ],
  single: () => ["A scroll-stopping Instagram feed image. One clear subject, strong composition, polished but real."],
  carousel: (i) => {
    const n = i.slides ?? 4;
    const band = Math.round((i.safeBand ?? 1) * 100);
    const slides = lines(i.fields.slides, 6);
    return [
      `One extra-wide image made of exactly ${n} equal panels side by side. Each panel is one Instagram carousel slide in ${i.ratio} shape. The background and artwork flow continuously from panel to panel so swiping feels seamless, but no text, face or key object crosses the line between two panels.`,
      ...(band < 100 ? [`Keep every piece of text and every face inside the middle ${band}% of the height; the top and bottom will be trimmed.`] : []),
      ...(i.textMode === "ai" && slides.length ? [`Panel text, left to right: ${slides.map((s, k) => `panel ${k + 1}: ${quote(s)}`).join("; ")}.`] : []),
      `Panel 1 is the hook and must make people swipe. The last panel is a clear ending or call to action.`,
    ];
  },
  quote: () => ["A typographic quote graphic. The quote is the hero: big, beautifully set, perfect line breaks, with the attribution smaller underneath. A simple, on-brand background that never fights the words."],
  ad: (i) => [
    `A paid social ad creative for ${clean(i.fields.audience) || "local service business owners"}. Offer: ${clean(i.fields.offer) || "see brief"}. ${i.angle ? `Angle: ${i.angle.line}` : ""} One message, one focal point, a clear button-shaped call to action. Looks like a premium brand, not a template.`,
  ],
  video: () => [],
};

/** The full prompt for an image request. */
export function buildImagePrompt(i: PromptInput): string {
  const brief = clean(i.brief);
  if (i.editing) {
    return [
      `Edit image 1: ${brief || "improve it"}.`,
      "Keep everything I didn't ask to change exactly the same: composition, subject, colors, lighting and any text.",
      i.refs > 1 ? "The other images are references for what to add or match." : "",
      i.textMode === "ai" && textFor(i).length ? `Any text must read exactly: ${textFor(i).join(" / ")}.` : "",
    ]
      .filter(Boolean)
      .join(" ");
  }
  const parts = [
    ...formatBrief[i.format](i),
    brief ? `Subject and idea: ${brief}` : "",
    ...brandBlock(i.preset),
    ...textBlock(i),
    i.refs ? "Use the attached reference images for the brand's logo, style and subjects. Don't copy them literally." : "",
    `Never include: ${[clean(i.preset?.avoid), "watermarks, signatures, garbled or made-up text, extra logos, borders or frames"].filter(Boolean).join("; ")}.`,
  ];
  return parts.filter(Boolean).join("\n");
}

export function buildVideoPrompt(o: { brief: string; preset: Preset | null; fromImage: boolean }): string {
  return [
    o.fromImage ? `Animate this image: ${clean(o.brief) || "subtle, natural motion and a slow camera push in"}. Keep the subject, colors and composition.` : clean(o.brief),
    o.preset?.style && !o.fromImage ? `Look: ${clean(o.preset.style)}` : "",
    "Smooth, realistic motion. No text on screen, no watermarks.",
  ]
    .filter(Boolean)
    .join(" ");
}

/* Carousel math */

/**
 * Picks the widest ratio the model can make that's NOT wider than the strip we need.
 * Then each slice comes out a little narrower than a slide, so we trim top and bottom,
 * never the sides: the seams between slides stay perfectly lined up.
 */
export function planCarousel(n: number, slideRatio: Ratio, modelRatios: string[]) {
  const target = n * ratioValue(slideRatio);
  const wide = modelRatios.map((r) => ({ r, v: ratioValue(r) })).filter((x) => x.v >= 1);
  const fit = wide.filter((x) => x.v <= target + 1e-9).sort((a, b) => b.v - a.v)[0] ?? wide.sort((a, b) => a.v - b.v)[0];
  const pieceRatio = fit.v / n;
  const slide = ratioValue(slideRatio);
  // Share of the height each slide keeps (1 when it's a perfect fit).
  const safeBand = pieceRatio <= slide ? pieceRatio / slide : 1;
  return { aspectRatio: fit.r, target, safeBand };
}

export type Rect = { left: number; top: number; width: number; height: number };

/** Exact crop boxes for each slide out of the generated W x H strip. */
export function sliceRects(W: number, H: number, n: number, slideRatio: Ratio): Rect[] {
  const s = ratioValue(slideRatio);
  return Array.from({ length: n }, (_, i) => {
    const left = Math.round((i * W) / n);
    const right = Math.round(((i + 1) * W) / n);
    const pw = right - left;
    const idealH = pw / s;
    if (idealH <= H) {
      const h = Math.max(1, Math.round(idealH));
      return { left, top: Math.round((H - h) / 2), width: pw, height: h };
    }
    // Piece is wider than a slide (only when no ratio fit): trim the sides instead.
    const w = Math.max(1, Math.round(H * s));
    return { left: left + Math.round((pw - w) / 2), top: 0, width: w, height: H };
  });
}

/** Ad variants: one angle each, in order. */
export const anglesFor = (count: number) => adAngles.slice(0, Math.min(Math.max(count, 1), adAngles.length));

/** Thread title from the first message. */
export function titleFrom(format: FormatId, brief: string, fields: Record<string, string>): string {
  const seed = clean(fields.quote || fields.headline || fields.title || fields.offer || lines(fields.slides)[0] || brief);
  const base = seed ? (seed.length > 60 ? `${seed.slice(0, 57).trimEnd()}...` : seed) : "Untitled";
  return format === "free" ? base : `${formats[format].label}: ${base}`;
}
