import {
  AddOns,
  CarePlans,
  NotIncluded,
  PackageCards,
  PayMonthly,
  PricingCta,
  PricingFaq,
  PricingHero,
} from "@/components/pricing";
import { site } from "@/content/home";
import { addOns, care, faq, meta, packages } from "@/content/pricing";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: meta.title,
  description: meta.description,
  // If buildMetadata takes a canonical path, pass meta.path here.
});

const offer = (name: string, price: number, description?: string, monthly = false) => ({
  "@type": "Offer",
  name,
  ...(description ? { description } : {}),
  priceCurrency: "USD",
  price,
  ...(monthly
    ? { priceSpecification: { "@type": "UnitPriceSpecification", price, priceCurrency: "USD", unitCode: "MON" } }
    : {}),
});

// Real prices from content/pricing.ts, so search and AI answers quote you correctly.
const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Website design",
    provider: { "@type": "ProfessionalService", name: site.name, email: site.email, telephone: "+1-727-808-9853" },
    areaServed: { "@type": "Country", name: "United States" },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Website packages and care plans",
      itemListElement: [
        ...packages.items.map((p) => offer(`${p.name} website package`, p.once, p.blurb)),
        ...packages.items.map((p) => offer(`${p.name}, paid monthly for ${p.months} months`, p.monthly, undefined, true)),
        ...care.plans.map((c) => offer(`${c.name} care plan`, c.price, undefined, true)),
        ...addOns.items.map((a) => offer(a.name, a.price)),
      ],
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  },
];

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // Static object built from our own content file, no user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <PricingHero />
      <PackageCards />
      <PayMonthly />
      <CarePlans />
      <AddOns />
      <NotIncluded />
      <PricingFaq />
      <PricingCta />
    </>
  );
}
