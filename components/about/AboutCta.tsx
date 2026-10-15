import { TbPhone } from "react-icons/tb";
import { aboutCta } from "@/content/about";
import { site } from "@/content/home";
import { Button } from "@/components/ui/Button";
import styles from "./AboutCta.module.css";

export function AboutCta() {
  return (
    <section className={styles.section} aria-labelledby="about-cta-heading">
      <div className="container">
        <div className={styles.band}>
          <h2 id="about-cta-heading" className={styles.heading}>
            {aboutCta.heading}
          </h2>
          <p className={styles.body}>{aboutCta.body}</p>
          <div className={styles.actions}>
            <Button href={site.bookHref} arrow>
              {aboutCta.primaryCta}
            </Button>
            <Button href={aboutCta.secondaryHref} variant="secondary">
              {aboutCta.secondaryCta}
            </Button>
          </div>
          <p className={styles.fine}>
            Or call me at{" "}
            <a href={site.phoneHref} className={styles.phone}>
              <TbPhone aria-hidden="true" />
              {site.phone}
            </a>
            . Se habla español.
          </p>
        </div>
      </div>
    </section>
  );
}
