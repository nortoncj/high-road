// import { getCaseStudies, getPosts } from "@/sanity/sanity-utils";

// export async function GET() {
//   const baseUrl = "https://webtechninjas.com";

//   const [posts, caseStudies] = await Promise.all([
//     getPosts(),
//     getCaseStudies(),
//   ]);

//   const items = [...posts, ...caseStudies]
//     .map((item: any) => {
//       const title = item.seo?.title ?? item.title;
//       const description =
//         item.seo?.description ?? item.excerpt ?? item.description ?? "";

//       // Correct slug handling
//       const slug =
//         typeof item.slug === "string" ? item.slug : item.slug?.current;

//       // Determine correct URL based on document type
//       const url =
//         item._type === "caseStudy"
//           ? `${baseUrl}/case-studies/${slug}`
//           : `${baseUrl}/posts/${slug}`;

//       // Correct pubDate fallback
//       const pubDate = new Date(
//         item._updatedAt ||
//           item.updatedAt ||
//           item.publishedAt ||
//           item._createdAt ||
//           Date.now(),
//       ).toUTCString();

//       return `
//         <item>
//           <title><![CDATA[${title}]]></title>
//           <link>${url}</link>
//           <guid>${url}</guid>
//           <description><![CDATA[${description}]]></description>
//           <pubDate>${pubDate}</pubDate>
//         </item>
//       `;
//     })
//     .join("");

//   const xml = `<?xml version="1.0" encoding="UTF-8" ?>
//   <rss version="2.0">
//     <channel>
//       <title>Webtech Ninjas — Insights</title>
//       <link>${baseUrl}</link>
//       <description>Learn how to grow your business with our latest insights and systems.</description>
//       <language>en-us</language>
//       ${items}
//     </channel>
//   </rss>`;

//   return new Response(xml, {
//     headers: {
//       "Content-Type": "application/xml",
//     },
//   });
// }

export async function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
      <title>Webtech Ninjas — Insights</title>
      <link>https://webtechninjas.com</link>
      <description>Learn how to grow your business with our latest insights and systems.</description>
      <language>en-us</language>
    </channel>
  </rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
