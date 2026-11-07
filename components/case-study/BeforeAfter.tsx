"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";
import { TbBrowser, TbCheck, TbExclamationMark } from "react-icons/tb";
import { caseStudyPage } from "@/content/case-study";
import type { Img } from "@/lib/sanity/image";
import styles from "./CaseStudy.module.css";

const copy = caseStudyPage.problem;

type Row = { key: string; label: string; before: string | null; after: string | null };

/** The before/after toggle: the same five things, broken then fixed, with a screenshot of each site. */
export function BeforeAfter({ rows, beforeImage, afterImage }: { rows: Row[]; beforeImage: Img | null; afterImage: Img | null }) {
  const [view, setView] = useState<"before" | "after">("before");
  const after = view === "after";
  const shot = after ? afterImage : beforeImage;

  return (
    <>
      <div className={styles.segment} role="group" aria-label={copy.toggleLabel}>
        <button type="button" aria-pressed={!after} onClick={() => setView("before")}>
          {copy.before}
        </button>
        <button type="button" aria-pressed={after} onClick={() => setView("after")}>
          {copy.after}
        </button>
      </div>

      <div className={styles.compare}>
        <ul className={styles.rows} aria-live="polite">
          {rows.map((r, i) => (
            <li key={`${view}-${r.key}`} className={styles.row} style={{ "--i": i } as CSSProperties} data-state={view}>
              <span className={styles.glyph} aria-hidden="true">
                {after ? <TbCheck /> : <TbExclamationMark />}
              </span>
              <span>
                <span className={styles.rowLabel}>{r.label}</span>
                <span className={styles.rowText}>{after ? r.after : r.before}</span>
              </span>
            </li>
          ))}
        </ul>

        <figure className={styles.shot} key={view}>
          {shot ? (
            <Image
              src={shot.src}
              alt={shot.alt}
              width={shot.width}
              height={shot.height}
              sizes="(min-width: 1080px) 520px, 100vw"
              className={styles.shotImg}
            />
          ) : (
            <span className={styles.shotEmpty}>
              <TbBrowser aria-hidden="true" />
            </span>
          )}
          <figcaption>{after ? copy.shotAfter : copy.shotBefore}</figcaption>
        </figure>
      </div>
    </>
  );
}
