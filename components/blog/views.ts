// Turns Sanity results into plain props for cards. Runs on the server, so client components
// only ever receive strings and numbers (image URLs are already built).

import { formatDate, formatLabels, minRead } from "@/content/blog";
import { toImg, type Img } from "@/lib/sanity/image";
import type { CaseStudyCard, CategoryRef, PostCard } from "@/lib/sanity/types";

export type PostCardView = {
  id: string;
  href: string;
  title: string;
  excerpt: string | null;
  category: CategoryRef | null;
  format: string | null;
  featured: boolean;
  readLabel: string;
  dateLabel: string | null;
  publishedAt: string | null;
  image: Img | null;
};

export type CaseStudyCardView = {
  id: string;
  href: string;
  name: string;
  meta: string[];
  excerpt: string | null;
  image: Img | null;
};

export const postHref = (slug: string) => `/blog/${slug}`;
export const caseStudyHref = (slug: string) => `/work/${slug}`;

export function toPostCardView(p: PostCard, image: { width?: number; aspect?: number } = {}): PostCardView {
  return {
    id: p._id,
    href: postHref(p.slug),
    title: p.title,
    excerpt: p.excerpt,
    category: p.category,
    format: p.format ? (formatLabels[p.format] ?? null) : null,
    featured: Boolean(p.featured),
    readLabel: minRead(p.readMinutes),
    dateLabel: formatDate(p.publishedAt),
    publishedAt: p.publishedAt,
    image: toImg(p.image, { width: image.width ?? 800, aspect: image.aspect ?? 16 / 10, alt: p.image?.alt ?? "" }),
  };
}

export function toCaseStudyCardView(c: CaseStudyCard): CaseStudyCardView {
  return {
    id: c._id,
    href: caseStudyHref(c.slug),
    name: c.name,
    meta: [c.sector, c.location].filter((m): m is string => Boolean(m?.trim())).map((m) => m.trim()),
    excerpt: c.excerpt?.trim() || null,
    image: toImg(c.image, { width: 800, aspect: 16 / 9, alt: "" }),
  };
}
