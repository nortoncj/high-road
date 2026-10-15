import { howIWork } from "@/content/about";
import { AboutHeading } from "./AboutHeading";
import styles from "./HowIWork.module.css";

/** The promises an owner can hold you to. Keep every one of them true. */
export function HowIWork() {
  return (
    <section className={styles.section} aria-labelledby="how-heading">
      <div className="container">
        <AboutHeading id="how-heading" eyebrow={howIWork.eyebrow} heading={howIWork.heading} />
        <ol className={styles.list}>
          {howIWork.promises.map((p, i) => (
            <li key={p.title} className={styles.item}>
              <span className={styles.number} aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <p className={styles.title}>{p.title}</p>
                <p className={styles.body}>{p.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
