import Link from "next/link";
import { TbArrowRight } from "react-icons/tb";
import { blocks } from "@/content/blog";
import { toImg } from "@/lib/sanity/image";
import type { CalloutCardBlock } from "@/lib/sanity/types";
import { Thumb } from "./Thumb";
import { caseStudyHref, postHref } from "./views";
import styles from "./Callout.module.css";

/**
 * "Case study" card dropped into a post body. Points at a case study or post picked in the Studio
 * (its title, summary and image fill any blanks), or at any link typed in by hand.
 */
export function Callout({ block }: { block: CalloutCardBlock }) {
  const t = block.target;
  const href = t ? (t._type === "caseStudy" ? caseStudyHref(t.slug) : postHref(t.slug)) : block.href?.trim();
  const title = block.title?.trim() || t?.title;
  if (!href || !title) return null;

  const text = block.text?.trim() || t?.excerpt;
  const image = toImg(block.image?.asset ? block.image : t?.image, { width: 600, aspect: 1, alt: "" });
  const linkLabel =
    block.linkLabel?.trim() ||
    (t?._type === "caseStudy" ? blocks.callout.caseStudyLink : t?._type === "post" ? blocks.callout.postLink : blocks.callout.link);

  return (
    <Link href={href} className={styles.card}>
      <span className={styles.media}>
        <Thumb image={image} sizes="220px" />
      </span>
      <span className={styles.body}>
        <span className={styles.kicker}>{block.kicker?.trim() || blocks.callout.kicker}</span>
        <span className={styles.title}>{title}</span>
        {text ? <span className={styles.text}>{text}</span> : null}
        <span className={styles.go}>
          {linkLabel}
          <TbArrowRight aria-hidden="true" />
        </span>
      </span>
    </Link>
  );
}
