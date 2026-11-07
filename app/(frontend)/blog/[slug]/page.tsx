import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { blogMeta, post as labels } from "@/content/blog";
import { site } from "@/content/home";
import { CaseStudyRow, PostArticle, PostRow, postCrumbs } from "@/components/blog";
import { toCaseStudyCardView, toPostCardView } from "@/components/blog/views";
import { breadcrumbJsonLd } from "@/components/ui/Breadcrumbs";
import { getPost, getPostSlugs, topUp } from "@/lib/sanity/data";
import { toImg } from "@/lib/sanity/image";
import { SITE_URL, buildMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPost(slug);
  if (!p) return {};
  const og = toImg(p.image, { width: 1200, aspect: 1200 / 630 });
  return buildMetadata({
    title: p.seo?.title || p.title,
    description: p.seo?.description || p.excerpt || undefined,
    keywords: p.seo?.keywords ?? undefined,
    image: og?.src,
    path: `${blogMeta.path}/${p.slug}`,
    type: "article",
  });
}

export default function PostPage({ params }: Props) {
  // params is read inside the boundary, so posts published after the build get an instant shell.
  return (
    <Suspense fallback={<div style={{ minHeight: "80vh" }} aria-busy="true" />}>
      <Post params={params} />
    </Suspense>
  );
}

async function Post({ params }: Props) {
  const { slug } = await params;
  const p = await getPost(slug);
  if (!p) notFound();

  const path = `${blogMeta.path}/${p.slug}`;
  const caseStudies = topUp(p.pickedCaseStudies, p.latestCaseStudies).map(toCaseStudyCardView);
  const more = topUp(p.sameCategory, p.latest).map((r) => toPostCardView(r, { width: 300, aspect: 1 }));
  const image = toImg(p.image, { width: 1200, aspect: 1200 / 630 });

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: p.title,
      description: p.seo?.description || p.excerpt || undefined,
      datePublished: p.publishedAt ?? undefined,
      dateModified: p.updatedAt,
      ...(image ? { image: image.src } : {}),
      mainEntityOfPage: new URL(path, SITE_URL).toString(),
      author: { "@type": "Person", name: "Chris Norton", url: new URL("/about", SITE_URL).toString() },
      publisher: { "@type": "Organization", name: site.name, url: SITE_URL },
    },
    breadcrumbJsonLd(postCrumbs(p), SITE_URL, path),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        // Built from our own CMS content; "<" is escaped so nothing can close the tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <PostArticle post={p} />
      <CaseStudyRow
        id="post-case-studies"
        eyebrow={labels.caseStudiesEyebrow}
        heading={labels.caseStudiesHeading}
        cards={caseStudies}
        linkLabel={labels.readCaseStudy}
      />
      <PostRow
        id="post-more"
        eyebrow={labels.keepReadingEyebrow}
        heading={p.sameCategory.length && p.category ? labels.moreOn(p.category.title) : labels.moreFallback}
        link={{ label: labels.allPosts, href: blogMeta.path }}
        posts={more}
      />
    </>
  );
}
