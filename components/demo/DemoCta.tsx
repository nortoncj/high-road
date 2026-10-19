import { demoCta } from "@/content/work";
import { site } from "@/content/home";
import { Button } from "@/components/ui/Button";
import styles from "./DemoCta.module.css";

export function DemoCta() {
  return (
    <section className={styles.section} aria-labelledby="demo-cta-heading">
      <div className="container">
        <div className={styles.band}>
          <h2 id="demo-cta-heading" className={styles.heading}>
            {demoCta.heading}
          </h2>
          <p className={styles.body}>{demoCta.body}</p>
          <div className={styles.actions}>
            <Button href={site.bookHref} arrow>
              {demoCta.primaryCta}
            </Button>
            <Button href={demoCta.secondaryHref} variant="secondary">
              {demoCta.secondaryCta}
            </Button>
          </div>
          <p className={styles.fine}>{demoCta.fine}</p>
        </div>
      </div>
    </section>
  );
}
