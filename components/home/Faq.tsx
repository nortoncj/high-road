import { TbPlus } from "react-icons/tb";
import { faq } from "@/content/home";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./Faq.module.css";

/**
 * Native <details> accordion: works without JavaScript and is crawlable.
 * The shared `name` makes it one-open-at-a-time in current browsers.
 */
export function Faq() {
  return (
    <section id="faq" className={styles.section} aria-labelledby="faq-heading">
      <div className={`container ${styles.grid}`}>
        <header className={styles.header}>
          <Eyebrow>{faq.eyebrow}</Eyebrow>
          <h2 id="faq-heading" className={styles.heading}>
            {faq.heading}
          </h2>
          <p className={styles.lead}>{faq.body}</p>
        </header>

        <div className={styles.list}>
          {faq.items.map((item, i) => (
            <details key={item.q} name="faq" className={styles.item} open={i === 0}>
              <summary className={styles.q}>
                <span>{item.q}</span>
                <span className={styles.pm} aria-hidden="true">
                  <TbPlus />
                </span>
              </summary>
              <p className={styles.a}>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
