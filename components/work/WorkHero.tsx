import type { CSSProperties } from "react";
import { caseStudies, hero } from "@/content/work";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./WorkHero.module.css";

const stagger = (i: number) => ({ "--i": i }) as CSSProperties;

export function WorkHero() {
  return (
    <section className={styles.hero} aria-labelledby="work-heading">
      <div className={`container ${styles.inner}`}>
        <div className={styles.copy}>
          <div className="settle" style={stagger(0)}>
            <Eyebrow>{hero.eyebrow}</Eyebrow>
          </div>
          <h1 id="work-heading" className={`settle ${styles.headline}`} style={stagger(1)}>
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
        </div>

        <nav className={`settle ${styles.jump}`} style={stagger(4)} aria-label={hero.jumpLabel}>
          <p className={styles.jumpLabel}>{hero.jumpLabel}</p>
          <ol>
            {caseStudies.map((s, i) => (
              <li key={s.slug}>
                <a href={`#${s.slug}`}>
                  <span className={styles.num}>{String(i + 1).padStart(2, "0")}</span>
                  <span className={styles.jumpName}>{s.name}</span>
                  <span className={styles.jumpMeta}>{s.meta[0]}</span>
                </a>
              </li>
            ))}
            <li>
              <a href="#own-system">
                <span className={styles.num}>{String(caseStudies.length + 1).padStart(2, "0")}</span>
                <span className={styles.jumpName}>WebTech Ninjas</span>
                <span className={styles.jumpMeta}>This site</span>
              </a>
            </li>
          </ol>
        </nav>
      </div>
    </section>
  );
}
