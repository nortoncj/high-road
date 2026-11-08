import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { sanityFetch } from "./client";
import {
  BLOG_INDEX_QUERY,
  CASE_STUDY_QUERY,
  CASE_STUDY_SLUGS_QUERY,
  FEED_QUERY,
  INDUSTRIES_QUERY,
  INDUSTRY_QUERY,
  INDUSTRY_SLUGS_QUERY,
  POST_QUERY,
  POST_SLUGS_QUERY,
} from "./queries";
import type { CaseStudyDetail, Industry, IndustryDetail, PostCard, PostDetail } from "./types";

/**
 * Every Sanity read shares this tag. Posts, case studies and industries link to each other, so a
 * publish clears all of it (app/api/sanity/revalidate). The hourly cacheLife is the safety net
 * for when the webhook isn't set up yet.
 */
export const SANITY_TAG = "sanity";

function tagged() {
  cacheTag(SANITY_TAG);
  cacheLife("hours");
}

export async function getPosts() {
  "use cache";
  tagged();
  return sanityFetch<PostCard[]>(BLOG_INDEX_QUERY, {}, []);
}

export async function getPostSlugs() {
  "use cache";
  tagged();
  return sanityFetch<string[]>(POST_SLUGS_QUERY, {}, []);
}

export async function getPost(slug: string) {
  "use cache";
  tagged();
  return sanityFetch<PostDetail | null>(POST_QUERY, { slug }, null);
}

export async function getIndustries() {
  "use cache";
  tagged();
  return sanityFetch<Industry[]>(INDUSTRIES_QUERY, {}, []);
}

export async function getIndustrySlugs() {
  "use cache";
  tagged();
  return sanityFetch<string[]>(INDUSTRY_SLUGS_QUERY, {}, []);
}

export async function getIndustry(slug: string) {
  "use cache";
  tagged();
  return sanityFetch<IndustryDetail | null>(INDUSTRY_QUERY, { slug }, null);
}

export async function getCaseStudySlugs() {
  "use cache";
  tagged();
  return sanityFetch<string[]>(CASE_STUDY_SLUGS_QUERY, {}, []);
}

export async function getCaseStudy(slug: string) {
  "use cache";
  tagged();
  return sanityFetch<CaseStudyDetail | null>(CASE_STUDY_QUERY, { slug }, null);
}

type Feed = {
  posts: { title: string; excerpt: string | null; publishedAt: string | null; slug: string; updatedAt: string; seoDescription: string | null }[];
  caseStudies: { slug: string; updatedAt: string }[];
  industries: { slug: string; updatedAt: string }[];
};

export async function getFeed() {
  "use cache";
  tagged();
  return sanityFetch<Feed>(FEED_QUERY, {}, { posts: [], caseStudies: [], industries: [] });
}

/** Picked items first, then the newest ones, without repeats. */
export function topUp<T extends { _id: string }>(picked: T[] | null | undefined, fill: T[], count = 3): T[] {
  // A reference to a deleted document comes back as null.
  const out = (picked ?? []).filter((p): p is T => Boolean(p));
  for (const item of fill) {
    if (out.length >= count) break;
    if (!out.some((o) => o._id === item._id)) out.push(item);
  }
  return out.slice(0, count);
}
