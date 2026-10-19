"use client";

import { useState } from "react";
import { TbCheck } from "react-icons/tb";
import { packageHref, packages, usd, type Billing } from "@/content/pricing";
import { Button } from "@/components/ui/Button";
import styles from "./PackageCards.module.css";

/** The three packages, with a pay once / pay monthly switch that swaps every price at once. */
export function PackageCards() {
  const [billing, setBilling] = useState<Billing>("once");

  return (
    <section id="packages" className={styles.section} aria-labelledby="packages-heading">
      <div className="container">
        <header className={styles.header}>
          <h2 id="packages-heading" className={styles.heading}>
            {packages.heading}
          </h2>
          <div className={styles.toggle} role="group" aria-label="Billing">
            {(["once", "monthly"] as const).map((b) => (
              <button
                key={b}
                type="button"
                className={styles.toggleBtn}
                aria-pressed={billing === b}
                onClick={() => setBilling(b)}
              >
                {packages.toggle[b]}
              </button>
            ))}
            <span className={styles.toggleThumb} data-pos={billing} aria-hidden="true" />
          </div>
        </header>

        <ul className={styles.grid}>
          {packages.items.map((p) => (
            <li key={p.id} className={styles.card} data-featured={p.featured ?? false}>
              <div className={styles.top}>
                <h3 className={styles.name}>{p.name}</h3>
                {p.badge ? <span className={styles.badge}>{p.badge}</span> : null}
              </div>

              <div className={styles.priceBlock} aria-live="polite">
                {billing === "once" ? (
                  <p key="once" className={styles.price}>
                    {usd(p.once)}
                    <span className={styles.per}> one time</span>
                  </p>
                ) : (
                  <p key="monthly" className={styles.price}>
                    {usd(p.monthly)}
                    <span className={styles.per}>/month for {p.months} months</span>
                  </p>
                )}
                <p className={styles.alt}>
                  {billing === "once"
                    ? `or ${usd(p.monthly)}/month for ${p.months} months`
                    : `or ${usd(p.once)} once. Handled care plan included.`}
                </p>
              </div>

              <p className={styles.blurb}>{p.blurb}</p>

              <ul className={styles.features}>
                {p.features.map((f) => (
                  <li key={f}>
                    <TbCheck aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                href={packageHref(p.id, billing)}
                block
                arrow={p.featured}
                variant={p.featured ? undefined : "secondary"}
                className={styles.cta}
              >
                {p.cta}
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
