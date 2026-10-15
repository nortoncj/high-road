import { person } from "@/content/about";

/**
 * Person JSON-LD. Tells Google and AI search that this Chris Norton is the
 * web designer at WebTech Ninjas, linked to your portfolio and LinkedIn.
 * Fill the TODOs in content/about.ts (photo URL, LinkedIn) before launch.
 */
export function PersonSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: person.name,
    jobTitle: person.jobTitle,
    url: person.url,
    image: person.image,
    worksFor: { "@type": "Organization", name: person.worksFor, url: "https://webtechninjas.com" },
    alumniOf: { "@type": "CollegeOrUniversity", name: person.alumniOf },
    knowsLanguage: person.knowsLanguage,
    sameAs: person.sameAs,
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
