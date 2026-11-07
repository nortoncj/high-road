import { industryBrowser } from "@/content/industries";
import { toImg, type Img } from "@/lib/sanity/image";
import type { Industry, IndustryGroup } from "@/lib/sanity/types";

export type IndustryView = {
  id: string;
  slug: string;
  name: string;
  line: string | null;
  group: IndustryGroup | null;
  clientWork: boolean;
  href: string;
  linkLabel: string;
  image: Img | null;
};

/** Case study first, then the card's own link, then the services page. */
export function toIndustryView(it: Industry): IndustryView {
  const href = it.caseStudy ? `/work/${it.caseStudy.slug}` : it.href?.trim() || industryBrowser.fallbackHref;
  return {
    id: it._id,
    slug: it.slug,
    name: it.name,
    line: it.line,
    group: it.group,
    clientWork: Boolean(it.clientWork || it.caseStudy),
    href,
    linkLabel: it.caseStudy ? industryBrowser.caseStudy : industryBrowser.go,
    image: toImg(it.image, { width: 640, aspect: 4 / 3, alt: "" }),
  };
}
