import Image from "next/image";
import { moreWork } from "@/content/demo";
import styles from "./MoreWork.module.css";

/** Off-niche work stays small: one row, three cards max. */
export function MoreWork() {
  return (
    <section className={styles.section} aria-labelledby="more-heading">
      <div className="container">
        <h2 id="more-heading" className={styles.heading}>
          {moreWork.heading}
        </h2>
        <ul className={styles.grid}>
          {moreWork.items.map((p) => (
            <li key={p.name} className={styles.card}>
              <div className={styles.thumb}>
                <Image src={p.image.src} alt={p.image.alt} fill sizes="(min-width: 1080px) 380px, (min-width: 640px) 50vw, 100vw" style={{ objectFit: "cover" }} />
              </div>
              <div className={styles.body}>
                <span className={styles.badge}>{p.badge}</span>
                <h3 className={styles.name}>{p.name}</h3>
                <p className={styles.oneLine}>{p.oneLine}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className={styles.footnote}>{moreWork.footnote}</p>
      </div>
    </section>
  );
}
