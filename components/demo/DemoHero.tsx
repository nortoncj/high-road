import type { CSSProperties } from "react";
import { TbArrowDown } from "react-icons/tb";
import { demoHero } from "@/content/work";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./DemoHero.module.css";

const stagger = (i: number) => ({ "--i": i }) as CSSProperties;

export function DemoHero() {
  return (
    <section className={styles.hero} aria-labelledby="demo-hero-heading">
      <div className={`container ${styles.inner}`}>
        <div className="settle" style={stagger(0)}>
          <Eyebrow>{demoHero.eyebrow}</Eyebrow>
        </div>
        <h1
          id="demo-hero-heading"
          className={`settle ${styles.headline}`}
          style={stagger(1)}
        >
          {demoHero.headline}
        </h1>
        <p className={`settle ${styles.intro}`} style={stagger(2)}>
          {demoHero.intro}
        </p>
        <div className={`settle ${styles.actions}`} style={stagger(3)}>
          <Button href="#apply" arrow>
            {demoHero.primaryCta}
          </Button>
          <Button href="#work" variant="secondary">
            {demoHero.secondaryCta}
          </Button>
        </div>
        <nav aria-label="On this page" className={styles.jumps}>
          {demoHero.jumps.map((j) => (
            <a key={j.href} href={j.href}>
              {j.label}
              <TbArrowDown aria-hidden="true" />
            </a>
          ))}
        </nav>
      </div>
    </section>
  );
}
