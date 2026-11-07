import { blogCta, blogHero, blogIndex, blogMeta } from "@/content/blog";
import { FeaturedPost, Newsletter, PostBrowser } from "@/components/blog";
import { toPostCardView } from "@/components/blog/views";
import { CtaBand } from "@/components/ui/CtaBand";
import { PageHero } from "@/components/ui/PageHero";
import { getPosts } from "@/lib/sanity/data";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: blogMeta.title,
  description: blogMeta.description,
  path: blogMeta.path,
});

export default async function BlogPage() {
  const posts = await getPosts();
  // The newest featured post leads; without one, the newest post does.
  const lead = posts.find((p) => p.featured) ?? posts[0];
  const rest = posts.filter((p) => p._id !== lead?._id).map((p) => toPostCardView(p));

  return (
    <>
      <PageHero id="blog-heading" eyebrow={blogHero.eyebrow} headline={blogHero.headline} body={blogHero.body} />
      {lead ? <FeaturedPost post={toPostCardView(lead, { width: 1400 })} /> : null}
      {rest.length ? <PostBrowser posts={rest} /> : null}
      {lead ? null : (
        <p className="container" style={{ paddingBlock: "56px", color: "var(--ink-muted)" }}>
          {blogIndex.noPosts}
        </p>
      )}
      <Newsletter />
      <CtaBand id="blog-cta" {...blogCta} />
    </>
  );
}
