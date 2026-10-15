import { TbCheck, TbX } from "react-icons/tb";
import { fit } from "@/content/services";
import { SectionHeader } from "./SectionHeader";
import styles from "./FitSection.module.css";

export function FitSection() {
  return (
    <section className={styles.section} aria-labelledby="fit-heading">
      <div className="container">
        <SectionHeader id="fit-heading" eyebrow={fit.eyebrow} heading={fit.heading} />
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>A good fit if</h3>
            <ul className={styles.list}>
              {fit.good.map((line) => (
                <li key={line}>
                  <TbCheck className={styles.yes} aria-hidden="true" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className={`${styles.card} ${styles.cardMuted}`}>
            <h3 className={styles.cardTitle}>Not a fit if</h3>
            <ul className={styles.list}>
              {fit.notFit.map((line) => (
                <li key={line}>
                  <TbX className={styles.no} aria-hidden="true" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
