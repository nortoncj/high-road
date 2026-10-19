import type { CSSProperties } from "react";
import { TbBell, TbCheck, TbMapPin, TbMessage, TbSend } from "react-icons/tb";
import { hero } from "@/content/services/website-design";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./ServiceHero.module.css";

const stagger = (i: number) => ({ "--i": i }) as CSSProperties;
const icons = [TbBell, TbMessage, TbSend, TbMapPin];

export function ServiceHero() {
  return (
    <section className={styles.hero} aria-labelledby="service-heading">
      <div className={`container ${styles.grid}`}>
        <div className={styles.copy}>
          <div className="settle" style={stagger(0)}>
            <Eyebrow>{hero.eyebrow}</Eyebrow>
          </div>
          <h1 id="service-heading" className={`settle ${styles.headline}`} style={stagger(1)}>
            {hero.headline}
          </h1>
          <p className={`settle ${styles.body}`} style={stagger(2)}>
            {hero.body}
          </p>
          <div className={`settle ${styles.actions}`} style={stagger(3)}>
            <Button href={hero.primaryCta.href} arrow>
              {hero.primaryCta.label}
            </Button>
            <Button href={hero.secondaryCta.href} variant="secondary">
              {hero.secondaryCta.label}
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

        {/* Plays once on load: a form lead becomes a text, an auto reply and a logged source in two seconds */}
        <figure className={styles.timeline}>
          <figcaption className={styles.timelineTop}>
            <span className={styles.timelineLabel}>{hero.timelineLabel}</span>
            <span className={styles.example}>{hero.timelineNote}</span>
          </figcaption>
          <ol className={styles.events}>
            {hero.timeline.map((e, i) => {
              const Icon = icons[i % icons.length];
              return (
                <li key={e.title} className={styles.event} style={{ "--n": i } as CSSProperties}>
                  <span className={styles.eventIcon} data-first={i === 0} aria-hidden="true">
                    <Icon />
                  </span>
                  <div className={styles.eventText}>
                    <div className={styles.eventRow}>
                      <strong>{e.title}</strong>
                      <span className={styles.time}>{e.time}</span>
                    </div>
                    <span>{e.meta}</span>
                  </div>
                </li>
              );
            })}
          </ol>
        </figure>
      </div>
    </section>
  );
}
