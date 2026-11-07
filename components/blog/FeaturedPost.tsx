import Link from "next/link";
import { TbArrowRight } from "react-icons/tb";
import { blogIndex } from "@/content/blog";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Byline } from "./Byline";
import { Thumb } from "./Thumb";
import type { PostCardView } from "./views";
import styles from "./FeaturedPost.module.css";

/** The newest featured post (or just the newest), big, above the filterable list. */
export function FeaturedPost({ post }: { post: PostCardView }) {
  return (
    <section className={styles.section} aria-labelledby="latest-heading">
      <div className="container">
        <h2 id="latest-heading" className={styles.label}>
          <Eyebrow>{blogIndex.latestEyebrow}</Eyebrow>
        </h2>
        <Link href={post.href} className={`settle ${styles.wrap}`}>
          <article className={styles.card}>
            <span className={styles.media}>
              <Thumb image={post.image} sizes="(min-width: 1080px) 700px, 100vw" priority />
            </span>
            <span className={styles.copy}>
              <span className={styles.badges}>
                {post.featured ? <span className={styles.featured}>{blogIndex.featuredBadge}</span> : null}
                {post.category ? <span className={styles.badge}>{post.category.title}</span> : null}
              </span>
              <h3 className={styles.title}>{post.title}</h3>
              {post.excerpt ? <p className={styles.excerpt}>{post.excerpt}</p> : null}
              <span className={styles.foot}>
                <Byline date={post.dateLabel} dateTime={post.publishedAt} read={post.readLabel} />
                <span className={styles.more} aria-hidden="true">
                  {blogIndex.readPost}
                  <TbArrowRight />
                </span>
              </span>
            </span>
          </article>
        </Link>
      </div>
    </section>
  );
}
