import { anglesFor, formats, type FormatId } from "./studio-logic";
import { imageCost, imageModels, videoCost, videoModels, type ImageModelId, type Quality, type VideoModelId } from "./studio-models";

/** Same math the server uses to plan requests, so the price on the Send button matches the job. */
export function estimateCents(p: {
  format: FormatId;
  quality: Quality;
  count: number;
  imageModel?: ImageModelId;
  editing?: boolean;
  /** Reference images riding along (some models bill for them). */
  refs?: number;
  video?: { model: VideoModelId; seconds: number; audio: boolean };
}): number {
  const f = formats[p.format];
  if (f.kind === "video") {
    const m = p.video && videoModels[p.video.model];
    return m ? videoCost(m, p.video!.seconds, p.video!.audio) : 0;
  }
  if (f.kind === "carousel") return imageCost(imageModels["nano-banana-2"], "max", 1);
  const m = imageModels[p.imageModel ?? f.model] ?? imageModels[f.model];
  if (p.format === "ad" && !p.editing) return anglesFor(p.count).length * imageCost(m, p.quality, 1, p.refs);
  return imageCost(m, p.quality, p.count, p.refs);
}
