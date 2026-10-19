import Image from "next/image";
import type { CSSProperties } from "react";
import { TbPhoneCall } from "react-icons/tb";
import { aboutHero } from "@/content/about";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./AboutHero.module.css";

const stagger = (i: number) => ({ "--i": i }) as CSSProperties;

export function AboutHero() {
  return (
    <section className={styles.hero} aria-labelledby="about-heading">
      <div className={`container ${styles.grid}`}>
        <div className={styles.copy}>
          <div className="settle" style={stagger(0)}>
            <Eyebrow>{aboutHero.eyebrow}</Eyebrow>
          </div>
          <h1 id="about-heading" className={`settle ${styles.headline}`} style={stagger(1)}>
            {aboutHero.headline}
          </h1>
          <p className={`settle ${styles.intro}`} style={stagger(2)}>
            {aboutHero.intro}
          </p>
          <p className={`settle ${styles.second}`} style={stagger(3)}>
            {aboutHero.secondLine}
          </p>
          <div className="settle" style={stagger(4)}>
            <Button href={aboutHero.cta.href} arrow>
              {aboutHero.cta.label}
            </Button>
          </div>
        </div>

        <figure className={styles.portrait}>
          {/* Faceted frame: the corners are cut like the planes of the mask */}
          <div className={styles.frame}>
            <Image
              src={aboutHero.photo.src}
              alt={aboutHero.photo.alt}
              fill
              priority
              sizes="(min-width: 1080px) 460px, (min-width: 640px) 60vw, 92vw"
              className={styles.photo}
            />
          </div>
          <span className={styles.shard} aria-hidden="true" />
          <span className={styles.shardSmall} aria-hidden="true" />

          <figcaption className={styles.caption}>
            <span className={styles.captionName}>{aboutHero.caption.name}</span>
            <span className={styles.captionRole}>{aboutHero.caption.role}</span>
          </figcaption>

          <span className={styles.badge}>
            <TbPhoneCall aria-hidden="true" />
            {aboutHero.badge}
          </span>
        </figure>
      </div>
    </section>
  );
}
