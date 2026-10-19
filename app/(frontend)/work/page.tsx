import { CaseStudies, ClientQuotes, OwnSystem, WorkCta, WorkHero } from "@/components/work";
import { site } from "@/content/home";
import { caseStudies, meta } from "@/content/work";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: meta.title,
  description: meta.description,
  // If buildMetadata takes a canonical path, pass meta.path here.
});

// Each project as a CreativeWork, credited to you.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: `Work by ${site.name}`,
  description: meta.description,
  hasPart: caseStudies.map((s) => ({
    "@type": "CreativeWork",
    name: `${s.name} website`,
    about: s.meta.join(", "),
    ...(s.href ? { url: s.href } : {}),
    creator: { "@type": "Person", name: "Chris Norton", worksFor: { "@type": "Organization", name: site.name } },
  })),
};

export default function WorkPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // Static object built from our own content file, no user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <WorkHero />
      <CaseStudies />
      <OwnSystem />
      <ClientQuotes />
      <WorkCta />
    </>
  );
}
