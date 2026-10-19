import { TbArrowUpRight, TbCheck, TbHeart, TbTrendingUp } from "react-icons/tb";
import { caseStudies, labels, type CaseStudy } from "@/content/work";
import { DeviceShowcase } from "./DeviceShowcase";
import styles from "./CaseStudies.module.css";

/** Every case study, alternating devices left and right on desktop. */
export function CaseStudies() {
  return (
    <section className={styles.section} aria-label="Case studies">
      <div className="container">
        <ol className={styles.list}>
          {caseStudies.map((s, i) => (
            <li key={s.slug} id={s.slug} className={styles.item} data-flip={i % 2 === 1}>
              <Study study={s} index={i} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Study({ study: s, index }: { study: CaseStudy; index: number }) {
  const headingId = `${s.slug}-heading`;
  return (
    <article className={styles.study} aria-labelledby={headingId}>
      <div className={`${styles.media} ${styles.reveal}`}>
        <DeviceShowcase study={s} />
      </div>

      <div className={`${styles.copy} ${styles.reveal}`}>
        <div className={styles.top}>
          <span className={styles.index} aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
          {s.badge ? (
            <span className={styles.badge}>
              <TbHeart aria-hidden="true" />
              {s.badge}
            </span>
          ) : null}
        </div>

        <div>
          <h2 id={headingId} className={styles.name}>
            {s.name}
          </h2>
          <ul className={styles.meta}>
            {s.meta.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>

        <div className={styles.block}>
          <h3 className={styles.label}>{labels.problem}</h3>
          <p className={styles.problem}>{s.problem}</p>
        </div>

        <div className={styles.block}>
          <h3 className={styles.label}>{labels.built}</h3>
          <ul className={styles.built}>
            {s.built.map((b) => (
              <li key={b}>
                <TbCheck aria-hidden="true" />
                {b}
              </li>
            ))}
          </ul>
        </div>

        {s.result ? (
          <div className={styles.result}>
            <TbTrendingUp className={styles.resultIcon} aria-hidden="true" />
            <div>
              <h3 className={styles.label}>{labels.result}</h3>
              <p className={styles.resultText}>{s.result}</p>
            </div>
          </div>
        ) : null}

        {s.href ? (
          <a href={s.href} className={styles.link} target="_blank" rel="noopener noreferrer">
            {labels.view}
            <TbArrowUpRight aria-hidden="true" />
            <span className="visually-hidden">: {s.name} (opens in a new tab)</span>
          </a>
        ) : null}
      </div>
    </article>
  );
}
