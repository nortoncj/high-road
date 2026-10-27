"use client";

import { useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { TbChevronDown, TbLoader2, TbPaperclip, TbPencil, TbSend, TbX } from "react-icons/tb";
import { studioPage } from "@/content/admin";
import { estimateCents } from "@/lib/admin/studio-estimate";
import { formatOrder, formats, lines, textModeLabel, zoneLabel, type FormatId, type TextMode, type Zone } from "@/lib/admin/studio-logic";
import { dollars, imageModels, qualityLabel, videoModels, type ImageModelId, type Quality, type Ratio, type VideoModelId } from "@/lib/admin/studio-models";
import type { AssetView, ComposerPayload } from "@/lib/admin/studio-types";
import { cn } from "@/lib/admin/utils";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Textarea } from "@/components/admin/ui/textarea";
import { Media } from "./AssetTile";
import { uploadAsset } from "./upload";

export type ComposerState = {
  format: FormatId;
  ratio: Ratio;
  textMode: TextMode;
  zone: Zone;
  quality: Quality;
  count: number;
  imageModel: ImageModelId;
  fields: Record<string, string>;
  brief: string;
  attachments: AssetView[];
  base: AssetView | null;
  useBrandRefs: boolean;
  slideCount: number;
  video: { model: VideoModelId; seconds: number; audio: boolean };
};

export function defaultsFor(format: FormatId, prev?: ComposerState): ComposerState {
  const f = formats[format];
  return {
    format,
    ratio: f.defaultRatio,
    textMode: f.defaultTextMode,
    zone: f.defaultZone,
    quality: prev?.quality ?? "standard",
    count: format === "ad" ? 3 : 1,
    imageModel: f.model,
    fields: {},
    brief: prev?.brief ?? "",
    attachments: prev?.attachments ?? [],
    base: prev?.base ?? null,
    useBrandRefs: prev?.useBrandRefs ?? true,
    slideCount: 4,
    video: prev?.video ?? { model: "veo-3.1-fast", seconds: 6, audio: true },
  };
}

function Chips<T extends string>({ value, options, onChange, label, small }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string; small?: boolean }) {
  return (
    <div role="radiogroup" aria-label={label} className="bg-secondary inline-flex max-w-full flex-wrap gap-0.5 rounded-lg p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-md font-medium whitespace-nowrap transition-colors",
            small ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
            value === o.value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Mini({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="text-muted-foreground flex items-center gap-1.5 text-xs">
      <span className="whitespace-nowrap">{label}</span>
      {children}
    </label>
  );
}

const selectCls = "bg-card border-input h-7 rounded-md border px-1.5 text-xs text-foreground";

export function Composer({
  threadId,
  state,
  setState,
  onSend,
  hasPreset,
}: {
  threadId: string;
  state: ComposerState;
  setState: (s: ComposerState | ((p: ComposerState) => ComposerState)) => void;
  onSend: (p: ComposerPayload) => Promise<boolean>;
  hasPreset: boolean;
}) {
  const t = studioPage.composer;
  const f = formats[state.format];
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState<number | null>(null);
  const [open, setOpen] = useState(f.fields.length > 0);
  const fileRef = useRef<HTMLInputElement>(null);
  const set = <K extends keyof ComposerState>(k: K, v: ComposerState[K]) => setState((p) => ({ ...p, [k]: v }));
  const setField = (k: string, v: string) => setState((p) => ({ ...p, fields: { ...p.fields, [k]: v } }));

  const vm = videoModels[state.video.model];
  const ratioOptions = (f.kind === "video" ? vm.ratios : f.ratios).map((r) => ({ value: r, label: r }));
  const cents = estimateCents({ format: state.format, quality: state.quality, count: state.count, imageModel: state.imageModel, editing: Boolean(state.base), refs: state.attachments.filter((a) => a.kind === "image").length + (state.base ? 1 : 0), video: state.video });
  const slideLines = lines(state.fields.slides).length;

  async function attach(files: FileList | null) {
    if (!files?.length) return;
    for (const file of [...files].slice(0, 6)) {
      setUploading(0);
      const res = await uploadAsset(file, { threadId, onProgress: setUploading });
      if (res.ok) setState((p) => ({ ...p, attachments: [...p.attachments, res.asset] }));
      else toast.error(`${file.name}: ${res.error}`);
    }
    setUploading(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function send() {
    if (sending) return;
    setSending(true);
    const payload: ComposerPayload = {
      format: state.format,
      ratio: f.kind === "video" && !(vm.ratios as string[]).includes(state.ratio) ? vm.ratios[0] : state.ratio,
      textMode: state.textMode,
      zone: state.zone,
      quality: state.quality,
      count: state.count,
      imageModel: state.imageModel,
      fields: state.fields,
      brief: state.brief,
      attachmentIds: state.attachments.map((a) => a.id),
      baseAssetId: state.base?.id ?? null,
      useBrandRefs: hasPreset && state.useBrandRefs,
      slideCount: state.slideCount,
      video: f.kind === "video" ? state.video : undefined,
    };
    const ok = await onSend(payload);
    setSending(false);
    // Keep the format and options for the next tweak; clear what you typed and attached.
    if (ok) setState((p) => ({ ...p, brief: "", attachments: [] }));
  }

  return (
    <div className="bg-card/95 flex flex-col gap-2.5 rounded-2xl border p-3 shadow-lg backdrop-blur-xl sm:p-4">
      {/* Format */}
      <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none]" role="radiogroup" aria-label="Format">
        {formatOrder.map((id) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={state.format === id}
            title={formats[id].blurb}
            onClick={() => {
              setState((p) => defaultsFor(id, p));
              setOpen(formats[id].fields.length > 0);
            }}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors",
              state.format === id ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent",
            )}
          >
            {formats[id].label}
          </button>
        ))}
      </div>

      {/* Options for this format */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {ratioOptions.length > 1 && !(f.kind === "video" && state.base && state.video.model === "kling-2.6-pro") ? (
          <Chips label="Shape" value={state.ratio} options={ratioOptions} onChange={(v) => set("ratio", v)} />
        ) : null}
        {f.textModes.length > 1 ? (
          <Chips label="Text" value={state.textMode} options={f.textModes.map((m) => ({ value: m, label: textModeLabel[m] }))} onChange={(v) => set("textMode", v)} />
        ) : null}
        {state.textMode === "exact" ? (
          <Mini label={t.zone}>
            <select className={selectCls} value={state.zone} onChange={(e) => set("zone", e.target.value as Zone)}>
              {(Object.keys(zoneLabel) as Zone[]).map((z) => (
                <option key={z} value={z}>
                  {zoneLabel[z]}
                </option>
              ))}
            </select>
          </Mini>
        ) : null}
        {f.kind === "image" ? (
          <>
            <Mini label={t.quality}>
              <select className={selectCls} value={state.quality} onChange={(e) => set("quality", e.target.value as Quality)}>
                {(Object.keys(qualityLabel) as Quality[]).map((q) => (
                  <option key={q} value={q}>
                    {qualityLabel[q]}
                  </option>
                ))}
              </select>
            </Mini>
            <Mini label={state.format === "ad" ? t.variants : t.count}>
              <select className={selectCls} value={state.count} onChange={(e) => set("count", Number(e.target.value))}>
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </Mini>
            <Mini label={t.model}>
              <select className={selectCls} value={state.imageModel} onChange={(e) => set("imageModel", e.target.value as ImageModelId)} title={imageModels[state.imageModel].note}>
                {Object.values(imageModels).map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </Mini>
          </>
        ) : null}
        {f.kind === "carousel" && !slideLines ? (
          <Mini label={t.slides}>
            <select className={selectCls} value={state.slideCount} onChange={(e) => set("slideCount", Number(e.target.value))}>
              {[2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </Mini>
        ) : null}
        {f.kind === "video" ? (
          <>
            <Mini label={t.model}>
              <select
                className={selectCls}
                value={state.video.model}
                onChange={(e) => {
                  const m = videoModels[e.target.value as VideoModelId];
                  setState((p) => ({ ...p, video: { ...p.video, model: m.id, seconds: m.durations.includes(p.video.seconds) ? p.video.seconds : m.durations[m.durations.length > 1 ? 1 : 0] }, ratio: (m.ratios as string[]).includes(p.ratio) ? p.ratio : m.ratios[0] }));
                }}
              >
                {Object.values(videoModels).map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </Mini>
            <Mini label={t.seconds}>
              <select className={selectCls} value={state.video.seconds} onChange={(e) => set("video", { ...state.video, seconds: Number(e.target.value) })}>
                {vm.durations.map((d) => (
                  <option key={d} value={d}>
                    {d}s
                  </option>
                ))}
              </select>
            </Mini>
            <label className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <input type="checkbox" className="accent-primary" checked={state.video.audio} onChange={(e) => set("video", { ...state.video, audio: e.target.checked })} />
              {t.audio}
            </label>
          </>
        ) : null}
        {f.fields.length ? (
          <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="text-primary ml-auto inline-flex items-center gap-1 text-xs font-medium">
            {t.details}
            <TbChevronDown aria-hidden="true" className={cn("size-3.5 transition-transform", open && "rotate-180")} />
          </button>
        ) : null}
      </div>

      {/* Format fields: the exact words */}
      {open && f.fields.length ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {f.fields.map((fl) => {
            const id = `cf-${fl.key}`;
            const common = { id, value: state.fields[fl.key] ?? "", placeholder: fl.placeholder };
            return (
              <div key={fl.key} className={cn("flex flex-col gap-1", (fl.kind === "lines" || fl.kind === "textarea") && "sm:col-span-2")}>
                <label htmlFor={id} className="text-muted-foreground text-xs font-medium">
                  {fl.label}
                </label>
                {fl.kind === "select" ? (
                  <select id={id} className={cn(selectCls, "h-9 text-sm")} value={state.fields[fl.key] ?? fl.options?.[0]?.value} onChange={(e) => setField(fl.key, e.target.value)}>
                    {fl.options?.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : fl.kind === "text" ? (
                  <Input {...common} onChange={(e) => setField(fl.key, e.target.value)} className="h-9 text-base sm:text-sm" />
                ) : (
                  <Textarea {...common} rows={fl.kind === "lines" ? 4 : 2} onChange={(e) => setField(fl.key, e.target.value)} className="min-h-0 text-base sm:text-sm" />
                )}
              </div>
            );
          })}
        </div>
      ) : null}

      {/* What rides along */}
      {state.base || state.attachments.length || uploading !== null ? (
        <div className="flex flex-wrap items-center gap-2">
          {state.base ? (
            <span className="bg-sea-foam text-primary inline-flex items-center gap-1.5 rounded-lg py-1 pr-1 pl-1 text-xs font-medium">
              <span className="size-7 overflow-hidden rounded">
                <Media a={state.base} className="size-full object-cover" />
              </span>
              <TbPencil aria-hidden="true" className="size-3.5" />
              {f.kind === "video" ? "Animating" : t.editing}
              <button type="button" onClick={() => set("base", null)} className="hover:bg-primary/10 grid size-5 place-items-center rounded" aria-label="Stop editing this image">
                <TbX aria-hidden="true" className="size-3.5" />
              </button>
            </span>
          ) : null}
          {state.attachments.map((a) => (
            <span key={a.id} className="bg-secondary inline-flex items-center gap-1 rounded-lg p-1 text-xs">
              <span className="size-7 overflow-hidden rounded">
                <Media a={a} className="size-full object-cover" />
              </span>
              <button type="button" onClick={() => set("attachments", state.attachments.filter((x) => x.id !== a.id))} className="hover:bg-accent grid size-5 place-items-center rounded" aria-label="Remove attachment">
                <TbX aria-hidden="true" className="size-3.5" />
              </button>
            </span>
          ))}
          {uploading !== null ? (
            <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
              <TbLoader2 aria-hidden="true" className="size-3.5 animate-spin" />
              Uploading {uploading}%
            </span>
          ) : null}
        </div>
      ) : null}

      {/* The ask */}
      <div className="flex items-end gap-2">
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/quicktime,video/webm" multiple hidden onChange={(e) => attach(e.target.files)} />
        <Button type="button" variant="ghost" size="icon" onClick={() => fileRef.current?.click()} aria-label={t.attach} title={t.attach} className="shrink-0">
          <TbPaperclip aria-hidden="true" className="size-5" />
        </Button>
        <Textarea
          value={state.brief}
          onChange={(e) => set("brief", e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              send();
            }
          }}
          rows={2}
          placeholder={f.kind === "video" ? t.videoPlaceholder : state.base ? t.editPlaceholder : t.placeholder}
          aria-label="What you want"
          className="max-h-48 min-h-11 flex-1 resize-none text-base sm:text-sm"
        />
        <Button type="button" onClick={send} disabled={sending || uploading !== null} className="h-11 shrink-0 flex-col gap-0 px-4 leading-tight">
          <span className="inline-flex items-center gap-1.5">
            {sending ? <TbLoader2 aria-hidden="true" className="animate-spin" /> : <TbSend aria-hidden="true" />}
            <span className="hidden sm:inline">{sending ? t.sending : t.send}</span>
          </span>
          <span className="text-[10px] font-normal opacity-80">{dollars(cents)}</span>
        </Button>
      </div>
      <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-[11px]">
        {hasPreset ? (
          <label className="inline-flex items-center gap-1.5">
            <input type="checkbox" className="accent-primary" checked={state.useBrandRefs} onChange={(e) => set("useBrandRefs", e.target.checked)} />
            {t.brandRefs}
          </label>
        ) : (
          <span />
        )}
        <span className="hidden sm:inline">
          {f.kind === "carousel" ? `${slideLines || state.slideCount} slides · ` : ""}
          {t.hint}
        </span>
      </div>
    </div>
  );
}
