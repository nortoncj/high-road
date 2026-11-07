import { industriesCta, industriesMeta, industryBrowser, notListed } from "@/content/industries";
import { site } from "@/content/home";
import { IndustriesHero, IndustryBrowser, IndustryMarquee, Playbook, toIndustryView } from "@/components/industries";
import { CtaBand } from "@/components/ui/CtaBand";
import { getIndustries } from "@/lib/sanity/data";
import { SITE_URL, buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: industriesMeta.title,
  description: industriesMeta.description,
  path: industriesMeta.path,
});

export default async function IndustriesPage() {
  const industries = (await getIndustries()).map(toIndustryView);
  const withImages = industries.filter((i) => i.image);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Website design",
    name: industriesMeta.title,
    description: industriesMeta.description,
    url: new URL(industriesMeta.path, SITE_URL).toString(),
    provider: { "@type": "ProfessionalService", name: site.name, email: site.email },
    audience: industries.map((i) => ({ "@type": "BusinessAudience", audienceType: i.name })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Built from our own CMS content; "<" is escaped so nothing can close the tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <IndustriesHero tiles={withImages} />
      <IndustryMarquee names={industries.map((i) => i.name)} />
      {industries.length ? (
        <IndustryBrowser industries={industries} />
      ) : (
        <p className="container" style={{ paddingBlock: "56px", color: "var(--ink-muted)" }}>
          {industryBrowser.empty}
        </p>
      )}
      <Playbook />
      <CtaBand id="not-listed" variant="soft" eyebrow={notListed.eyebrow} heading={notListed.heading} body={notListed.body} primaryCta={notListed.cta} />
      <CtaBand id="industries-cta" {...industriesCta} />
    </>
  );
}
