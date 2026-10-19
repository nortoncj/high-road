import { whyLocal } from "@/content/about";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./WhyLocal.module.css";

export function WhyLocal() {
  return (
    <section className={styles.section} aria-labelledby="why-heading">
      <div className={`container ${styles.grid}`}>
        <header className={styles.header}>
          <Eyebrow>{whyLocal.eyebrow}</Eyebrow>
          <h2 id="why-heading" className={styles.heading}>
            {whyLocal.heading}
          </h2>
        </header>
        <div className={styles.body}>
          {whyLocal.personalReason ? (
            <blockquote className={styles.reason}>{whyLocal.personalReason}</blockquote>
          ) : null}
          {whyLocal.paragraphs.map((p, i) => (
            <p key={i} className={i === whyLocal.paragraphs.length - 1 ? styles.last : undefined}>
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
