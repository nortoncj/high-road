"use client";

import { useActionState, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { TbLoader2, TbPhotoPlus, TbPlus, TbTrash, TbX } from "react-icons/tb";
import type { FormState } from "@/lib/admin/client-actions";
import { deletePreset } from "@/lib/admin/studio-actions";
import type { PresetView } from "@/lib/admin/studio-types";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { Textarea } from "@/components/admin/ui/textarea";
import { useResultToast } from "@/components/admin/clients/ActionButtons";
import { putFile } from "./upload";

type Pic = { key: string; url: string };

type Props = {
  preset: PresetView | null;
  clients: { id: string; name: string }[];
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
};

/**
 * Next keeps this page alive after you leave it. After a save, the next visit should start from a
 * fresh form (a blank one for "New preset"), so a saved form is swapped for a new one as the page
 * hides. Leaving without saving, or a save that failed, keeps what you typed.
 */
export function PresetForm(props: Props) {
  const [gen, setGen] = useState(0);
  const saved = useRef(false);
  useLayoutEffect(
    () => () => {
      if (!saved.current) return;
      saved.current = false;
      setGen((g) => g + 1);
    },
    [],
  );
  // Stable, so the body's error effect only reruns when the action state changes.
  const onSubmitted = useCallback((ok: boolean) => {
    saved.current = ok;
  }, []);
  return <PresetFormBody key={gen} {...props} onSubmitted={onSubmitted} />;
}

function PresetFormBody({ preset, clients, action, onSubmitted }: Props & { onSubmitted: (ok: boolean) => void }) {
  const [state, run, pending] = useActionState<FormState, FormData>(action, {});
  useResultToast(state);
  // A successful save redirects, so the only state that comes back is an error.
  useEffect(() => {
    if (state.error) onSubmitted(false);
  }, [state, onSubmitted]);
  const [palette, setPalette] = useState(preset?.palette.length ? preset.palette : [{ name: "Primary", hex: "#1F5C63" }]);
  const [logo, setLogo] = useState<Pic | null>(preset?.logoKey ? { key: preset.logoKey, url: preset.logoUrl ?? "" } : null);
  const [refs, setRefs] = useState<Pic[]>(preset ? preset.referenceKeys.map((k, i) => ({ key: k, url: preset.referenceUrls[i] ?? "" })) : []);
  const [uploading, setUploading] = useState(false);
  const logoInput = useRef<HTMLInputElement>(null);
  const refInput = useRef<HTMLInputElement>(null);
  const v = (k: string, fallback?: string | null) => state.values?.[k] ?? fallback ?? "";

  async function upload(files: FileList | null, into: "logo" | "refs") {
    if (!files?.length) return;
    setUploading(true);
    for (const f of [...files].slice(0, into === "logo" ? 1 : 8 - refs.length)) {
      if (!f.type.startsWith("image/")) {
        toast.error(`${f.name} isn't an image.`);
        continue;
      }
      const r = await putFile(f);
      if (!r.ok) toast.error(r.error);
      else if (into === "logo") setLogo({ key: r.key, url: URL.createObjectURL(f) });
      else setRefs((p) => [...p, { key: r.key, url: URL.createObjectURL(f) }].slice(0, 8));
    }
    setUploading(false);
  }

  return (
    <form action={run} onSubmit={() => onSubmitted(true)} className="flex max-w-3xl flex-col gap-6">
      {preset ? <input type="hidden" name="id" value={preset.id} /> : null}
      <input type="hidden" name="palette" value={JSON.stringify(palette)} />
      <input type="hidden" name="logo_key" value={logo?.key ?? ""} />
      <input type="hidden" name="reference_keys" value={refs.map((r) => r.key).join(",")} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pf-name">Name</Label>
          <Input id="pf-name" name="name" required defaultValue={v("name", preset?.name)} aria-invalid={Boolean(state.fields?.name)} className="h-10 text-base sm:text-sm" />
          {state.fields?.name ? <p className="text-negative text-xs">{state.fields.name}</p> : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pf-client">Client (optional)</Label>
          <select id="pf-client" name="client_id" defaultValue={v("client_id", preset?.clientId)} className="bg-card border-input h-10 rounded-md border px-2 text-sm">
            <option value="">Not a client brand</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium">Colors</legend>
        {palette.map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            <input type="color" value={c.hex} onChange={(e) => setPalette((p) => p.map((x, k) => (k === i ? { ...x, hex: e.target.value.toUpperCase() } : x)))} aria-label={`Color ${i + 1}`} className="h-10 w-12 shrink-0 cursor-pointer rounded-md border" />
            <Input value={c.hex} onChange={(e) => setPalette((p) => p.map((x, k) => (k === i ? { ...x, hex: e.target.value } : x)))} aria-label={`Hex ${i + 1}`} className="h-10 w-28 font-mono text-sm" />
            <Input value={c.name} onChange={(e) => setPalette((p) => p.map((x, k) => (k === i ? { ...x, name: e.target.value } : x)))} placeholder="Name it: Ocean teal" aria-label={`Color name ${i + 1}`} className="h-10 flex-1 text-base sm:text-sm" />
            <Button type="button" variant="ghost" size="icon" onClick={() => setPalette((p) => p.filter((_, k) => k !== i))} aria-label="Remove color">
              <TbTrash aria-hidden="true" />
            </Button>
          </div>
        ))}
        {palette.length < 12 ? (
          <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => setPalette((p) => [...p, { name: "", hex: "#888888" }])}>
            <TbPlus aria-hidden="true" />
            Add color
          </Button>
        ) : null}
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pf-display">Headline font</Label>
          <Input id="pf-display" name="display_font" defaultValue={v("display_font", preset?.displayFont)} placeholder="Bricolage Grotesque" className="h-10 text-base sm:text-sm" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pf-body">Body font</Label>
          <Input id="pf-body" name="body_font" defaultValue={v("body_font", preset?.bodyFont)} placeholder="Instrument Sans" className="h-10 text-base sm:text-sm" />
        </div>
      </div>
      <p className="text-muted-foreground -mt-4 text-xs">Google Font names. Exact text uses them as-is; AI text gets them as a style hint.</p>

      {/* The field is "look", not "style": a control named "style" replaces form.style, so React
          can't hide this form when Next keeps the page around after you leave it. */}
      {[
        { k: "look", field: "style", label: "Look and feel", ph: "Bright, friendly, real photos of the crew on job sites. Clean white space, rounded shapes..." },
        { k: "voice", field: "voice", label: "Voice for headlines", ph: "Plain, warm, no jargon. Talks to homeowners." },
        { k: "avoid", field: "avoid", label: "Never show", ph: "No stock handshakes, no competitors' trucks, no fake reviews." },
      ].map((f) => (
        <div key={f.k} className="flex flex-col gap-1.5">
          <Label htmlFor={`pf-${f.k}`}>{f.label}</Label>
          <Textarea id={`pf-${f.k}`} name={f.k} rows={3} defaultValue={v(f.k, preset?.[f.field as "style" | "voice" | "avoid"])} placeholder={f.ph} className="text-base sm:text-sm" />
        </div>
      ))}

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Logo</span>
        <div className="flex items-center gap-3">
          <span className="bg-secondary grid size-20 place-items-center overflow-hidden rounded-xl border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {logo?.url ? <img src={logo.url} alt="Logo" className="max-h-full max-w-full object-contain" /> : <TbPhotoPlus aria-hidden="true" className="text-muted-foreground size-6" />}
          </span>
          <input ref={logoInput} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => upload(e.target.files, "logo")} />
          <Button type="button" variant="outline" size="sm" onClick={() => logoInput.current?.click()} disabled={uploading}>
            {logo ? "Replace" : "Upload logo"}
          </Button>
          {logo ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => setLogo(null)}>
              Remove
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Reference images ({refs.length}/8)</span>
        <p className="text-muted-foreground -mt-1 text-xs">Their best photos, past posts they love, their truck, their team. Sent along when "Use brand logo and references" is on.</p>
        <div className="flex flex-wrap gap-2">
          {refs.map((r) => (
            <span key={r.key} className="bg-secondary relative size-20 overflow-hidden rounded-xl border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={r.url} alt="" className="size-full object-cover" />
              <button type="button" onClick={() => setRefs((p) => p.filter((x) => x.key !== r.key))} className="bg-card/90 absolute top-1 right-1 grid size-6 place-items-center rounded-md" aria-label="Remove reference">
                <TbX aria-hidden="true" className="size-3.5" />
              </button>
            </span>
          ))}
          {refs.length < 8 ? (
            <>
              <input ref={refInput} type="file" accept="image/png,image/jpeg,image/webp" multiple hidden onChange={(e) => upload(e.target.files, "refs")} />
              <button type="button" onClick={() => refInput.current?.click()} disabled={uploading} className="text-muted-foreground hover:bg-accent grid size-20 place-items-center rounded-xl border border-dashed">
                {uploading ? <TbLoader2 aria-hidden="true" className="size-5 animate-spin" /> : <TbPlus aria-hidden="true" className="size-5" />}
                <span className="sr-only">Add references</span>
              </button>
            </>
          ) : null}
        </div>
      </div>

      {state.error && !state.fields ? <p className="text-negative text-sm">{state.error}</p> : null}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4">
        <Button type="submit" disabled={pending || uploading}>
          {pending ? <TbLoader2 aria-hidden="true" className="animate-spin" /> : null}
          Save preset
        </Button>
        {preset && !preset.isBuiltin ? (
          <Button
            type="button"
            variant="ghost"
            className="text-negative hover:bg-negative-soft"
            onClick={async () => {
              if (!window.confirm(`Delete ${preset.name}? Its logo and references are deleted from storage too.`)) return;
              const r = await deletePreset(preset.id);
              if (!r.ok) toast.error(r.error);
              else window.location.href = "/admin/studio/presets";
            }}
          >
            <TbTrash aria-hidden="true" />
            Delete preset
          </Button>
        ) : null}
      </div>
    </form>
  );
}
