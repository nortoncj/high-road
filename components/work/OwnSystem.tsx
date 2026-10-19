import Link from "next/link";
import type { CSSProperties } from "react";
import { TbArrowRight, TbCheck } from "react-icons/tb";
import { ownSystem } from "@/content/work";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./OwnSystem.module.css";

/** The agency's own lead system, shown as a live-looking pipeline board on a dark band. */
export function OwnSystem() {
  const { board } = ownSystem;
  return (
    <section id="own-system" className={styles.section} aria-labelledby="own-heading">
      <div className={`container ${styles.grid}`}>
        <div className={styles.copy}>
          <Eyebrow>{ownSystem.eyebrow}</Eyebrow>
          <div>
            <h2 id="own-heading" className={styles.name}>
              {ownSystem.name}
            </h2>
            <ul className={styles.meta}>
              {ownSystem.meta.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>
          <p className={styles.intro}>{ownSystem.intro}</p>
          <ul className={styles.built}>
            {ownSystem.built.map((b) => (
              <li key={b}>
                <TbCheck aria-hidden="true" />
                {b}
              </li>
            ))}
          </ul>
          <p className={styles.try}>{ownSystem.tryIt.label}</p>
          <Link href={ownSystem.tryIt.href} className={styles.tryLink}>
            {ownSystem.tryIt.cta}
            <TbArrowRight aria-hidden="true" />
          </Link>
        </div>

        <figure className={styles.board} aria-label={`${board.label}, ${board.note}`}>
          <figcaption className={styles.boardTop}>
            <span className={styles.boardLabel}>
              <span className={styles.live} aria-hidden="true" />
              {board.label}
            </span>
            <span className={styles.note}>{board.note}</span>
          </figcaption>
          <div className={styles.columns}>
            {board.columns.map((col) => (
              <div key={col.id} className={styles.column} data-col={col.id}>
                <p className={styles.colTitle}>
                  {col.title}
                  <span className={styles.count}>{col.cards.length}</span>
                </p>
                <ul>
                  {col.cards.map((c, i) => (
                    <li
                      key={c.name}
                      className={styles.card}
                      data-fresh={col.id === "new" && i === 0}
                      style={{ "--n": i } as CSSProperties}
                    >
                      <span className={styles.cardName}>{c.name}</span>
                      <span className={styles.cardMeta}>{c.meta}</span>
                      <span className={styles.cardTime}>{c.time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </figure>
      </div>
    </section>
  );
}
