import Image from "next/image";
import type { CSSProperties } from "react";
import { TbArrowDown, TbCheck } from "react-icons/tb";
import { painPoints, servicesHero } from "@/content/services";
import { site } from "@/content/home";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./ServicesHero.module.css";

const stagger = (i: number) => ({ "--i": i }) as CSSProperties;

export function ServicesHero() {
  return (
    <section className={styles.hero} aria-labelledby="services-heading">
      <div className={`container ${styles.grid}`}>
        <div className={styles.copy}>
          <div className="settle" style={stagger(0)}>
            <Eyebrow>{servicesHero.eyebrow}</Eyebrow>
          </div>
          <h1 id="services-heading" className={`settle ${styles.headline}`} style={stagger(1)}>
            {servicesHero.headline}
          </h1>
          <p className={`settle ${styles.body}`} style={stagger(2)}>
            {servicesHero.body}
          </p>
          <div className={`settle ${styles.actions}`} style={stagger(3)}>
            <Button href={site.bookHref} arrow>
              {servicesHero.primaryCta}
            </Button>
            <Button href={site.demoHref} variant="secondary">
              {servicesHero.secondaryCta}
            </Button>
          </div>
          <ul className={styles.reassurances}>
            {servicesHero.reassurances.map((r) => (
              <li key={r}>
                <TbCheck aria-hidden="true" />
                {r}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.visual}>
          <div className={styles.photo}>
            <Image
              src={servicesHero.image.src}
              alt={servicesHero.image.alt}
              fill
              priority
              sizes="(min-width: 1080px) 600px, 100vw"
              className={styles.photoImg}
            />
          </div>

          <nav className={styles.jump} aria-label="On this page">
            <p className={styles.jumpHeading}>{servicesHero.jumpHeading}</p>
            <ol>
              {painPoints.map((p) => (
                <li key={p.id}>
                  <a href={`#${p.id}`}>
                    <span className={styles.jumpNumber} aria-hidden="true">
                      {p.number}
                    </span>
                    <span className={styles.jumpTitle}>{p.title}</span>
                    <TbArrowDown className={styles.jumpArrow} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>
    </section>
  );
}
