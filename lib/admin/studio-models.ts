/**
 * The fal models Studio uses, with prices in cents. One place to swap models when better ones ship:
 * change the endpoint here and the rest of Studio follows.
 *
 * Prices are from fal's published pricing (Oct 2026) and are ESTIMATES shown before you run anything.
 * Your fal dashboard is the real bill.
 */

export type Ratio = "1:1" | "4:5" | "9:16" | "16:9";
export const ratios: Ratio[] = ["1:1", "4:5", "9:16", "16:9"];
export const ratioValue = (r: string) => {
  const [w, h] = r.split(":").map(Number);
  return w / h;
};

/** Where finished files are sized for export (and what carousel slides get resized to). */
export const exportSize: Record<Ratio, { w: number; h: number }> = {
  "1:1": { w: 1080, h: 1080 },
  "4:5": { w: 1080, h: 1350 },
  "9:16": { w: 1080, h: 1920 },
  "16:9": { w: 1920, h: 1080 },
};

export type Quality = "draft" | "standard" | "max";
export const qualityLabel: Record<Quality, string> = { draft: "Draft (1K)", standard: "Standard (2K)", max: "Max (4K)" };

export type ImageModelId = "nano-banana-pro" | "nano-banana-2" | "seedream-5-pro" | "seedream-4.5" | "flux-2-pro";

type ImageRequest = { prompt: string; aspectRatio: string; quality: Quality; count: number; png: boolean; imageUrls?: string[] };

export type ImageModel = {
  id: ImageModelId;
  label: string;
  note: string;
  generate: string;
  edit: string;
  /** Every aspect_ratio value the endpoint accepts. Carousels pick from these. */
  ratios: string[];
  cents: Record<Quality, number>;
  /** Extra cost per reference image (some models bill for inputs). */
  refCents?: number;
  maxRefs: number;
  /** Most images one request can return. More than that is split into several requests. */
  perRequest: number;
  input: (o: ImageRequest) => Record<string, unknown>;
};

const baseRatios = ["21:9", "16:9", "3:2", "4:3", "5:4", "1:1", "4:5", "3:4", "2:3", "9:16"];

/** Width x height for a ratio at about `mp` megapixels, multiples of 16, no side over `maxSide`. */
export function sizeFor(ratio: string, mp: number, maxSide = 4096) {
  const r = ratioValue(ratio);
  let w = Math.sqrt(mp * 1024 * 1024 * r);
  let h = w / r;
  const over = Math.max(w, h) / maxSide;
  if (over > 1) {
    w /= over;
    h /= over;
  }
  const r16 = (n: number) => Math.max(16, Math.round(n / 16) * 16);
  return { width: r16(w), height: r16(h) };
}

const nanoInput =
  (resolution: Record<Quality, string>) =>
  (o: ImageRequest): Record<string, unknown> => ({
    prompt: o.prompt,
    aspect_ratio: o.aspectRatio,
    resolution: resolution[o.quality],
    num_images: o.count,
    output_format: o.png ? "png" : "jpeg",
    ...(o.imageUrls?.length ? { image_urls: o.imageUrls } : {}),
  });

export const imageModels: Record<ImageModelId, ImageModel> = {
  "nano-banana-pro": {
    id: "nano-banana-pro",
    label: "Nano Banana Pro",
    note: "Best text and layout. Use for quotes, infographics, ads, thumbnails.",
    generate: "fal-ai/nano-banana-pro",
    edit: "fal-ai/nano-banana-pro/edit",
    ratios: baseRatios,
    cents: { draft: 15, standard: 15, max: 30 },
    maxRefs: 14,
    perRequest: 4,
    input: nanoInput({ draft: "1K", standard: "2K", max: "4K" }),
  },
  "nano-banana-2": {
    id: "nano-banana-2",
    label: "Nano Banana 2",
    note: "Half the price, fast, and the only one that makes extra-wide images (carousels).",
    generate: "fal-ai/nano-banana-2",
    edit: "fal-ai/nano-banana-2/edit",
    ratios: [...baseRatios, "4:1", "1:4", "8:1", "1:8"],
    cents: { draft: 8, standard: 12, max: 16 },
    maxRefs: 14,
    perRequest: 4,
    input: nanoInput({ draft: "1K", standard: "2K", max: "4K" }),
  },
  "seedream-5-pro": {
    id: "seedream-5-pro",
    label: "Seedream 5 Pro",
    note: "Strong on posters, infographics and busy layouts. Thinks before it draws. Up to 2K.",
    generate: "bytedance/seedream/v5/pro/text-to-image",
    edit: "bytedance/seedream/v5/pro/edit",
    ratios: baseRatios,
    // Custom sizes bill at 2x the $0.0675 base. The first reference is free, the rest are about half a cent.
    cents: { draft: 14, standard: 14, max: 14 },
    refCents: 0.45,
    maxRefs: 10,
    perRequest: 4,
    // Total pixels must stay between 0.92 and 4.6 MP.
    input: (o) => ({
      prompt: o.prompt,
      image_size: sizeFor(o.aspectRatio, o.quality === "draft" ? 1 : 4.2),
      num_images: o.count,
      output_format: o.png ? "png" : "jpeg",
      ...(o.imageUrls?.length ? { image_urls: o.imageUrls } : {}),
    }),
  },
  "seedream-4.5": {
    id: "seedream-4.5",
    label: "Seedream 4.5",
    note: "Cheapest. Good for drafts and trying lots of ideas.",
    generate: "fal-ai/bytedance/seedream/v4.5/text-to-image",
    edit: "fal-ai/bytedance/seedream/v4.5/edit",
    ratios: baseRatios,
    cents: { draft: 4, standard: 4, max: 4 },
    maxRefs: 10,
    perRequest: 4,
    // Needs at least 2560x1440 worth of pixels, so there's no 1K. No output_format on this one.
    input: (o) => ({
      prompt: o.prompt,
      image_size: sizeFor(o.aspectRatio, o.quality === "max" ? 16 : 4.2),
      num_images: o.count,
      ...(o.imageUrls?.length ? { image_urls: o.imageUrls } : {}),
    }),
  },
  "flux-2-pro": {
    id: "flux-2-pro",
    label: "FLUX.2 Pro",
    note: "Most realistic photos: people, places, natural light. Weak at text, so pick No text.",
    generate: "fal-ai/flux-2-pro",
    edit: "fal-ai/flux-2-pro/edit",
    ratios: baseRatios,
    // Billed per megapixel: 3c for the first, 1.5c for each one after, and inputs count too.
    cents: { draft: 3, standard: 5, max: 8 },
    refCents: 6,
    maxRefs: 9,
    perRequest: 1,
    input: (o) => ({
      prompt: o.prompt,
      image_size: sizeFor(o.aspectRatio, o.quality === "draft" ? 1 : o.quality === "standard" ? 2 : 4),
      output_format: o.png ? "png" : "jpeg",
      ...(o.imageUrls?.length ? { image_urls: o.imageUrls } : {}),
    }),
  },
};

export type VideoModelId = "veo-3.1-fast" | "kling-2.6-pro" | "seedance-2" | "seedance-2-fast";

export type VideoModel = {
  id: VideoModelId;
  label: string;
  note: string;
  textToVideo: string;
  imageToVideo: string;
  ratios: Ratio[];
  durations: number[];
  centsPerSecond: { audio: number; silent: number };
  input: (o: { prompt: string; ratio: Ratio; seconds: number; audio: boolean; imageUrl?: string }) => Record<string, unknown>;
};

function seedanceInput({ prompt, ratio, seconds, audio, imageUrl }: { prompt: string; ratio: Ratio; seconds: number; audio: boolean; imageUrl?: string }) {
  return {
    prompt,
    duration: String(seconds),
    generate_audio: audio,
    resolution: "720p",
    // From a start image, follow the image's shape.
    aspect_ratio: imageUrl ? "auto" : ratio,
    ...(imageUrl ? { image_url: imageUrl } : {}),
  };
}

export const videoModels: Record<VideoModelId, VideoModel> = {
  "veo-3.1-fast": {
    id: "veo-3.1-fast",
    label: "Veo 3.1 Fast",
    note: "Best motion and sound. 16:9 or 9:16.",
    textToVideo: "fal-ai/veo3.1/fast",
    imageToVideo: "fal-ai/veo3.1/fast/image-to-video",
    ratios: ["16:9", "9:16"],
    durations: [4, 6, 8],
    centsPerSecond: { audio: 15, silent: 10 },
    input: ({ prompt, ratio, seconds, audio, imageUrl }) => ({
      prompt,
      aspect_ratio: ratio,
      duration: `${seconds}s`,
      generate_audio: audio,
      resolution: "1080p",
      ...(imageUrl ? { image_url: imageUrl } : {}),
    }),
  },
  "kling-2.6-pro": {
    id: "kling-2.6-pro",
    label: "Kling 2.6 Pro",
    note: "Cheapest good option, and does square. 5 or 10 seconds.",
    textToVideo: "fal-ai/kling-video/v2.6/pro/text-to-video",
    imageToVideo: "fal-ai/kling-video/v2.6/pro/image-to-video",
    ratios: ["16:9", "9:16", "1:1"],
    durations: [5, 10],
    centsPerSecond: { audio: 14, silent: 7 },
    input: ({ prompt, ratio, seconds, audio, imageUrl }) => ({
      prompt,
      duration: String(seconds),
      generate_audio: audio,
      // From a start image, Kling takes the shape of the image; aspect_ratio only applies to text-to-video.
      ...(imageUrl ? { image_url: imageUrl } : { aspect_ratio: ratio }),
    }),
  },
  "seedance-2": {
    id: "seedance-2",
    label: "Seedance 2",
    note: "Top-rated motion with sound. 720p. The priciest: about $3 for 10 seconds.",
    textToVideo: "bytedance/seedance-2.0/text-to-video",
    imageToVideo: "bytedance/seedance-2.0/image-to-video",
    ratios: ["16:9", "9:16", "1:1"],
    durations: [5, 8, 10],
    // Same price with or without sound. 1080p would be 2.25x.
    centsPerSecond: { audio: 30.34, silent: 30.34 },
    input: seedanceInput,
  },
  "seedance-2-fast": {
    id: "seedance-2-fast",
    label: "Seedance 2 Fast",
    note: "Seedance quality for about 20% less. 720p.",
    textToVideo: "bytedance/seedance-2.0/fast/text-to-video",
    imageToVideo: "bytedance/seedance-2.0/fast/image-to-video",
    ratios: ["16:9", "9:16", "1:1"],
    durations: [5, 8, 10],
    centsPerSecond: { audio: 24.19, silent: 24.19 },
    input: seedanceInput,
  },
};

export function imageInput(m: ImageModel, o: ImageRequest) {
  return m.input({ ...o, count: Math.min(Math.max(o.count, 1), m.perRequest), imageUrls: o.imageUrls?.slice(0, m.maxRefs) });
}

export const imageCost = (m: ImageModel, q: Quality, count: number, refs = 0) =>
  Math.round((m.cents[q] + Math.min(refs, m.maxRefs) * (m.refCents ?? 0)) * Math.min(Math.max(count, 1), 4));
export const videoCost = (m: VideoModel, seconds: number, audio: boolean) => Math.round(m.centsPerSecond[audio ? "audio" : "silent"] * seconds);
export const dollars = (cents: number) => `$${(cents / 100).toFixed(cents < 100 ? 2 : 2)}`;
