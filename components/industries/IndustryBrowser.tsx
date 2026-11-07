"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { TbArrowRight, TbCheck } from "react-icons/tb";
import { industryBrowser as copy } from "@/content/industries";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Thumb } from "@/components/blog/Thumb";
import type { IndustryGroup } from "@/lib/sanity/types";
import type { IndustryView } from "./views";
import styles from "./IndustryBrowser.module.css";

type Filter = "all" | "client" | IndustryGroup;

const matches = (it: IndustryView, f: Filter) => f === "all" || (f === "client" ? it.clientWork : it.group === f);

/** Industry cards with group chips. Every card stays in the HTML; filtering only hides them. */
export function IndustryBrowser({ industries }: { industries: IndustryView[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const groups = (Object.keys(copy.groups) as IndustryGroup[]).filter((g) => industries.some((i) => i.group === g));
  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: copy.all },
    ...(industries.some((i) => i.clientWork) ? [{ id: "client" as const, label: copy.clientWork }] : []),
    ...groups.map((g) => ({ id: g, label: copy.groups[g] })),
  ];
  const visible = industries.filter((i) => matches(i, filter));

  return (
    <section id="industries" className={styles.section} aria-labelledby="industries-heading">
      <div className="container">
        <header className={styles.header}>
          <div className={styles.titles}>
            <Eyebrow>{copy.eyebrow}</Eyebrow>
            <h2 id="industries-heading" className={styles.heading}>
              {copy.heading}
            </h2>
          </div>
          <p className={styles.status} aria-live="polite">
            {copy.showing(visible.length, industries.length)}
          </p>
        </header>

        <div className={styles.chips} role="group" aria-label={copy.filterLabel}>
          {filters.map((f) => (
            <button key={f.id} type="button" className={styles.chip} aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.label}
              <span className={styles.count}>{industries.filter((i) => matches(i, f.id)).length}</span>
            </button>
          ))}
        </div>

        <ul className={styles.grid}>
          {visible.map((it, i) => (
            <li key={it.id} id={it.slug} className="settle" style={{ "--i": i % 8 } as CSSProperties}>
              <Link href={it.href} className={styles.card}>
                <span className={styles.media}>
                  <Thumb image={it.image} sizes="(min-width: 1080px) 300px, (min-width: 640px) 50vw, 100vw" />
                  {it.clientWork ? (
                    <span className={styles.client}>
                      <TbCheck aria-hidden="true" />
                      {copy.clientWork}
                    </span>
                  ) : null}
                </span>
                <span className={styles.body}>
                  <h3 className={styles.name}>{it.name}</h3>
                  {it.line ? <span className={styles.line}>{it.line}</span> : null}
                  <span className={styles.go} aria-hidden="true">
                    {it.linkLabel}
                    <TbArrowRight />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
