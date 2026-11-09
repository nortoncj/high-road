import type { Metadata } from "next";
import { TbPlugConnectedX } from "react-icons/tb";
import { contentPage } from "@/content/admin";
import { requireAdmin } from "@/lib/admin/auth";
import { sanityConfigured } from "@/lib/sanity/env";
import { ContentStudio } from "@/components/admin/ContentStudio";
import { PageHeader } from "@/components/admin/PageHeader";

/**
 * The Sanity Studio (sanity.config.ts). The catch-all takes the Studio's own URLs,
 * like /admin/content/structure/post;<id>, so reloads and shared links land on the right document.
 * The site's origin must be in sanity.io/manage → API → CORS origins, with credentials allowed.
 */

export const metadata: Metadata = { title: contentPage.meta.title, referrer: "same-origin" };

export default async function ContentPage() {
  await requireAdmin();

  if (!sanityConfigured) {
    const s = contentPage.setup;
    return (
      <>
        <PageHeader title={contentPage.meta.title} />
        <div className="flex max-w-2xl items-start gap-3 rounded-lg border border-dashed p-4 text-sm">
          <TbPlugConnectedX aria-hidden="true" className="text-muted-foreground mt-0.5 size-5 shrink-0" />
          <div className="min-w-0">
            <p className="font-medium">{s.title}</p>
            <p className="text-muted-foreground mt-0.5 text-xs">{s.body}</p>
          </div>
        </div>
      </>
    );
  }

  return <ContentStudio />;
}
