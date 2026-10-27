import type { FormatId, TextMode, Zone } from "./studio-logic";
import type { ImageModelId, Quality, Ratio, VideoModelId } from "./studio-models";

/* Shapes shared by the Studio server code and the browser. Plain data only. */

export type AssetView = {
  id: string;
  kind: "image" | "video";
  origin: "generated" | "upload" | "edited" | "text-layer" | "slide" | "frame";
  url: string;
  mime: string;
  bytes: number;
  width: number | null;
  height: number | null;
  durationS: number | null;
  ratio: string | null;
  format: string | null;
  label: string | null;
  groupId: string | null;
  slideIndex: number | null;
  parentId: string | null;
  prompt: string | null;
  createdAt: string;
};

export type JobView = {
  id: string;
  status: "queued" | "running" | "finalizing" | "done" | "failed" | "canceled";
  kind: "image" | "video";
  format: string | null;
  ratio: string | null;
  costCents: number;
  error: string | null;
  label: string | null;
  createdAt: string;
};

export type MessageView = {
  id: string;
  role: "user" | "assistant";
  body: string | null;
  assetIds: string[];
  jobId: string | null;
  meta: Record<string, unknown>;
  createdAt: string;
};

export type PresetView = {
  id: string;
  name: string;
  clientId: string | null;
  clientName: string | null;
  style: string | null;
  palette: { name: string; hex: string }[];
  displayFont: string | null;
  bodyFont: string | null;
  voice: string | null;
  avoid: string | null;
  logoKey: string | null;
  logoUrl: string | null;
  referenceKeys: string[];
  referenceUrls: string[];
  isBuiltin: boolean;
};

export type ThreadState = {
  thread: { id: string; title: string; presetId: string | null };
  messages: MessageView[];
  assets: Record<string, AssetView>;
  jobs: Record<string, JobView>;
  spend: { monthCents: number; capCents: number | null };
  ready: { fal: boolean; storage: boolean };
};

/** What the composer sends. Validated on the server; never trusted. */
export type ComposerPayload = {
  format: FormatId;
  ratio: Ratio;
  textMode: TextMode;
  zone: Zone;
  quality: Quality;
  count: number;
  imageModel?: ImageModelId;
  fields: Record<string, string>;
  brief: string;
  attachmentIds: string[];
  baseAssetId?: string | null;
  useBrandRefs: boolean;
  slideCount?: number;
  video?: { model: VideoModelId; seconds: number; audio: boolean };
};

export const pendingStatuses: JobView["status"][] = ["queued", "running", "finalizing"];
