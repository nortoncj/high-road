import Image from "next/image";
import { servicesCta as cta } from "@/content/services";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./ServiceCta.module.css";

/** Closing band on /services and every service page. A service page can swap the heading and text. */
export function ServiceCta({ heading = cta.heading, body = cta.body }: { heading?: string; body?: string }) {
  return (
    <section className={styles.section} aria-labelledby="service-cta-heading">
      <div className="container">
        <div className={styles.band}>
          <div className={styles.copy}>
            <Eyebrow>{cta.eyebrow}</Eyebrow>
            <h2 id="service-cta-heading" className={styles.heading}>
              {heading}
            </h2>
            <p className={styles.body}>{body}</p>
          </div>
          <div className={styles.side}>
            <div className={styles.person}>
              <Image src={cta.person.photo.src} alt="" width={112} height={112} className={styles.avatar} />
              <span>
                <strong>{cta.person.name}</strong>
                {cta.person.line}
              </span>
            </div>
            <div className={styles.actions}>
              <Button href={cta.primaryCta.href} arrow block className={styles.solid}>
                {cta.primaryCta.label}
              </Button>
              <Button href={cta.secondaryCta.href} variant="secondary" block className={styles.ghost}>
                {cta.secondaryCta.label}
              </Button>
            </div>
            <p className={styles.fine}>{cta.fine}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
