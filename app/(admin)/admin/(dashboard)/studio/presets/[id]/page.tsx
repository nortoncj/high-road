import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TbArrowLeft } from "react-icons/tb";
import { studioPage } from "@/content/admin";
import { requireAdmin } from "@/lib/admin/auth";
import { clientOptions } from "@/lib/admin/projects";
import { getPreset } from "@/lib/admin/studio";
import { savePreset } from "@/lib/admin/studio-actions";
import type { PresetView } from "@/lib/admin/studio-types";
import { PageHeader } from "@/components/admin/PageHeader";
import { PresetForm } from "@/components/admin/studio/PresetForm";

export const metadata: Metadata = { title: studioPage.presetsPage.title };

/** The saved fields only. The image URLs are signed per request, so they'd change the key every visit. */
const presetKey = (p: PresetView | null) =>
  p ? JSON.stringify([p.id, p.name, p.clientId, p.palette, p.displayFont, p.bodyFont, p.style, p.voice, p.avoid, p.logoKey, p.referenceKeys]) : "new";

export default async function PresetEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [preset, clients] = await Promise.all([id === "new" ? null : getPreset(id), clientOptions()]);
  if (id !== "new" && !preset) notFound();
  return (
    <>
      <Link href="/admin/studio/presets" className="text-muted-foreground hover:text-foreground -mb-2 inline-flex w-fit items-center gap-1 text-sm">
        <TbArrowLeft aria-hidden="true" className="size-4" />
        {studioPage.presetsPage.title}
      </Link>
      <PageHeader title={preset ? preset.name : studioPage.presetsPage.add} description={studioPage.presetsPage.description} />
      {/* Next keeps this page alive after you leave it, and the form only reads `preset` when it
          mounts. Keying on the saved data remounts it when the preset changed since then. */}
      <PresetForm key={presetKey(preset)} preset={preset} clients={clients} action={savePreset} />
    </>
  );
}
