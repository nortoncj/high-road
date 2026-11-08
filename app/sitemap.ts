import { MetadataRoute } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { SANITY_TAG, getFeed } from "@/lib/sanity/data";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Cached as a whole, so "now" below is the time it was built, and a Sanity publish rebuilds it.
  "use cache";
  cacheTag(SANITY_TAG);
  cacheLife("hours");

  const staticRoutes = [
    "/",
    "/about",
    "/book",
    "/demo",
    "/pricing",
    "/privacy",
    "/services",
    "/work",
    "/industries",
    "/blog",
  ];

  const staticPages: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
  }));

  try {
    const { posts, caseStudies, industries } = await getFeed();

    const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt || post.publishedAt || Date.now()),
    }));

    const caseStudyRoutes: MetadataRoute.Sitemap = caseStudies.map((caseStudy) => ({
      url: `${SITE_URL}/work/${caseStudy.slug}`,
      lastModified: new Date(caseStudy.updatedAt || Date.now()),
    }));

    const industryRoutes: MetadataRoute.Sitemap = industries.map((industry) => ({
      url: `${SITE_URL}/industries/${industry.slug}`,
      lastModified: new Date(industry.updatedAt || Date.now()),
    }));

    return [...staticPages, ...industryRoutes, ...postRoutes, ...caseStudyRoutes];
  } catch (error) {
    console.error("Failed to generate sitemap:", error);
    return staticPages;
  }
}
