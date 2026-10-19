"use client";

import Image from "next/image";
import { useEffect, useState, type CSSProperties } from "react";
import { TbCheck } from "react-icons/tb";
import { hero, site } from "@/content/home";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./Hero.module.css";

const stagger = (i: number) => ({ "--i": i }) as CSSProperties;

/** Full-bleed photo hero. The trade picker swaps the photo and the line under the headline. */
export function Hero() {
  const { trades } = hero;
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);

  // Rotate trades until someone picks one. Reduced motion: never rotate.
  useEffect(() => {
    if (!auto) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAuto(false);
      return;
    }
    const id = window.setInterval(
      () => setActive((i) => (i + 1) % trades.length),
      hero.rotateMs,
    );
    return () => window.clearInterval(id);
  }, [auto, trades.length]);

  const pick = (i: number) => {
    setActive(i);
    setAuto(false);
  };

  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      <div className={styles.media} aria-hidden="true">
        {trades.map((t, i) => (
          <Image
            key={t.id}
            src={t.image.src}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className={styles.bg}
            data-active={i === active}
          />
        ))}
        <div className={styles.shade} />
      </div>

      <div className={`container ${styles.inner}`}>
        <div className={styles.copy}>
          <div className="settle" style={stagger(0)}>
            <Eyebrow>{hero.eyebrow}</Eyebrow>
          </div>
          <h1
            id="hero-heading"
            className={`settle ${styles.headline}`}
            style={stagger(1)}
          >
            {hero.headline}
          </h1>
          <p className={`settle ${styles.body}`} style={stagger(2)}>
            {hero.body}
          </p>
          <div className={`settle ${styles.actions}`} style={stagger(3)}>
            <Button href={site.bookHref} arrow>
              {hero.primaryCta}
            </Button>
            <Button
              href={hero.secondaryCta.href}
              variant="secondary"
              className={styles.ghost}
            >
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

        <div className={`settle ${styles.picker}`} style={stagger(4)}>
          <div
            className={styles.chips}
            role="group"
            aria-label={`${hero.pickerLabel} your trade`}
          >
            <span className={styles.pickerLabel} aria-hidden="true">
              {hero.pickerLabel}
            </span>
            {trades.map((t, i) => (
              <button
                key={t.id}
                type="button"
                className={styles.chip}
                aria-pressed={i === active}
                onClick={() => pick(i)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <p className={styles.line} aria-live="polite">
            <span key={trades[active].id}>{trades[active].line}</span>
          </p>
          <span className={styles.timer} data-paused={!auto} aria-hidden="true">
            <i
              key={active}
              style={{ "--rotate": `${hero.rotateMs}ms` } as CSSProperties}
            />
          </span>
        </div>
      </div>
    </section>
  );
}
