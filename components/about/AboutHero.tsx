import Image from "next/image";
import type { CSSProperties } from "react";
import { aboutHero } from "@/content/about";
import { site } from "@/content/home";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./AboutHero.module.css";

const stagger = (i: number) => ({ "--i": i }) as CSSProperties;

/** Your photo is the biggest thing on the screen. Owners hire people they feel they know. */
export function AboutHero() {
  return (
    <section className={styles.hero} aria-labelledby="about-hero-heading">
      <div className={`container ${styles.grid}`}>
        <figure className={styles.figure}>
          <div className={styles.photo}>
            <Image
              src={aboutHero.photo.src}
              alt={aboutHero.photo.alt}
              fill
              priority
              sizes="(min-width: 1080px) 480px, 100vw"
              className={styles.photoImg}
            />
          </div>
          <figcaption className={styles.caption}>{aboutHero.caption}</figcaption>
        </figure>

        <div className={styles.copy}>
          <div className="settle" style={stagger(0)}>
            <Eyebrow>{aboutHero.eyebrow}</Eyebrow>
          </div>
          <h1 id="about-hero-heading" className={`settle ${styles.headline}`} style={stagger(1)}>
            {aboutHero.headline}
          </h1>
          <p className={`settle ${styles.intro}`} style={stagger(2)}>
            {aboutHero.intro}
          </p>
          <p className={`settle ${styles.second}`} style={stagger(3)}>
            {aboutHero.secondLine}
          </p>
          <div className="settle" style={stagger(4)}>
            <Button href={site.bookHref} arrow>
              {aboutHero.cta}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
