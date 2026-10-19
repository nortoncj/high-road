import { cta } from "@/content/pricing";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./PricingCta.module.css";

export function PricingCta() {
  return (
    <section className={styles.section} aria-labelledby="pricing-cta-heading">
      <div className="container">
        <div className={styles.band}>
          <div className={styles.copy}>
            <Eyebrow>{cta.eyebrow}</Eyebrow>
            <h2 id="pricing-cta-heading" className={styles.heading}>
              {cta.heading}
            </h2>
            <p className={styles.body}>{cta.body}</p>
          </div>
          <Button href={cta.primaryCta.href} arrow className={styles.solid}>
            {cta.primaryCta.label}
          </Button>
        </div>
      </div>
    </section>
  );
}
