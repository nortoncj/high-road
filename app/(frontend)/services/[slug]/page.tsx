import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  OtherServices,
  ServiceCta,
  ServiceFaqs,
  ServiceFeatures,
  ServiceHero,
  ServicePains,
  ServicePricing,
  ServiceTools,
  WorkStrip,
  serviceCrumbs,
} from "@/components/services";
import { breadcrumbJsonLd } from "@/components/ui/Breadcrumbs";
import { site } from "@/content/home";
import { getService, serviceHref, servicePage as copy, services } from "@/content/services";
import { SITE_URL, buildMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

// Every service lives in content/services, so every page is built ahead of time. Anything else 404s.
export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = getService(slug);
  if (!s) return {};
  return buildMetadata({
    title: s.meta.title,
    description: s.meta.description,
    image: s.image.src.src,
    path: serviceHref(s.slug),
  });
}

export default function ServicePage({ params }: Props) {
  // params is read inside the boundary, so every service shares one App Shell for instant navigations.
  return (
    <Suspense fallback={<div style={{ minHeight: "80vh" }} aria-busy="true" />}>
      <Service params={params} />
    </Suspense>
  );
}

async function Service({ params }: Props) {
  const { slug } = await params;
  const s = getService(slug);
  if (!s) notFound();

  const path = serviceHref(s.slug);
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      serviceType: s.label,
      name: s.meta.title,
      description: s.meta.description,
      url: new URL(path, SITE_URL).toString(),
      image: new URL(s.image.src.src, SITE_URL).toString(),
      provider: { "@type": "ProfessionalService", name: site.name, email: site.email, url: SITE_URL },
      areaServed: { "@type": "Country", name: "United States" },
    },
    breadcrumbJsonLd(serviceCrumbs(s), SITE_URL, path),
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: s.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        // Built from our own content files; "<" is escaped so nothing can close the tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <ServiceHero service={s} />
      {s.work ? <WorkStrip /> : null}
      <ServicePains service={s} />
      <ServiceFeatures service={s} />
      <ServiceTools service={s} />
      <ServicePricing service={s} />
      <ServiceFaqs eyebrow={copy.faqs.eyebrow} heading={copy.faqs.heading} items={s.faqs} />
      <OtherServices current={s} />
      <ServiceCta heading={s.cta?.heading ?? copy.cta.heading} body={s.cta?.body ?? copy.cta.body} />
    </>
  );
}
