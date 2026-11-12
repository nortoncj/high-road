import Image from "next/image";
import type { CSSProperties } from "react";
import { TbCheck } from "react-icons/tb";
import { servicePage as copy } from "@/content/services";
import type { Service } from "@/content/services/types";
import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { serviceIcons } from "./icons";
import styles from "./ServiceHero.module.css";

const stagger = (i: number) => ({ "--i": i }) as CSSProperties;

export function serviceCrumbs(s: Service): Crumb[] {
  return [copy.crumbs.home, { label: s.label }];
}

/** Top of every service page: what it does on the left, the photo on the right. */
export function ServiceHero({ service: s }: { service: Service }) {
  const Icon = serviceIcons[s.icon];
  return (
    <section className={styles.hero} aria-labelledby="service-heading">
      <div className={`container ${styles.grid}`}>
        <div className={styles.copy}>
          <div className={styles.crumbs}>
            <Breadcrumbs items={serviceCrumbs(s)} />
          </div>
          <div className="settle" style={stagger(0)}>
            <Eyebrow>{s.hero.eyebrow}</Eyebrow>
          </div>
          <h1 id="service-heading" className={`settle ${styles.headline}`} style={stagger(1)}>
            {s.title}
          </h1>
          <p className={`settle ${styles.body}`} style={stagger(2)}>
            {s.hero.intro}
          </p>
          <div className={`settle ${styles.actions}`} style={stagger(3)}>
            <Button href={copy.primaryCta.href} arrow>
              {copy.primaryCta.label}
            </Button>
            <Button href={copy.pricingLink.href} variant="secondary">
              {copy.pricingLink.label}
            </Button>
          </div>
          <ul className={`settle ${styles.reassurances}`} style={stagger(4)}>
            {s.hero.reassurances.map((item) => (
              <li key={item}>
                <TbCheck aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* No entrance on the photo: it's usually the largest thing on screen, so it paints right away */}
        <div className={styles.art}>
          <span className={styles.facet} aria-hidden="true" />
          <span className={styles.photo}>
            <Image
              src={s.image.src}
              alt={s.image.alt}
              fill
              priority
              placeholder="blur"
              sizes="(min-width: 1080px) 560px, 100vw"
              className={styles.img}
            />
          </span>
          <span className={styles.badge}>
            <Icon aria-hidden="true" />
            {s.hero.badge}
          </span>
        </div>
      </div>
      <div className={styles.rule} aria-hidden="true" />
    </section>
  );
}
