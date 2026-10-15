import Image from "next/image";
import { TbCheck, TbQuote } from "react-icons/tb";
import type { PainPoint } from "@/content/services";
import styles from "./PainPointSection.module.css";

type Props = {
  point: PainPoint;
  /** Flips the image to the right on desktop so the page zig-zags. */
  reverse?: boolean;
};

/** One problem, in the owner's words, and what the site does about it. */
export function PainPointSection({ point, reverse = false }: Props) {
  const headingId = `${point.id}-heading`;

  return (
    <section id={point.id} className={styles.section} aria-labelledby={headingId}>
      <div className={`container ${styles.grid} ${reverse ? styles.reverse : ""}`}>
        <div className={styles.media}>
          <div className={styles.photo}>
            <Image
              src={point.image.src}
              alt={point.image.alt}
              fill
              sizes="(min-width: 1080px) 560px, 100vw"
              className={styles.photoImg}
            />
          </div>
        </div>

        <div className={styles.copy}>
          <span className={styles.number} aria-hidden="true">
            {point.number}
          </span>
          <h2 id={headingId} className={styles.title}>
            {point.title}
          </h2>

          <figure className={styles.quote}>
            <TbQuote className={styles.quoteIcon} aria-hidden="true" />
            <blockquote>{point.quote}</blockquote>
            <figcaption>Sound familiar?</figcaption>
          </figure>

          <p className={styles.body}>{point.body}</p>

          <div>
            <p className={styles.listTitle}>What you get</p>
            <ul className={styles.list}>
              {point.bullets.map((b) => (
                <li key={b}>
                  <TbCheck aria-hidden="true" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {point.note ? <p className={styles.note}>{point.note}</p> : null}
        </div>
      </div>
    </section>
  );
}
