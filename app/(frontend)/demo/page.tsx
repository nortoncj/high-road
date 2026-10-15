import type { Metadata } from "next";
import {
  CaseStudies,
  DemoCta,
  DemoHero,
  FeaturedSite,
  MoreWork,
  SampleProjects,
} from "@/components/demo";
import { demoMeta } from "@/content/demo";

export const metadata: Metadata = {
  // absolute: skips the layout's " | WebTech Ninjas" suffix (the title already has the brand)
  title: { absolute: demoMeta.title },
  description: demoMeta.description,
  alternates: { canonical: demoMeta.path },
  openGraph: {
    title: demoMeta.title,
    description: demoMeta.description,
    url: demoMeta.path,
    type: "website",
  },
};

// TopNav, Footer and MobileCtaBar come from app/layout.tsx.
// Point every "Try the demo application" button on the site at /demo#apply.
export default function DemoPage() {
  return (
    <>
      <DemoHero />
      <FeaturedSite />
      <SampleProjects />
      <CaseStudies />
      <MoreWork />
      <DemoCta />
    </>
  );
}
