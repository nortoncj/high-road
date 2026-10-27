"use client";

import { useEffect, useRef, useState } from "react";
import { TbCamera, TbChevronLeft, TbChevronRight, TbDownload, TbFileZip, TbLoader2, TbX } from "react-icons/tb";
import { toast } from "sonner";
import { studioPage } from "@/content/admin";
import type { AssetView } from "@/lib/admin/studio-types";
import { Button } from "@/components/admin/ui/button";
import { bytesLabel, downloadHref, Media } from "./AssetTile";
import { uploadAsset } from "./upload";

/**
 * Full screen preview. Arrow keys step through the chat's results, Esc closes.
 * Carousels show as a swipeable row, the way they'll feel on Instagram.
 */
export function Lightbox({
  items,
  index,
  onIndex,
  onClose,
  slidesOf,
  threadId,
  onFrameSaved,
}: {
  items: AssetView[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
  /** All slides of a carousel group, in order. */
  slidesOf: (groupId: string) => AssetView[];
  threadId?: string | null;
  onFrameSaved?: (a: AssetView) => void;
}) {
  const a = items[index];
  const closeRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [grabbing, setGrabbing] = useState(false);
  const t = studioPage.actions;

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && index < items.length - 1) onIndex(index + 1);
      if (e.key === "ArrowLeft" && index > 0) onIndex(index - 1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [index, items.length, onClose, onIndex]);

  if (!a) return null;
  const slides = a.groupId ? slidesOf(a.groupId) : [];

  async function grabFrame() {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    setGrabbing(true);
    try {
      // A hidden copy in CORS mode, seeked to the same moment. The visible player never needs CORS,
      // so playback works even before the bucket rule is set.
      const at = v.currentTime;
      const copy = document.createElement("video");
      copy.crossOrigin = "anonymous";
      copy.muted = true;
      copy.preload = "auto";
      await new Promise<void>((resolve, reject) => {
        copy.onloadeddata = () => {
          copy.onseeked = () => resolve();
          copy.currentTime = at;
        };
        copy.onerror = () => reject(new Error("cors"));
        copy.src = a.url;
      });
      const c = document.createElement("canvas");
      c.width = copy.videoWidth;
      c.height = copy.videoHeight;
      c.getContext("2d")!.drawImage(copy, 0, 0);
      const blob = await new Promise<Blob | null>((r) => c.toBlob(r, "image/png"));
      if (!blob) throw new Error();
      const res = await uploadAsset(blob, { threadId: threadId ?? null, origin: "frame", parentId: a.id, label: `Frame at ${at.toFixed(1)}s` });
      if (!res.ok) toast.error(res.error);
      else {
        toast.success("Frame saved. It's in the chat, ready to attach.");
        onFrameSaved?.(res.asset);
      }
    } catch {
      toast.error("Couldn't read that frame. The bucket needs the CORS rule (ADMIN_SETUP.md).");
    } finally {
      setGrabbing(false);
    }
  }

  return (
    <div role="dialog" aria-modal="true" aria-label={a.label ?? "Preview"} className="fixed inset-0 z-50 flex flex-col bg-black/90 text-white">
      <div className="flex items-center gap-2 p-3 sm:p-4">
        <p className="min-w-0 flex-1 truncate text-sm">
          {a.label ?? (a.kind === "video" ? "Video" : "Image")}
          <span className="ml-2 text-white/60">
            {[a.width && a.height ? `${a.width}x${a.height}` : null, a.durationS ? `${a.durationS}s` : null, bytesLabel(a.bytes)].filter(Boolean).join(" · ")}
          </span>
        </p>
        {a.kind === "video" ? (
          <Button size="sm" variant="secondary" onClick={grabFrame} disabled={grabbing}>
            {grabbing ? <TbLoader2 aria-hidden="true" className="animate-spin" /> : <TbCamera aria-hidden="true" />}
            <span className="hidden sm:inline">{t.frame}</span>
          </Button>
        ) : null}
        {slides.length ? (
          <Button asChild size="sm" variant="secondary">
            <a href={`/admin/studio/api/groups/${a.groupId}/zip`}>
              <TbFileZip aria-hidden="true" />
              <span className="hidden sm:inline">{t.zip}</span>
            </a>
          </Button>
        ) : null}
        {a.kind === "image" && a.ratio ? (
          <Button asChild size="sm" variant="secondary">
            <a href={downloadHref(a, true)} title="Resized for where it's going">
              <TbDownload aria-hidden="true" />
              <span className="hidden sm:inline">{t.downloadSized}</span>
            </a>
          </Button>
        ) : null}
        <Button asChild size="sm">
          <a href={downloadHref(a)}>
            <TbDownload aria-hidden="true" />
            <span className="hidden sm:inline">{t.download}</span>
          </a>
        </Button>
        <button ref={closeRef} type="button" onClick={onClose} className="grid size-9 place-items-center rounded-md hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none" aria-label="Close">
          <TbX aria-hidden="true" className="size-5" />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-3 pb-3 sm:px-16 sm:pb-6">
        {slides.length ? (
          <div className="flex max-h-full w-full snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]" aria-label="Carousel slides">
            {slides.map((s) => (
              <div key={s.id} className="flex w-[min(85vw,560px)] shrink-0 snap-center flex-col items-center gap-1.5">
                <Media a={s} className="max-h-[70vh] w-full rounded-lg object-contain" />
                <span className="text-xs text-white/70">{s.label}</span>
              </div>
            ))}
          </div>
        ) : a.kind === "video" ? (
          <video ref={videoRef} src={a.url} controls autoPlay playsInline className="max-h-full max-w-full rounded-lg" />
        ) : (
          <Media a={a} className="max-h-full max-w-full rounded-lg object-contain" />
        )}
        {index > 0 ? (
          <button type="button" onClick={() => onIndex(index - 1)} className="absolute top-1/2 left-2 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-white/10 hover:bg-white/20 sm:grid" aria-label="Previous">
            <TbChevronLeft aria-hidden="true" className="size-6" />
          </button>
        ) : null}
        {index < items.length - 1 ? (
          <button type="button" onClick={() => onIndex(index + 1)} className="absolute top-1/2 right-2 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-white/10 hover:bg-white/20 sm:grid" aria-label="Next">
            <TbChevronRight aria-hidden="true" className="size-6" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
