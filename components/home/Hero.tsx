import Image from "next/image";
import type { CSSProperties } from "react";
import { TbArrowRight, TbBell, TbCheck, TbMessage } from "react-icons/tb";
import { hero, site } from "@/content/home";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./Hero.module.css";

const stagger = (i: number) => ({ "--i": i }) as CSSProperties;

export function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      <div className={`container ${styles.grid}`}>
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
            <Button href={site.demoHref} variant="secondary">
              {hero.secondaryCta}
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

        <figure className={styles.visual}>
          <div className={styles.photo}>
            <Image
              src={hero.image.src}
              alt={hero.image.alt}
              fill
              priority
              sizes="(min-width: 960px) 640px, 100vw"
              className={styles.photoImg}
            />
          </div>

          <PhoneMock />

          <div className={styles.alerts} aria-hidden="true">
            {hero.alerts.map((alert, i) => (
              <div key={alert.title} className={styles.alert}>
                <span
                  className={
                    i === 0 ? styles.alertIconTint : styles.alertIconSunken
                  }
                >
                  {i === 0 ? <TbBell /> : <TbMessage />}
                </span>
                <div className={styles.alertText}>
                  <div className={styles.alertRow}>
                    <strong>{alert.title}</strong>
                    <span className={styles.time}>{alert.time}</span>
                  </div>
                  <span>{alert.meta}</span>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.summary}>
            <span className={styles.summaryIcon} aria-hidden="true">
              <TbCheck />
            </span>
            <div>
              <p className={styles.summaryTitle}>{hero.summary.title}</p>
              <p className={styles.summaryBody}>{hero.summary.body}</p>
            </div>
          </div>

          <figcaption className="visually-hidden">
            Example of the caregiver application on a phone, with a new
            application alert sent to the agency owner.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

/** Decorative phone showing step one of the caregiver application. */
function PhoneMock() {
  return (
    <div className={styles.phone} aria-hidden="true">
      <div className={styles.phoneTop}>
        <span className={styles.phoneBrand}>[Agency name]</span>
        <span className={styles.lang}>EN | ES</span>
      </div>
      <p className={styles.phoneTitle}>Apply to be a caregiver</p>
      <p className={styles.phoneSub}>
        Join our team and make a difference close to home.
      </p>
      <div className={styles.steps}>
        <span className={styles.stepOn}>1</span>
        <span className={styles.stepLine} />
        <span className={styles.stepOff}>2</span>
        <span className={styles.stepLine} />
        <span className={styles.stepOff}>3</span>
      </div>
      <div className={styles.field}>
        <span>Full name</span>
        <span className={styles.input}>Maria Lopez</span>
      </div>
      <div className={styles.field}>
        <span>Phone number</span>
        <span className={styles.input}>(941) 000-0000</span>
      </div>
      <span className={styles.phoneButton}>
        Next <TbArrowRight />
      </span>
      <span className={styles.phoneNote}>Takes about 3 minutes</span>
    </div>
  );
}
