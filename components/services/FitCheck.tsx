import { TbCheck, TbX } from "react-icons/tb";
import { fit } from "@/content/services/website-design";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./FitCheck.module.css";

/** Good fit / not a fit. Saying who you're NOT for builds more trust than another feature list. */
export function FitCheck() {
  return (
    <section className={styles.section} aria-labelledby="fit-heading">
      <div className="container">
        <header className={styles.header}>
          <Eyebrow>{fit.eyebrow}</Eyebrow>
          <h2 id="fit-heading" className={styles.heading}>
            {fit.heading}
          </h2>
        </header>

        <div className={styles.grid}>
          <div className={styles.good}>
            <h3 className={styles.colTitle}>{fit.good.title}</h3>
            <ul>
              {fit.good.items.map((item) => (
                <li key={item}>
                  <span className={styles.yes} aria-hidden="true">
                    <TbCheck />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.bad}>
            <h3 className={styles.colTitle}>{fit.bad.title}</h3>
            <ul>
              {fit.bad.items.map((item) => (
                <li key={item}>
                  <span className={styles.no} aria-hidden="true">
                    <TbX />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
