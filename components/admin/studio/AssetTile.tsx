"use client";

import type { ReactNode } from "react";
import { TbDownload, TbMovie, TbPencil, TbPlayerPlayFilled, TbTrash, TbTypography } from "react-icons/tb";
import { studioPage } from "@/content/admin";
import type { AssetView } from "@/lib/admin/studio-types";
import { cn } from "@/lib/admin/utils";

export const downloadHref = (a: AssetView, sized = false) => `/admin/studio/api/assets/${a.id}/download${sized ? "?size=export" : ""}`;

/** CSS aspect-ratio from "4:5", or from the file's own size. */
export function aspect(a: Pick<AssetView, "ratio" | "width" | "height">): string {
  if (a.width && a.height) return `${a.width} / ${a.height}`;
  if (a.ratio) return a.ratio.replace(":", " / ");
  return "1 / 1";
}

export function bytesLabel(b: number): string {
  if (b >= 1e9) return `${(b / 1e9).toFixed(2)} GB`;
  if (b >= 1e6) return `${(b / 1e6).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(b / 1e3))} KB`;
}

/**
 * The picture itself. Videos show their first frame with a play badge.
 * `cors` only where pixels get read (text editor, frame grab): plain previews must keep working
 * even if the bucket's CORS rule is missing.
 */
export function Media({ a, className, controls = false, cors = false }: { a: AssetView; className?: string; controls?: boolean; cors?: boolean }) {
  if (!a.url) return <div className={cn("bg-secondary grid place-items-center text-xs", className)}>No preview</div>;
  if (a.kind === "video") {
    return (
      <video src={a.url} className={className} controls={controls} playsInline muted={!controls} preload="metadata" crossOrigin={cors ? "anonymous" : undefined} />
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={a.url} alt={a.label ?? a.prompt?.slice(0, 120) ?? "Studio image"} className={className} loading="lazy" decoding="async" crossOrigin={cors ? "anonymous" : undefined} />;
}

function ToolButton({ label, onClick, href, children, danger }: { label: string; onClick?: () => void; href?: string; children: ReactNode; danger?: boolean }) {
  const cls = cn(
    "bg-card/90 text-foreground hover:bg-card grid size-8 place-items-center rounded-md shadow-sm backdrop-blur transition-colors focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
    danger && "hover:text-negative",
  );
  return href ? (
    <a href={href} className={cls} title={label} aria-label={label}>
      {children}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={cls} title={label} aria-label={label}>
      {children}
    </button>
  );
}

/**
 * One result. Tap opens the preview. Tools sit on the image: always visible on phones,
 * on hover or focus on desktop.
 */
export function AssetTile({
  a,
  onOpen,
  onEdit,
  onText,
  onAnimate,
  onDelete,
  selected,
  className,
}: {
  a: AssetView;
  onOpen: () => void;
  onEdit?: () => void;
  onText?: () => void;
  onAnimate?: () => void;
  onDelete?: () => void;
  selected?: boolean;
  className?: string;
}) {
  const t = studioPage.actions;
  return (
    <figure className={cn("group/tile relative overflow-hidden rounded-xl border bg-secondary", selected && "ring-primary ring-2 ring-offset-2", className)} style={{ aspectRatio: aspect(a) }}>
      <button type="button" onClick={onOpen} className="focus-visible:ring-ring absolute inset-0 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset" aria-label={`${t.preview}: ${a.label ?? a.kind}`}>
        <Media a={a} className="size-full object-cover" />
        {a.kind === "video" ? (
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid size-11 place-items-center rounded-full bg-black/55 text-white">
              <TbPlayerPlayFilled aria-hidden="true" className="size-5" />
            </span>
          </span>
        ) : null}
      </button>
      {a.label ? (
        <figcaption className="pointer-events-none absolute bottom-2 left-2 max-w-[70%] truncate rounded bg-black/55 px-1.5 py-0.5 text-[11px] font-medium text-white">{a.label}</figcaption>
      ) : null}
      <div className="absolute top-2 right-2 flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover/tile:opacity-100 sm:group-focus-within/tile:opacity-100">
        {onEdit && a.kind === "image" ? (
          <ToolButton label={t.edit} onClick={onEdit}>
            <TbPencil aria-hidden="true" className="size-4" />
          </ToolButton>
        ) : null}
        {onText && a.kind === "image" ? (
          <ToolButton label={t.text} onClick={onText}>
            <TbTypography aria-hidden="true" className="size-4" />
          </ToolButton>
        ) : null}
        {onAnimate && a.kind === "image" ? (
          <ToolButton label={t.animate} onClick={onAnimate}>
            <TbMovie aria-hidden="true" className="size-4" />
          </ToolButton>
        ) : null}
        <ToolButton label={t.download} href={downloadHref(a)}>
          <TbDownload aria-hidden="true" className="size-4" />
        </ToolButton>
        {onDelete ? (
          <ToolButton label={t.delete} onClick={onDelete} danger>
            <TbTrash aria-hidden="true" className="size-4" />
          </ToolButton>
        ) : null}
      </div>
    </figure>
  );
}
