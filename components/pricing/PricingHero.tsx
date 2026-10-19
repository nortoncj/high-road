import type { CSSProperties } from "react";
import { TbCheck } from "react-icons/tb";
import { hero } from "@/content/pricing";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./PricingHero.module.css";

const stagger = (i: number) => ({ "--i": i }) as CSSProperties;

export function PricingHero() {
  return (
    <section className={styles.hero} aria-labelledby="pricing-heading">
      <div className={`container ${styles.inner}`}>
        <div className="settle" style={stagger(0)}>
          <Eyebrow align="center">{hero.eyebrow}</Eyebrow>
        </div>
        <h1 id="pricing-heading" className={`settle ${styles.headline}`} style={stagger(1)}>
          {hero.headline}
        </h1>
        <p className={`settle ${styles.body}`} style={stagger(2)}>
          {hero.body}
        </p>
        <div className="settle" style={stagger(3)}>
          <Button href={hero.cta.href} arrow>
            {hero.cta.label}
          </Button>
        </div>
        <ul className={styles.reassurances}>
          {hero.reassurances.map((item) => (
            <li key={item}>
              <TbCheck aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
