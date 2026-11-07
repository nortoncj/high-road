import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { caseStudyPage as copy } from "@/content/case-study";
import { site } from "@/content/home";
import { PostRow } from "@/components/blog";
import { toPostCardView } from "@/components/blog/views";
import { CaseStudyArticle, CopyLink, JumpNav, caseStudyCrumbs, caseStudySections } from "@/components/case-study";
import { breadcrumbJsonLd } from "@/components/ui/Breadcrumbs";
import { CtaBand } from "@/components/ui/CtaBand";
import { getCaseStudy, getCaseStudySlugs, topUp } from "@/lib/sanity/data";
import { toImg } from "@/lib/sanity/image";
import { readMinutes } from "@/lib/sanity/portable-text";
import { SITE_URL, buildMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getCaseStudySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCaseStudy(slug);
  if (!c) return {};
  const og = toImg(c.image, { width: 1200, aspect: 1200 / 630 });
  return buildMetadata({
    title: c.seo?.metaTitle || `${c.name} case study`,
    description: c.seo?.metaDescription || c.summary?.result || c.excerpt || undefined,
    image: og?.src,
    path: `/work/${c.slug}`,
    type: "article",
  });
}

export default function CaseStudyPage({ params }: Props) {
  // params is read inside the boundary, so case studies published after the build get an instant shell.
  return (
    <Suspense fallback={<div style={{ minHeight: "80vh" }} aria-busy="true" />}>
      <CaseStudy params={params} />
    </Suspense>
  );
}

async function CaseStudy({ params }: Props) {
  const { slug } = await params;
  const c = await getCaseStudy(slug);
  if (!c) notFound();

  const path = `/work/${c.slug}`;
  const has = caseStudySections(c);
  const jump = (["summary", "problem", "plan", "results"] as const).filter((k) => has[k]).map((k) => ({ id: k, label: copy.jump[k] }));
  const minutes = readMinutes(c.summary, c.beforeAfter, c.steps, c.results, c.outcomes, c.takeaways, c.problem, c.solution);
  const guides = topUp(c.pickedPosts, c.latestPosts).map((p) => toPostCardView(p));
  const image = toImg(c.image, { width: 1200, aspect: 1200 / 630 });

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: c.headline || c.title,
      description: c.seo?.metaDescription || c.excerpt || undefined,
      datePublished: c.publishedAt ?? undefined,
      dateModified: c.updatedAt,
      ...(image ? { image: image.src } : {}),
      mainEntityOfPage: new URL(path, SITE_URL).toString(),
      about: { "@type": "Organization", name: c.name },
      author: { "@type": "Person", name: "Chris Norton", url: new URL("/about", SITE_URL).toString() },
      publisher: { "@type": "Organization", name: site.name, url: SITE_URL },
    },
    breadcrumbJsonLd(caseStudyCrumbs(c), SITE_URL, path),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        // Built from our own CMS content; "<" is escaped so nothing can close the tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <JumpNav links={jump} readLabel={copy.minRead(minutes)} />
      <CaseStudyArticle study={c} />
      <PostRow
        id="case-guides"
        eyebrow={copy.related.eyebrow}
        heading={copy.related.heading}
        link={{ label: copy.related.all, href: "/blog" }}
        posts={guides}
        variant="brief"
      />
      <CtaBand id="case-cta" {...copy.cta} aside={<CopyLink />} />
    </>
  );
}
