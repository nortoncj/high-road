import { TbX } from "react-icons/tb";
import { notIncluded } from "@/content/pricing";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./NotIncluded.module.css";

export function NotIncluded() {
  return (
    <section className={styles.section} aria-labelledby="excluded-heading">
      <div className={`container ${styles.grid}`}>
        <header className={styles.header}>
          <Eyebrow>{notIncluded.eyebrow}</Eyebrow>
          <h2 id="excluded-heading" className={styles.heading}>
            {notIncluded.heading}
          </h2>
        </header>
        <ul className={styles.list}>
          {notIncluded.items.map((item) => (
            <li key={item}>
              <span className={styles.x} aria-hidden="true">
                <TbX />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
