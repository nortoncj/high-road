import Image from "next/image";
import type { Img } from "@/lib/sanity/image";
import styles from "./Thumb.module.css";

type ThumbProps = {
  image: Img | null;
  sizes: string;
  priority?: boolean;
  className?: string;
};

/**
 * Fills its parent (give the parent a size or aspect-ratio). With no image from the Studio,
 * shows a faceted teal tile instead of a broken box.
 */
export function Thumb({ image, sizes, priority = false, className }: ThumbProps) {
  if (!image) return <span className={`${styles.fallback} ${className ?? ""}`} aria-hidden="true" />;
  return (
    <Image
      src={image.src}
      alt={image.alt}
      fill
      sizes={sizes}
      priority={priority}
      placeholder={image.blurDataURL ? "blur" : "empty"}
      blurDataURL={image.blurDataURL}
      className={`${styles.img} ${className ?? ""}`}
    />
  );
}
