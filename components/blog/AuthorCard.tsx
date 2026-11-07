import Image from "next/image";
import Link from "next/link";
import { author } from "@/content/blog";
import styles from "./AuthorCard.module.css";

export function AuthorCard() {
  return (
    <div className={styles.card}>
      <Image src={author.photo.src} alt={author.photo.alt} width={128} height={128} className={styles.photo} />
      <div className={styles.text}>
        <p className={styles.name}>
          {author.writtenBy} {author.name}
        </p>
        <p className={styles.bio}>{author.bio}</p>
        <Link href={author.aboutHref} className={styles.link}>
          {author.aboutLabel}
        </Link>
      </div>
    </div>
  );
}
