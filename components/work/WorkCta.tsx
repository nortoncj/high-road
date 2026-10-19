import { cta } from "@/content/work";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./WorkCta.module.css";

export function WorkCta() {
  return (
    <section className={styles.section} aria-labelledby="work-cta-heading">
      <div className="container">
        <div className={styles.band}>
          <div className={styles.copy}>
            <Eyebrow>{cta.eyebrow}</Eyebrow>
            <h2 id="work-cta-heading" className={styles.heading}>
              {cta.heading}
            </h2>
            <p className={styles.body}>{cta.body}</p>
          </div>
          <div className={styles.actions}>
            <Button href={cta.primaryCta.href} arrow block className={styles.solid}>
              {cta.primaryCta.label}
            </Button>
            <Button href={cta.secondaryCta.href} variant="secondary" block className={styles.ghost}>
              {cta.secondaryCta.label}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
