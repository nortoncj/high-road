import { getFeed } from "@/lib/sanity/data";
import { SITE_URL } from "@/lib/seo";

const cdata = (s: string) => `<![CDATA[${s.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;

/** Blog posts from Sanity, newest first. */
export async function GET() {
  const { posts } = await getFeed();

  const items = posts
    .map((post) => {
      const url = `${SITE_URL}/blog/${post.slug}`;
      const pubDate = new Date(post.publishedAt || post.updatedAt).toUTCString();
      return `
        <item>
          <title>${cdata(post.title)}</title>
          <link>${url}</link>
          <guid>${url}</guid>
          <description>${cdata(post.seoDescription || post.excerpt || "")}</description>
          <pubDate>${pubDate}</pubDate>
        </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
      <title>Webtech Ninjas Blog</title>
      <link>${SITE_URL}/blog</link>
      <description>Straight answers about websites that bring in work, for local business owners.</description>
      <language>en-us</language>${items}
    </channel>
  </rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
