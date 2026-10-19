import { TbPlus } from "react-icons/tb";
import { faq } from "@/content/pricing";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./PricingFaq.module.css";

/** Native <details> accordion: no JS, crawlable, one open at a time in current browsers. */
export function PricingFaq() {
  return (
    <section id="faq" className={styles.section} aria-labelledby="pricing-faq-heading">
      <div className={`container ${styles.grid}`}>
        <header className={styles.header}>
          <Eyebrow>{faq.eyebrow}</Eyebrow>
          <h2 id="pricing-faq-heading" className={styles.heading}>
            {faq.heading}
          </h2>
        </header>
        <div className={styles.list}>
          {faq.items.map((item, i) => (
            <details key={item.q} name="pricing-faq" className={styles.item} open={i === 0}>
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
