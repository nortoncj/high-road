import Image from "next/image";
import { cta } from "@/content/services/website-design";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./ServiceCta.module.css";

export function ServiceCta() {
  return (
    <section className={styles.section} aria-labelledby="service-cta-heading">
      <div className="container">
        <div className={styles.band}>
          <div className={styles.copy}>
            <Eyebrow>{cta.eyebrow}</Eyebrow>
            <h2 id="service-cta-heading" className={styles.heading}>
              {cta.heading}
            </h2>
            <p className={styles.body}>{cta.body}</p>
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
