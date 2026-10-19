import { aboutCta } from "@/content/about";
import { Button } from "@/components/ui/Button";
import styles from "./AboutCta.module.css";

export function AboutCta() {
  return (
    <section className={styles.section} aria-labelledby="about-cta-heading">
      <div className="container">
        <div className={styles.band}>
          <div className={styles.copy}>
            <h2 id="about-cta-heading" className={styles.heading}>
              {aboutCta.heading}
            </h2>
            <p className={styles.body}>{aboutCta.body}</p>
          </div>
          <div className={styles.actions}>
            <Button href={aboutCta.primaryCta.href} arrow block className={styles.solid}>
              {aboutCta.primaryCta.label}
            </Button>
            <Button href={aboutCta.secondaryCta.href} variant="secondary" block className={styles.ghost}>
              {aboutCta.secondaryCta.label}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
