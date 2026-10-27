"use client";

import { useEffect, useRef, useState } from "react";
import { TbLoader2, TbX } from "react-icons/tb";
import { toast } from "sonner";
import { studioPage } from "@/content/admin";
import type { AssetView, PresetView } from "@/lib/admin/studio-types";
import { drawTextLayer, ensureFont, type LayerZone, type Scrim, type TextLayerOptions } from "@/lib/admin/text-layer";
import { cn } from "@/lib/admin/utils";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { Textarea } from "@/components/admin/ui/textarea";
import { uploadAsset } from "./upload";

function Seg<T extends string>({ value, options, onChange, label }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="bg-secondary flex flex-wrap gap-1 rounded-lg p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn("rounded-md px-2.5 py-1 text-xs font-medium transition-colors", value === o.value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Exact text over an image, drawn in your brand fonts. Saves as a NEW image, the original stays.
 * Prefilled from the words you typed in the composer.
 */
export function TextLayerEditor({
  asset,
  preset,
  initial,
  threadId,
  onClose,
  onSaved,
}: {
  asset: AssetView;
  preset: PresetView | null;
  initial: { headline?: string; sub?: string; cta?: string; zone?: LayerZone };
  threadId: string;
  onClose: () => void;
  onSaved: (a: AssetView) => void;
}) {
  const t = studioPage.textLayer;
  const pal = preset?.palette ?? [];
  const dark = pal.find((c) => /ink|charcoal|night|navy|black/i.test(c.name))?.hex ?? "#14171C";
  const accent = pal.find((c) => /teal|cyan|accent|brand|primary/i.test(c.name))?.hex ?? pal[0]?.hex ?? "#1F5C63";
  const [o, setO] = useState<TextLayerOptions>({
    headline: initial.headline ?? "",
    sub: initial.sub ?? "",
    cta: initial.cta ?? "",
    zone: initial.zone ?? "bottom",
    align: "left",
    scale: 1,
    color: "#FFFFFF",
    accent,
    scrim: "fade",
    scrimColor: dark,
    scrimOpacity: 0.75,
    displayFont: preset?.displayFont || "Bricolage Grotesque",
    bodyFont: preset?.bodyFont || "Instrument Sans",
  });
  const set = <K extends keyof TextLayerOptions>(k: K, v: TextLayerOptions[K]) => setO((p) => ({ ...p, [k]: v }));
  const canvas = useRef<HTMLCanvasElement>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [broken, setBroken] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fontsReady, setFontsReady] = useState(0);

  useEffect(() => {
    const i = new Image();
    i.crossOrigin = "anonymous"; // so the canvas can be saved (bucket CORS rule)
    i.onload = () => setImg(i);
    i.onerror = () => setBroken(true);
    i.src = asset.url;
  }, [asset.url]);

  useEffect(() => {
    Promise.all([ensureFont(o.displayFont), ensureFont(o.bodyFont)]).then(() => setFontsReady((n) => n + 1));
  }, [o.displayFont, o.bodyFont]);

  useEffect(() => {
    const c = canvas.current;
    if (!c || !img) return;
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    drawTextLayer(c.getContext("2d")!, img, c.width, c.height, o);
  }, [img, o, fontsReady]);

  async function save() {
    const c = canvas.current;
    if (!c) return;
    setSaving(true);
    try {
      const blob = await new Promise<Blob | null>((r) => c.toBlob(r, "image/png"));
      if (!blob) throw new Error("blank");
      const res = await uploadAsset(blob, { threadId, origin: "text-layer", parentId: asset.id, label: "With text" });
      if (!res.ok) toast.error(res.error);
      else {
        toast.success("Saved as a new image.");
        onSaved(res.asset);
        onClose();
      }
    } catch {
      toast.error(t.corsHint);
    } finally {
      setSaving(false);
    }
  }

  const swatches = [...new Set(["#FFFFFF", "#14171C", ...pal.map((p) => p.hex)])];

  return (
    <div role="dialog" aria-modal="true" aria-label={t.title} className="bg-background fixed inset-0 z-50 flex flex-col lg:flex-row">
      <div className="bg-secondary/60 relative flex min-h-0 flex-1 items-center justify-center p-3 sm:p-6">
        {broken ? <p className="text-muted-foreground max-w-sm text-center text-sm">{t.corsHint}</p> : null}
        <canvas ref={canvas} className="max-h-[48vh] max-w-full rounded-lg shadow-lg lg:max-h-full" aria-label="Preview with text" />
        {!img && !broken ? <TbLoader2 aria-hidden="true" className="text-muted-foreground absolute size-6 animate-spin" /> : null}
      </div>

      <div className="flex max-h-[52vh] w-full flex-col border-t lg:max-h-none lg:w-[380px] lg:border-t-0 lg:border-l">
        <div className="flex items-center justify-between gap-2 border-b p-4">
          <h2 className="font-display text-lg font-semibold">{t.title}</h2>
          <button type="button" onClick={onClose} className="hover:bg-accent grid size-8 place-items-center rounded-md" aria-label="Close">
            <TbX aria-hidden="true" className="size-5" />
          </button>
        </div>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tl-head">{t.headline}</Label>
            <Textarea id="tl-head" rows={2} value={o.headline} onChange={(e) => set("headline", e.target.value)} className="text-base sm:text-sm" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tl-sub">{t.sub}</Label>
            <Input id="tl-sub" value={o.sub} onChange={(e) => set("sub", e.target.value)} className="h-10 text-base sm:text-sm" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tl-cta">{t.cta}</Label>
            <Input id="tl-cta" value={o.cta} onChange={(e) => set("cta", e.target.value)} placeholder="Book a free call" className="h-10 text-base sm:text-sm" />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">{t.zone}</span>
            <Seg label={t.zone} value={o.zone} onChange={(v) => set("zone", v)} options={[{ value: "top", label: "Top" }, { value: "bottom", label: "Bottom" }, { value: "left", label: "Left" }, { value: "center", label: "Center" }]} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">{t.align}</span>
              <Seg label={t.align} value={o.align} onChange={(v) => set("align", v)} options={[{ value: "left", label: "Left" }, { value: "center", label: "Center" }]} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tl-size">{t.size}</Label>
              <input id="tl-size" type="range" min={0.6} max={1.6} step={0.05} value={o.scale} onChange={(e) => set("scale", Number(e.target.value))} className="accent-primary h-8" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">{t.color}</span>
            <div className="flex flex-wrap gap-2">
              {swatches.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => set("color", hex)}
                  aria-label={hex}
                  aria-pressed={o.color === hex}
                  className={cn("size-8 rounded-full border shadow-sm", o.color === hex && "ring-primary ring-2 ring-offset-2")}
                  style={{ background: hex }}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">{t.scrim}</span>
            <Seg<Scrim> label={t.scrim} value={o.scrim} onChange={(v) => set("scrim", v)} options={(["none", "fade", "band"] as const).map((v) => ({ value: v, label: t.scrimOptions[v] }))} />
            {o.scrim !== "none" ? (
              <div className="mt-1 flex items-center gap-2">
                {swatches.map((hex) => (
                  <button key={hex} type="button" onClick={() => set("scrimColor", hex)} aria-label={`Backdrop ${hex}`} aria-pressed={o.scrimColor === hex} className={cn("size-6 rounded-full border", o.scrimColor === hex && "ring-primary ring-2 ring-offset-1")} style={{ background: hex }} />
                ))}
                <input type="range" min={0.2} max={1} step={0.05} value={o.scrimOpacity} onChange={(e) => set("scrimOpacity", Number(e.target.value))} aria-label="Backdrop strength" className="accent-primary ml-auto w-24" />
              </div>
            ) : null}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tl-font">{t.font}</Label>
            <Input id="tl-font" value={o.displayFont} onChange={(e) => set("displayFont", e.target.value)} className="h-10 text-base sm:text-sm" />
            <p className="text-muted-foreground text-xs">Any Google Font name works.</p>
          </div>
        </div>
        <div className="border-t p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button onClick={save} disabled={saving || !img} className="w-full">
            {saving ? <TbLoader2 aria-hidden="true" className="animate-spin" /> : null}
            {saving ? t.saving : t.save}
          </Button>
        </div>
      </div>
    </div>
  );
}
