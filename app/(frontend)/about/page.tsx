import type { Metadata } from "next";
import {
  AboutCta,
  AboutHero,
  Background,
  HowIWork,
  PersonSchema,
  QuickFacts,
  WhyHomeCare,
} from "@/components/about";
import { aboutMeta } from "@/content/about";

export const metadata: Metadata = {
  // absolute: skips the layout's " | WebTech Ninjas" suffix so the title stays under 60 characters
  title: { absolute: aboutMeta.title },
  description: aboutMeta.description,
  alternates: { canonical: aboutMeta.path },
  openGraph: {
    title: aboutMeta.title,
    description: aboutMeta.description,
    url: aboutMeta.path,
    type: "profile",
  },
};

// TopNav, Footer and MobileCtaBar come from app/layout.tsx.
export default function AboutPage() {
  return (
    <>
      <PersonSchema />
      <AboutHero />
      <WhyHomeCare />
      <Background />
      <HowIWork />
      <QuickFacts />
      <AboutCta />
    </>
  );
}
