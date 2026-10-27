import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TbArrowLeft } from "react-icons/tb";
import { studioPage } from "@/content/admin";
import { requireAdmin } from "@/lib/admin/auth";
import type { SearchParams } from "@/lib/admin/range";
import { getThreadState, listPresets } from "@/lib/admin/studio";
import { advanceJobs } from "@/lib/admin/studio-jobs";
import type { FormatId } from "@/lib/admin/studio-logic";
import { StudioThread } from "@/components/admin/studio/StudioThread";

export const metadata: Metadata = { title: studioPage.meta.title };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<SearchParams> };

export default async function StudioThreadPage({ params, searchParams }: Props) {
  await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  // Anything that finished while you were away gets saved now.
  await advanceJobs(id).catch(() => undefined);
  const [state, presets] = await Promise.all([getThreadState(id), listPresets()]);
  if (!state) notFound();
  const format = Array.isArray(sp.format) ? sp.format[0] : sp.format;

  return (
    <>
      <Link href="/admin/studio" className="text-muted-foreground hover:text-foreground -mb-2 inline-flex w-fit items-center gap-1 text-sm">
        <TbArrowLeft aria-hidden="true" className="size-4" />
        {studioPage.thread.back}
      </Link>
      <StudioThread initial={state} presets={presets} initialFormat={format as FormatId | undefined} />
    </>
  );
}
