import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { industryPage as copy } from "@/content/industries";
import { site } from "@/content/home";
import {
  IndustryFaqs,
  IndustryHero,
  IndustryProblems,
  IndustryProof,
  IndustrySolutions,
  IndustryStats,
  OtherIndustries,
  industryCrumbs,
  industrySections,
} from "@/components/industries";
import { breadcrumbJsonLd } from "@/components/ui/Breadcrumbs";
import { CtaBand } from "@/components/ui/CtaBand";
import { getIndustry, getIndustrySlugs } from "@/lib/sanity/data";
import { toImg } from "@/lib/sanity/image";
import { SITE_URL, buildMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getIndustrySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const it = await getIndustry(slug);
  if (!it) return {};
  const og = toImg(it.image, { width: 1200, aspect: 1200 / 630 });
  return buildMetadata({
    title: it.seo?.title || copy.title(it.name),
    description: it.seo?.description || it.intro || it.line || undefined,
    image: og?.src,
    path: `/industries/${it.slug}`,
  });
}

export default function IndustryPage({ params }: Props) {
  // params is read inside the boundary, so industries added after the build get an instant shell.
  return (
    <Suspense fallback={<div style={{ minHeight: "80vh" }} aria-busy="true" />}>
      <Industry params={params} />
    </Suspense>
  );
}

async function Industry({ params }: Props) {
  const { slug } = await params;
  const it = await getIndustry(slug);
  if (!it) notFound();

  const path = `/industries/${it.slug}`;
  const has = industrySections(it);
  const url = new URL(path, SITE_URL).toString();

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      serviceType: "Website design",
      name: it.seo?.title || copy.title(it.name),
      description: it.seo?.description || it.intro || it.line || undefined,
      url,
      audience: { "@type": "BusinessAudience", audienceType: it.name },
      provider: { "@type": "ProfessionalService", name: site.name, email: site.email, url: SITE_URL },
    },
    breadcrumbJsonLd(industryCrumbs(it), SITE_URL, path),
    ...(it.faqs?.length
      ? [
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: it.faqs.map((f) => ({
              "@type": "Question",
              name: f.question,
              acceptedAnswer: { "@type": "Answer", text: f.answer },
            })),
          },
        ]
      : []),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        // Built from our own CMS content; "<" is escaped so nothing can close the tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <IndustryHero industry={it} />
      {has.problems ? <IndustryProblems industry={it} /> : null}
      {has.stats && it.stats ? <IndustryStats stats={it.stats} /> : null}
      {has.solutions ? <IndustrySolutions industry={it} /> : null}
      <IndustryProof industry={it} />
      {has.faqs && it.faqs ? <IndustryFaqs faqs={it.faqs} /> : null}
      <CtaBand
        id="industry-cta"
        eyebrow={copy.cta.eyebrow}
        heading={it.cta?.heading || copy.cta.heading}
        body={it.cta?.body || copy.cta.body}
        primaryCta={copy.primaryCta}
        secondaryCta={{
          label: it.cta?.secondaryLabel || copy.cta.secondaryCta.label,
          href: it.cta?.secondaryHref?.trim() || copy.cta.secondaryCta.href,
        }}
      />
      <OtherIndustries industry={it} />
    </>
  );
}
