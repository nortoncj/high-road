import type { Metadata } from "next";
import Link from "next/link";
import { TbAlertTriangle, TbLibraryPhoto, TbLoader2, TbPalette, TbPhoto } from "react-icons/tb";
import { studioPage } from "@/content/admin";
import { requireAdmin } from "@/lib/admin/auth";
import { falReady } from "@/lib/admin/fal";
import { shortDate, toDate } from "@/lib/admin/format";
import { storageReady } from "@/lib/admin/storage";
import { capCents, listPresets, listThreads, monthSpendCents } from "@/lib/admin/studio";
import { startThread } from "@/lib/admin/studio-actions";
import { formatOrder, formats } from "@/lib/admin/studio-logic";
import { dollars } from "@/lib/admin/studio-models";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { PageHeader } from "@/components/admin/PageHeader";

export const metadata: Metadata = { title: studioPage.meta.title };

export default async function StudioPage() {
  await requireAdmin();
  const [presets, threads, spent] = await Promise.all([listPresets(), listThreads(24), monthSpendCents()]);
  const cap = capCents();
  const s = studioPage;
  const now = new Date();
  const missing = [!falReady() && s.setup.fal, !storageReady() && s.setup.storage].filter(Boolean) as string[];

  return (
    <>
      <PageHeader
        title={s.title}
        description={s.description}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/admin/studio/library">
                <TbLibraryPhoto aria-hidden="true" />
                {s.library}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/studio/presets">
                <TbPalette aria-hidden="true" />
                <span className="hidden sm:inline">{s.presets}</span>
              </Link>
            </Button>
          </>
        }
      />

      {missing.length ? (
        <div className="bg-warning-soft text-warning flex items-start gap-2 rounded-lg px-3 py-3 text-sm">
          <TbAlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">{s.setup.title}</p>
            <ul className="mt-1 list-disc pl-4">
              {missing.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      <Card className="gap-4">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <CardTitle className="font-display text-lg">{s.start.title}</CardTitle>
          <span className="bg-secondary text-secondary-foreground rounded-full px-2.5 py-1 text-xs font-medium tabular-nums">{s.spend(dollars(spent), cap ? dollars(cap) : null)}</span>
        </CardHeader>
        <CardContent>
          <form action={startThread} className="flex flex-col gap-4">
            <label className="flex max-w-xs flex-col gap-1.5 text-sm font-medium">
              {s.start.preset}
              <select name="preset" defaultValue={presets.find((p) => p.name === "WebTech Ninjas")?.id ?? ""} className="bg-card border-input h-10 rounded-md border px-2 text-sm font-normal">
                <option value="">{s.start.noPreset}</option>
                {presets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                    {p.clientName ? ` (${p.clientName})` : ""}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {formatOrder.map((id) => (
                <button
                  key={id}
                  type="submit"
                  name="format"
                  value={id}
                  className="hover:border-primary hover:bg-sea-foam/40 focus-visible:ring-ring flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  <span className="text-sm font-semibold">{formats[id].label}</span>
                  <span className="text-muted-foreground line-clamp-2 text-xs">{formats[id].blurb}</span>
                </button>
              ))}
            </div>
          </form>
        </CardContent>
      </Card>

      <section aria-labelledby="recent" className="flex flex-col gap-3">
        <h2 id="recent" className="font-display text-xl font-semibold tracking-tight">
          {s.recent.title}
        </h2>
        {threads.length === 0 ? (
          <p className="text-muted-foreground text-sm">{s.recent.empty}</p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {threads.map((t) => (
              <li key={t.id}>
                <Link href={`/admin/studio/${t.id}`} className="group focus-visible:ring-ring flex flex-col gap-2 rounded-xl focus-visible:ring-2 focus-visible:outline-none">
                  <span className="bg-secondary relative block aspect-square overflow-hidden rounded-xl border">
                    {t.thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.thumb} alt="" className="size-full object-cover transition-transform group-hover:scale-[1.03]" loading="lazy" />
                    ) : (
                      <span className="text-muted-foreground grid size-full place-items-center">
                        <TbPhoto aria-hidden="true" className="size-7 opacity-50" />
                      </span>
                    )}
                    {t.pending ? (
                      <span className="bg-card/90 absolute top-2 left-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium">
                        <TbLoader2 aria-hidden="true" className="size-3 animate-spin" />
                        {s.recent.pending(t.pending)}
                      </span>
                    ) : null}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium group-hover:underline">{t.title}</span>
                    <span className="text-muted-foreground block truncate text-xs">{[t.presetName, shortDate(toDate(t.updatedAt), now)].filter(Boolean).join(" · ")}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
