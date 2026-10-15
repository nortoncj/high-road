import type { Metadata } from "next";
import {
  FaqSection,
  FitSection,
  IncludedGrid,
  PackagesSection,
  PainPointSection,
  SectionHeader,
  ServicesCta,
  ServicesHero,
} from "@/components/services";
import { painIntro, painPoints, servicesMeta } from "@/content/services";

export const metadata: Metadata = {
  // absolute: skips layout.tsx's " | WebTech Ninjas" template so the title stays under 60 characters
  title: { absolute: servicesMeta.title },
  description: servicesMeta.description,
  alternates: { canonical: servicesMeta.path },
  openGraph: {
    title: servicesMeta.title,
    description: servicesMeta.description,
    url: servicesMeta.path,
    type: "website",
  },
};

// TopNav, Footer and MobileCtaBar come from app/layout.tsx.
export default function ServicesPage() {
  return (
    <>
      <ServicesHero />

      <div className="container" style={{ paddingTop: 48 }}>
        <SectionHeader
          id="pain-heading"
          eyebrow={painIntro.eyebrow}
          heading={painIntro.heading}
        />
      </div>
      {painPoints.map((point, i) => (
        <PainPointSection key={point.id} point={point} reverse={i % 2 === 1} />
      ))}

      <IncludedGrid />
      <PackagesSection />
      <FitSection />
      <FaqSection />
      <ServicesCta />
    </>
  );
}
