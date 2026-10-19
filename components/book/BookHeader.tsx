import Image from "next/image";
import type { CSSProperties } from "react";
import { TbCheck } from "react-icons/tb";
import { book } from "@/content/book";
import { aboutHero } from "@/content/about";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./BookHeader.module.css";

const stagger = (i: number) => ({ "--i": i }) as CSSProperties;

/** Left column: what the call is, in three steps, and who's on the other end. */
export function BookHeader() {
  return (
    <div className={styles.header}>
      <div className="settle" style={stagger(0)}>
        <Eyebrow>{book.eyebrow}</Eyebrow>
      </div>
      <h1 id="book-heading" className={`settle ${styles.headline}`} style={stagger(1)}>
        {book.headline}
      </h1>

      <ol className={`settle ${styles.steps}`} style={stagger(2)}>
        {book.steps.map((s, i) => (
          <li key={s}>
            <span className={styles.num} aria-hidden="true">
              {i + 1}
            </span>
            <span>{s}</span>
          </li>
        ))}
      </ol>

      <p className={`settle ${styles.small}`} style={stagger(3)}>
        <TbCheck aria-hidden="true" />
        {book.smallLine}
      </p>

      <div className={`settle ${styles.trust}`} style={stagger(4)}>
        <span className={styles.avatar}>
          <Image src={aboutHero.photo.src} alt="" fill sizes="56px" className={styles.avatarImg} />
        </span>
        <p>{book.trustLine}</p>
      </div>
    </div>
  );
}
