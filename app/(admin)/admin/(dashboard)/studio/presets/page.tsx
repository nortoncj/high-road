import type { Metadata } from "next";
import Link from "next/link";
import { TbArrowLeft, TbPlus } from "react-icons/tb";
import { studioPage } from "@/content/admin";
import { requireAdmin } from "@/lib/admin/auth";
import { listPresets } from "@/lib/admin/studio";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { PageHeader } from "@/components/admin/PageHeader";

export const metadata: Metadata = { title: studioPage.presetsPage.title };

export default async function PresetsPage() {
  await requireAdmin();
  const presets = await listPresets();
  const t = studioPage.presetsPage;
  return (
    <>
      <Link href="/admin/studio" className="text-muted-foreground hover:text-foreground -mb-2 inline-flex w-fit items-center gap-1 text-sm">
        <TbArrowLeft aria-hidden="true" className="size-4" />
        {studioPage.thread.back}
      </Link>
      <PageHeader
        title={t.title}
        description={t.description}
        actions={
          <Button asChild>
            <Link href="/admin/studio/presets/new">
              <TbPlus aria-hidden="true" />
              {t.add}
            </Link>
          </Button>
        }
      />
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {presets.map((p) => (
          <li key={p.id}>
            <Link href={`/admin/studio/presets/${p.id}`} className="group focus-visible:ring-ring block h-full rounded-xl focus-visible:ring-2 focus-visible:outline-none">
              <Card className="group-hover:border-primary h-full gap-3 transition-colors">
                <CardHeader className="flex flex-row items-center gap-3">
                  {p.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.logoUrl} alt="" className="bg-secondary size-10 rounded-lg border object-contain" />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <CardTitle className="font-display truncate text-lg">{p.name}</CardTitle>
                    <p className="text-muted-foreground truncate text-xs">{p.clientName ?? (p.isBuiltin ? t.builtin : "Custom")}</p>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex h-8 overflow-hidden rounded-lg border">
                    {p.palette.map((c) => (
                      <span key={c.hex + c.name} className="flex-1" style={{ background: c.hex }} title={`${c.name} ${c.hex}`} />
                    ))}
                  </div>
                  <p className="text-muted-foreground line-clamp-3 text-sm">{p.style ?? "No look described yet."}</p>
                  <p className="text-xs">{[p.displayFont, p.bodyFont].filter(Boolean).join(" + ") || "No fonts set"}</p>
                </CardContent>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
