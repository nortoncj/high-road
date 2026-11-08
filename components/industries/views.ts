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

export const industryHref = (slug: string) => `/industries/${slug}`;

export function toIndustryView(it: Industry): IndustryView {
  return {
    id: it._id,
    slug: it.slug,
    name: it.name,
    line: it.line,
    group: it.group,
    clientWork: Boolean(it.clientWork || it.hasCaseStudy),
    href: industryHref(it.slug),
    linkLabel: it.hasCaseStudy ? industryBrowser.caseStudy : industryBrowser.go,
    image: toImg(it.image, { width: 640, aspect: 4 / 3, alt: "" }),
  };
}
