"use client";

import { useId, useState, type ChangeEvent } from "react";
import { leadMath, site } from "@/content/home";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./LeadMath.module.css";

type Key = keyof typeof leadMath.sliders;

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/** The visitor's own numbers: what buying shared leads costs them in a year. Nothing leaves the page. */
export function LeadMath() {
  const id = useId();
  const s = leadMath.sliders;
  const [vals, setVals] = useState<Record<Key, number>>({
    leads: s.leads.initial,
    cost: s.cost.initial,
    shared: s.shared.initial,
  });

  const yearly = vals.leads * vals.cost * 12;
  const others = vals.shared - 1;
  const sharedNote =
    others === 0
      ? "And at least nobody else got the same lead."
      : `And ${others} other ${others === 1 ? "company" : "companies"} got every one of those leads too.`;

  const set = (key: Key) => (e: ChangeEvent<HTMLInputElement>) =>
    setVals((v) => ({ ...v, [key]: Number(e.target.value) }));

  const rows: { key: Key; display: string }[] = [
    { key: "leads", display: String(vals.leads) },
    { key: "cost", display: money(vals.cost) },
    { key: "shared", display: String(vals.shared) },
  ];

  return (
    <section className={styles.section} aria-labelledby="math-heading">
      <div className={`container ${styles.grid}`}>
        <div className={styles.left}>
          <header className={styles.header}>
            <Eyebrow>{leadMath.eyebrow}</Eyebrow>
            <h2 id="math-heading" className={styles.heading}>
              {leadMath.heading}
            </h2>
            <p className={styles.lead}>{leadMath.body}</p>
          </header>

          <div className={styles.panel}>
            {rows.map(({ key, display }) => {
              const cfg = s[key];
              const inputId = `${id}-${key}`;
              return (
                <div key={key} className={styles.row}>
                  <label htmlFor={inputId} className={styles.label}>
                    {cfg.label}
                    <output htmlFor={inputId} className={styles.value}>
                      {display}
                    </output>
                  </label>
                  <input
                    id={inputId}
                    className={styles.range}
                    type="range"
                    min={cfg.min}
                    max={cfg.max}
                    step={cfg.step}
                    value={vals[key]}
                    onChange={set(key)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.result} aria-live="polite">
            <p className={styles.resultLabel}>{leadMath.resultLabel}</p>
            <p key={yearly} className={styles.resultValue}>
              {money(yearly)}
            </p>
            <p className={styles.resultNote}>{sharedNote}</p>
          </div>
          <p className={styles.footnote}>{leadMath.footnote}</p>
          <Button href={site.bookHref} arrow className={styles.cta}>
            {leadMath.cta}
          </Button>
        </div>
      </div>
    </section>
  );
}
