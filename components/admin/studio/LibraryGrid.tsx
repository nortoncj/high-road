"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TbCheck, TbLoader2, TbTrash } from "react-icons/tb";
import { studioPage } from "@/content/admin";
import { deleteAssets } from "@/lib/admin/studio-actions";
import type { AssetView } from "@/lib/admin/studio-types";
import { cn } from "@/lib/admin/utils";
import { Button } from "@/components/admin/ui/button";
import { aspect, bytesLabel, Media } from "./AssetTile";
import { Lightbox } from "./Lightbox";

type Item = AssetView & { threadTitle: string | null };

/** Tap to preview. Tick the corner to pick several, then delete them in one go. */
export function LibraryGrid({ items }: { items: Item[] }) {
  const router = useRouter();
  const t = studioPage.libraryPage;
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [view, setView] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const toggle = (id: string) =>
    setPicked((p) => {
      const n = new Set(p);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  async function remove() {
    if (!picked.size || !window.confirm(t.confirm(picked.size))) return;
    setBusy(true);
    const r = await deleteAssets([...picked]);
    setBusy(false);
    if (!r.ok) toast.error(r.error);
    else toast.success(`Deleted ${r.data?.deleted ?? picked.size}.`);
    setPicked(new Set());
    router.refresh();
  }

  if (!items.length) return <p className="text-muted-foreground py-10 text-center text-sm">{t.empty}</p>;

  return (
    <>
      <div className={cn("sticky top-16 z-10 flex items-center justify-between gap-3 rounded-xl border px-3 py-2 transition-opacity", picked.size ? "bg-card opacity-100 shadow-sm" : "pointer-events-none opacity-0")}>
        <span className="text-sm">{picked.size} selected</span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setPicked(new Set())}>
            Clear
          </Button>
          <Button size="sm" onClick={remove} disabled={busy} className="bg-negative hover:bg-negative/90 text-white">
            {busy ? <TbLoader2 aria-hidden="true" className="animate-spin" /> : <TbTrash aria-hidden="true" />}
            {t.deleteSelected(picked.size)}
          </Button>
        </div>
      </div>
      <ul className="columns-2 gap-3 sm:columns-3 lg:columns-4 xl:columns-5 [&>li]:mb-3">
        {items.map((a, i) => {
          const on = picked.has(a.id);
          return (
            <li key={a.id} className="break-inside-avoid">
              <figure className={cn("bg-secondary relative overflow-hidden rounded-xl border", on && "ring-primary ring-2 ring-offset-2")} style={{ aspectRatio: aspect(a) }}>
                <button type="button" onClick={() => setView(i)} className="focus-visible:ring-ring absolute inset-0 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset" aria-label={`Preview ${a.label ?? a.kind}`}>
                  <Media a={a} className="size-full object-cover" />
                </button>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={on}
                  aria-label="Select"
                  onClick={() => toggle(a.id)}
                  className={cn("absolute top-2 left-2 grid size-6 place-items-center rounded-md border-2 shadow-sm transition-colors", on ? "bg-primary border-primary text-white" : "bg-card/80 border-white")}
                >
                  {on ? <TbCheck aria-hidden="true" className="size-4" /> : null}
                </button>
              </figure>
              <figcaption className="mt-1 flex items-center justify-between gap-2 px-0.5 text-xs">
                <span className="truncate">{a.label ?? a.threadTitle ?? a.origin}</span>
                <span className="text-muted-foreground shrink-0 tabular-nums">{bytesLabel(a.bytes)}</span>
              </figcaption>
            </li>
          );
        })}
      </ul>
      {view !== null ? <Lightbox items={items} index={view} onIndex={setView} onClose={() => setView(null)} slidesOf={() => []} /> : null}
    </>
  );
}
