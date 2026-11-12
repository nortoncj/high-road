import { FitCheck, ServiceCta, ServiceFaqs, ServiceGrid, ServiceGuide, ServicesHero } from "@/components/services";
import { site } from "@/content/home";
import { serviceHref, services, servicesFaq, servicesMeta } from "@/content/services";
import { SITE_URL, buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: servicesMeta.title,
  description: servicesMeta.description,
  path: servicesMeta.path,
});

// Every service as a list Google can read, plus the questions at the bottom.
const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: servicesMeta.title,
    itemListElement: services.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Service",
        name: s.label,
        description: s.summary,
        url: new URL(serviceHref(s.slug), SITE_URL).toString(),
        provider: { "@type": "ProfessionalService", name: site.name, email: site.email, url: SITE_URL },
      },
    })),
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: servicesFaq.items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  },
];

export default function ServicesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // Static object built from our own content file, no user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <ServicesHero />
      <ServiceGrid />
      <ServiceGuide />
      <FitCheck />
      <ServiceFaqs id="questions" eyebrow={servicesFaq.eyebrow} heading={servicesFaq.heading} items={servicesFaq.items} flush />
      <ServiceCta />
    </>
  );
}
