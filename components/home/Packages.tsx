"use client";

import { useState } from "react";
import { TbCheck } from "react-icons/tb";
import { packages, site } from "@/content/home";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./Packages.module.css";

/** Three fixed-price tiers. The switch adds the optional care plan line to each card. */
export function Packages() {
  const [care, setCare] = useState(false);

  return (
    <section id="packages" className={styles.section} aria-labelledby="packages-heading">
      <div className="container">
        <header className={styles.header}>
          <div className={styles.headerText}>
            <Eyebrow>{packages.eyebrow}</Eyebrow>
            <h2 id="packages-heading" className={styles.heading}>
              {packages.heading}
            </h2>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={care}
            className={styles.switch}
            onClick={() => setCare((v) => !v)}
          >
            <span className={styles.knob} aria-hidden="true" />
            {packages.careToggle}
          </button>
        </header>

        <ul className={styles.grid}>
          {packages.tiers.map((tier) => (
            <li key={tier.name} className={styles.card} data-featured={tier.featured ?? false}>
              <div className={styles.top}>
                <div>
                  <h3 className={styles.name}>{tier.name}</h3>
                  <p className={styles.blurb}>{tier.blurb}</p>
                </div>
                {tier.badge ? <span className={styles.badge}>{tier.badge}</span> : null}
              </div>
              <p className={styles.price}>
                {tier.price}
                <span className={styles.priceNote}> {tier.priceNote}</span>
              </p>
              <ul className={styles.features}>
                {tier.features.map((f) => (
                  <li key={f}>
                    <TbCheck aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
              {care ? <p className={styles.care}>{packages.careLine}</p> : null}
              <Button href={site.bookHref} block arrow={tier.featured} variant={tier.featured ? undefined : "secondary"} className={styles.cta}>
                {tier.cta}
              </Button>
            </li>
          ))}
        </ul>

        <p className={styles.note} aria-live="polite">
          {care ? packages.careOnNote : packages.careOffNote}
        </p>
      </div>
    </section>
  );
}
