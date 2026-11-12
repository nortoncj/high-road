import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { TbArrowRight, TbCheck } from "react-icons/tb";
import { serviceGrid, serviceGuide, serviceHref, services, servicesHero as hero } from "@/content/services";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageHero } from "@/components/ui/PageHero";
import { serviceIcons } from "./icons";
import styles from "./ServicesOverview.module.css";

const stagger = (i: number) => ({ "--i": i }) as CSSProperties;

/** Hero with every service listed on the right, so the first screen answers "what do you do?". */
export function ServicesHero() {
  return (
    <PageHero
      id="services-hero-heading"
      eyebrow={hero.eyebrow}
      headline={hero.headline}
      body={hero.body}
      art={
        <nav className={styles.menu} aria-label={hero.menuLabel}>
          <p className={styles.menuLabel}>{hero.menuLabel}</p>
          <ul className={styles.menuList}>
            {services.map((s, i) => {
              const Icon = serviceIcons[s.icon];
              return (
                <li key={s.slug} className="settle" style={stagger(i + 2)}>
                  <Link href={serviceHref(s.slug)} className={styles.menuLink}>
                    <span className={styles.menuIcon} aria-hidden="true">
                      <Icon />
                    </span>
                    <span className={styles.menuText}>
                      <strong>{s.label}</strong>
                      <span>{s.title}</span>
                    </span>
                    <TbArrowRight className={styles.menuArrow} aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      }
    >
      <div className={styles.heroActions}>
        <Button href={hero.primaryCta.href} arrow>
          {hero.primaryCta.label}
        </Button>
        <Button href={hero.secondaryCta.href} variant="secondary">
          {hero.secondaryCta.label}
        </Button>
      </div>
    </PageHero>
  );
}

/** A card per service: photo, what you get, the price line. The whole card is one link. */
export function ServiceGrid() {
  return (
    <section id="services" className={styles.section} aria-labelledby="services-heading">
      <div className="container">
        <header className={styles.header}>
          <Eyebrow>{serviceGrid.eyebrow}</Eyebrow>
          <h2 id="services-heading" className={styles.heading}>
            {serviceGrid.heading}
          </h2>
        </header>

        <ul className={styles.grid}>
          {services.map((s, i) => {
            const Icon = serviceIcons[s.icon];
            return (
              <li key={s.slug} className="settle" style={stagger(i)}>
                <article className={styles.card}>
                  <span className={styles.media}>
                    <Image
                      src={s.image.src}
                      alt=""
                      fill
                      placeholder="blur"
                      sizes="(min-width: 1080px) 380px, (min-width: 640px) 50vw, 100vw"
                      className={styles.img}
                    />
                    <span className={styles.tag}>
                      <Icon aria-hidden="true" />
                      {String(i + 1).padStart(2, "0")} · {s.label}
                    </span>
                  </span>
                  <div className={styles.body}>
                    <h3 className={styles.title}>
                      {/* Stretched over the whole card, so it's the one link a keyboard or screen reader meets */}
                      <Link href={serviceHref(s.slug)} className={styles.link}>
                        {s.title}
                      </Link>
                    </h3>
                    <p className={styles.summary}>{s.summary}</p>
                    <ul className={styles.highlights}>
                      {s.highlights.map((h) => (
                        <li key={h}>
                          <TbCheck aria-hidden="true" />
                          {h}
                        </li>
                      ))}
                    </ul>
                    <div className={styles.foot}>
                      <span className={styles.price}>{s.price}</span>
                      <span className={styles.go} aria-hidden="true">
                        {serviceGrid.more}
                        <TbArrowRight />
                      </span>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/** "Start with what's bugging you": the owner's problem, in their words, pointing at the fix. */
export function ServiceGuide() {
  return (
    <section id="where-to-start" className={styles.guide} aria-labelledby="guide-heading">
      <div className={`container ${styles.guideGrid}`}>
        <header className={styles.guideHead}>
          <Eyebrow>{serviceGuide.eyebrow}</Eyebrow>
          <h2 id="guide-heading" className={styles.heading}>
            {serviceGuide.heading}
          </h2>
          <p className={styles.lead}>{serviceGuide.body}</p>
        </header>
        <ul className={styles.guideList}>
          {serviceGuide.items.map(({ quote, service }) => (
            <li key={service.slug}>
              <Link href={serviceHref(service.slug)} className={styles.guideRow}>
                <span className={styles.guideQuote}>{quote}</span>
                <span className={styles.guideAnswer}>
                  {service.label}
                  <TbArrowRight aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
