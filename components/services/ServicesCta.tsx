import { servicesCta } from "@/content/services";
import { site } from "@/content/home";
import { Button } from "@/components/ui/Button";
import styles from "./ServicesCta.module.css";

export function ServicesCta() {
  return (
    <section className={styles.section} aria-labelledby="services-cta-heading">
      <div className="container">
        <div className={styles.band}>
          <h2 id="services-cta-heading" className={styles.heading}>
            {servicesCta.heading}
          </h2>
          <p className={styles.body}>{servicesCta.body}</p>
          <div className={styles.actions}>
            <Button href={site.bookHref} arrow>
              {servicesCta.primaryCta}
            </Button>
            <Button href={site.demoHref} variant="secondary">
              {servicesCta.secondaryCta}
            </Button>
          </div>
          <p className={styles.fine}>{servicesCta.fine}</p>
        </div>
      </div>
    </section>
  );
}
