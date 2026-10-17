// import { getCaseStudies, getPosts } from "@/sanity/sanity-utils";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://webtechninjas.com";

  // Only static routes here
  const staticRoutes = [
    "/",
    "/about",
    "/book",
    "/demo",
    "/pricing",
    "/privacy",
      // "/case-studies",
    // "/projects/devops",
    // "/projects/software",
    // "/projects/automation",
    // "/projects/engineering",
    // "/insights",
  ];

  const staticPages: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }));

  try {
    //   const posts = await getPosts();
    //   const caseStudies = await getCaseStudies();

    // const insightRoutes: MetadataRoute.Sitemap = posts.map((post: any) => ({
    //   url: `${baseUrl}/insights/${post.slug}`,
    //   lastModified: new Date(
    //     post._updatedAt || post.updatedAt || post.publishedAt || Date.now(),
    //   ),
    // }));
      
    //   const caseStudyRoutes: MetadataRoute.Sitemap = caseStudies.map((caseStudy: any) => ({
    //     url: `${baseUrl}/case-studies/${caseStudy.slug}`,
    //     lastModified: new Date(
    //       caseStudy._updatedAt || caseStudy.updatedAt || caseStudy.publishedAt || Date.now(),
    //     ),
    //   }));

    return [...staticPages];
  } catch (error) {
    console.error("Failed to generate sitemap:", error);
    return staticPages;
  }
}
