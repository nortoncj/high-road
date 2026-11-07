import Image from "next/image";
import { author } from "@/content/blog";
import styles from "./Byline.module.css";

type BylineProps = { date: string | null; dateTime: string | null; read: string; size?: "sm" | "md" };

/** Photo, name, date and read time. One author on this site, so the name comes from content/blog.ts. */
export function Byline({ date, dateTime, read, size = "sm" }: BylineProps) {
  return (
    <span className={`${styles.byline} ${size === "md" ? styles.md : ""}`}>
      <Image src={author.photo.src} alt="" width={88} height={88} className={styles.photo} />
      <span className={styles.text}>
        <span className={styles.name}>{author.name}</span>
        <span className={styles.meta}>
          {date && dateTime ? <time dateTime={dateTime}>{date}</time> : null}
          {date ? <span aria-hidden="true"> · </span> : null}
          {read}
        </span>
      </span>
    </span>
  );
}
