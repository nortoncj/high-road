import type { Metadata } from "next";
import Link from "next/link";
import { TbArrowLeft } from "react-icons/tb";
import { studioPage } from "@/content/admin";
import { requireAdmin } from "@/lib/admin/auth";
import type { SearchParams } from "@/lib/admin/range";
import { listLibrary } from "@/lib/admin/studio";
import { formatOrder, formats } from "@/lib/admin/studio-logic";
import { cn } from "@/lib/admin/utils";
import { Button } from "@/components/admin/ui/button";
import { PageHeader } from "@/components/admin/PageHeader";
import { bytesLabel } from "@/components/admin/studio/AssetTile";
import { LibraryGrid } from "@/components/admin/studio/LibraryGrid";

export const metadata: Metadata = { title: studioPage.libraryPage.title };

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** R2: first 10 GB free, then $0.015 per GB-month. Shown so "cheap" stays visible. */
function costLine(bytes: number) {
  const t = studioPage.libraryPage;
  const gb = bytes / 1e9;
  return gb <= 10 ? t.free : t.perMonth(`$${((gb - 10) * 0.015).toFixed(2)}`);
}

export default async function LibraryPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin();
  const p = await searchParams;
  const kind = one(p.kind) === "video" ? "video" : one(p.kind) === "image" ? "image" : undefined;
  const origin = one(p.origin) === "upload" ? "upload" : undefined;
  const format = formatOrder.includes(one(p.format) as never) ? one(p.format) : undefined;
  const page = Math.max(1, Number(one(p.page)) || 1);
  const lib = await listLibrary({ kind, origin, format, page });
  const t = studioPage.libraryPage;

  const href = (patch: Record<string, string | undefined>) => {
    const q = new URLSearchParams();
    const merged = { kind, origin, format, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) q.set(k, v);
    const s = q.toString();
    return `/admin/studio/library${s ? `?${s}` : ""}`;
  };
  const chip = (label: string, active: boolean, to: string) => (
    <Link key={label} href={to} className={cn("rounded-full border px-3 py-1 text-xs font-medium whitespace-nowrap", active ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground hover:bg-accent")}>
      {label}
    </Link>
  );

  return (
    <>
      <Link href="/admin/studio" className="text-muted-foreground hover:text-foreground -mb-2 inline-flex w-fit items-center gap-1 text-sm">
        <TbArrowLeft aria-hidden="true" className="size-4" />
        {studioPage.thread.back}
      </Link>
      <PageHeader title={t.title} description={t.description} />
      <p className="bg-secondary text-secondary-foreground w-fit rounded-lg px-3 py-2 text-sm">{t.usage(bytesLabel(lib.totalBytes), costLine(lib.totalBytes))}</p>
      <nav aria-label="Filter" className="-mx-4 flex gap-1.5 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
        {chip(t.all, !kind && !origin && !format, "/admin/studio/library")}
        {chip("Images", kind === "image", href({ kind: kind === "image" ? undefined : "image" }))}
        {chip("Videos", kind === "video", href({ kind: kind === "video" ? undefined : "video" }))}
        {chip("Uploads", origin === "upload", href({ origin: origin ? undefined : "upload" }))}
        {formatOrder
          .filter((f) => f !== "free")
          .map((f) => chip(formats[f].label, format === f, href({ format: format === f ? undefined : f })))}
      </nav>
      <LibraryGrid items={lib.items} />
      {lib.pages > 1 ? (
        <div className="flex items-center justify-center gap-2">
          {page > 1 ? (
            <Button asChild variant="outline" size="sm">
              <Link href={href({ page: String(page - 1) })}>Newer</Link>
            </Button>
          ) : null}
          <span className="text-muted-foreground text-sm">
            Page {page} of {lib.pages}
          </span>
          {page < lib.pages ? (
            <Button asChild variant="outline" size="sm">
              <Link href={href({ page: String(page + 1) })}>Older</Link>
            </Button>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
