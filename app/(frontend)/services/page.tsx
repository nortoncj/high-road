import {
  Basics,
  FitCheck,
  Problems,
  ServiceCta,
  ServiceHero,
  WorkStrip,
} from "@/components/services";
import { site } from "@/content/home";
import { meta, problems } from "@/content/services/website-design";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: meta.title,
  description: meta.description,
  // If buildMetadata takes a canonical path, pass meta.path here.
});

// Service schema so Google knows what this page sells and who sells it.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Website design",
  name: meta.title,
  description: meta.description,
  provider: {
    "@type": "ProfessionalService",
    name: site.name,
    telephone: "+1-727-808-9853",
    email: site.email,
  },
  areaServed: { "@type": "Country", name: "United States" },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "What every site includes",
    itemListElement: problems.items.flatMap((p) =>
      p.fixes.map((f) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: f } })),
    ),
  },
};

export default function WebsiteDesignPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // Static object built from our own content file, no user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <ServiceHero />
      <WorkStrip />
      <Problems />
      <Basics />
      <FitCheck />
      <ServiceCta />
    </>
  );
}
