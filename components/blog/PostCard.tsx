import Link from "next/link";
import { TbArrowRight } from "react-icons/tb";
import { blogIndex } from "@/content/blog";
import { Thumb } from "./Thumb";
import type { PostCardView } from "./views";
import styles from "./PostCard.module.css";

type PostCardProps = {
  post: PostCardView;
  /** "grid": image on top with excerpt. "compact": small thumbnail beside the title. */
  variant?: "grid" | "compact";
  /** Hide the excerpt and show "Category · 5 min read" under the title instead. */
  brief?: boolean;
  headingLevel?: "h2" | "h3";
};

/**
 * One post. The whole card is the link; the title is its accessible name.
 * Put any entrance animation on the wrapper, not here, or it pins transform and kills the hover lift.
 */
export function PostCard({ post, variant = "grid", brief = false, headingLevel: H = "h3" }: PostCardProps) {
  if (variant === "compact") {
    return (
      <Link href={post.href} className={`${styles.card} ${styles.compact}`}>
        <span className={styles.compactThumb}>
          <Thumb image={post.image} sizes="96px" />
        </span>
        <span className={styles.compactBody}>
          <H className={styles.compactTitle}>{post.title}</H>
          <span className={styles.meta}>{post.readLabel}</span>
        </span>
      </Link>
    );
  }

  return (
    <Link href={post.href} className={styles.card}>
      <span className={styles.thumb}>
        <Thumb image={post.image} sizes="(min-width: 1080px) 390px, (min-width: 640px) 50vw, 100vw" />
      </span>
      <span className={styles.body}>
        {!brief && post.category ? <span className={styles.badge}>{post.category.title}</span> : null}
        <H className={styles.title}>{post.title}</H>
        {brief ? (
          <span className={styles.meta}>{[post.category?.title, post.readLabel].filter(Boolean).join(" · ")}</span>
        ) : (
          <>
            {post.excerpt ? <span className={styles.excerpt}>{post.excerpt}</span> : null}
            <span className={styles.foot}>
              <span className={styles.meta}>{post.readLabel}</span>
              <span className={styles.more} aria-hidden="true">
                {blogIndex.read}
                <TbArrowRight />
              </span>
            </span>
          </>
        )}
      </span>
    </Link>
  );
}
