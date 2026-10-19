import { AboutCta, AboutHero, Background, HowIWork, QuickFacts, WhyLocal } from "@/components/about";
import { aboutMeta, person, quickFacts } from "@/content/about";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: aboutMeta.title,
  description: aboutMeta.description,
  // If buildMetadata takes a canonical path, pass aboutMeta.path here.
});

// Person + ProfilePage schema so Google and AI search can tell you apart from the other Chris Nortons.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  url: person.url,
  mainEntity: {
    "@type": "Person",
    name: person.name,
    jobTitle: person.jobTitle,
    url: person.url,
    image: person.image,
    sameAs: person.sameAs,
    knowsLanguage: person.knowsLanguage,
    alumniOf: { "@type": "CollegeOrUniversity", name: person.alumniOf },
    worksFor: { "@type": "Organization", name: person.worksFor },
    homeLocation: { "@type": "Place", name: "Orlando, Florida" },
    hasCredential: quickFacts.facts
      .filter((f) => f.icon === "cert")
      .flatMap((f) => f.value.split(", "))
      .map((name) => ({ "@type": "EducationalOccupationalCredential", name })),
  },
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // Static object built from our own content file, no user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <AboutHero />
      <WhyLocal />
      <Background />
      <HowIWork />
      <QuickFacts />
      <AboutCta />
    </>
  );
}
