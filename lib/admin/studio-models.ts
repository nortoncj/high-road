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

export type ImageModelId = "nano-banana-pro" | "nano-banana-2";

export type ImageModel = {
  id: ImageModelId;
  label: string;
  note: string;
  generate: string;
  edit: string;
  /** Every aspect_ratio value the endpoint accepts. Carousels pick from these. */
  ratios: string[];
  resolution: Record<Quality, string>;
  cents: Record<Quality, number>;
  maxRefs: number;
};

export const imageModels: Record<ImageModelId, ImageModel> = {
  "nano-banana-pro": {
    id: "nano-banana-pro",
    label: "Nano Banana Pro",
    note: "Best text and layout. Use for quotes, infographics, ads, thumbnails.",
    generate: "fal-ai/nano-banana-pro",
    edit: "fal-ai/nano-banana-pro/edit",
    ratios: ["21:9", "16:9", "3:2", "4:3", "5:4", "1:1", "4:5", "3:4", "2:3", "9:16"],
    resolution: { draft: "1K", standard: "2K", max: "4K" },
    cents: { draft: 15, standard: 15, max: 30 },
    maxRefs: 14,
  },
  "nano-banana-2": {
    id: "nano-banana-2",
    label: "Nano Banana 2",
    note: "Half the price, fast, and the only one that makes extra-wide images (carousels).",
    generate: "fal-ai/nano-banana-2",
    edit: "fal-ai/nano-banana-2/edit",
    ratios: ["21:9", "16:9", "3:2", "4:3", "5:4", "1:1", "4:5", "3:4", "2:3", "9:16", "4:1", "1:4", "8:1", "1:8"],
    resolution: { draft: "1K", standard: "2K", max: "4K" },
    cents: { draft: 8, standard: 12, max: 16 },
    maxRefs: 14,
  },
};

export type VideoModelId = "veo-3.1-fast" | "kling-2.6-pro";

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
};

export function imageInput(m: ImageModel, o: { prompt: string; aspectRatio: string; quality: Quality; count: number; png: boolean; imageUrls?: string[] }) {
  return {
    prompt: o.prompt,
    aspect_ratio: o.aspectRatio,
    resolution: m.resolution[o.quality],
    num_images: Math.min(Math.max(o.count, 1), 4),
    output_format: o.png ? "png" : "jpeg",
    ...(o.imageUrls?.length ? { image_urls: o.imageUrls.slice(0, m.maxRefs) } : {}),
  };
}

export const imageCost = (m: ImageModel, q: Quality, count: number) => m.cents[q] * Math.min(Math.max(count, 1), 4);
export const videoCost = (m: VideoModel, seconds: number, audio: boolean) => Math.round(m.centsPerSecond[audio ? "audio" : "silent"] * seconds);
export const dollars = (cents: number) => `$${(cents / 100).toFixed(cents < 100 ? 2 : 2)}`;
