import Image from "next/image";
import { TbArrowRight, TbCheck, TbQuote } from "react-icons/tb";
import { caseStudies, type CaseStudy } from "@/content/work";
import { BrowserFrame } from "./BrowserFrame";
import { DemoHeading } from "./DemoHeading";
import styles from "./CaseStudies.module.css";

/** Client work. Order in content/demo.ts: home care first, then senior care, then everything else. */
export function CaseStudies() {
  return (
    <section
      id="work"
      className={styles.section}
      aria-labelledby="work-heading"
    >
      <div className="container">
        <DemoHeading
          id="work-heading"
          eyebrow={caseStudies.eyebrow}
          heading={caseStudies.heading}
        >
          {caseStudies.intro}
        </DemoHeading>
        <div className={styles.list}>
          {caseStudies.items.map((cs, i) => (
            <CaseStudyCard key={cs.id} study={cs} reverse={i % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CaseStudyCard({
  study,
  reverse,
}: {
  study: CaseStudy;
  reverse: boolean;
}) {
  const headingId = `${study.id}-heading`;

  return (
    <article
      id={study.id}
      className={`${styles.card} ${study.featured ? styles.featured : ""} ${reverse ? styles.reverse : ""}`}
      aria-labelledby={headingId}
    >
      <div className={styles.media}>
        <BrowserFrame>
          <Image
            src={study.image.src}
            alt={study.image.alt}
            fill
            sizes="(min-width: 1080px) 560px, 100vw"
            style={{ objectFit: "cover" }}
          />
        </BrowserFrame>
      </div>

      <div className={styles.body}>
        <ul className={styles.badges}>
          {study.featured ? (
            <li className={styles.badgeFeatured}>Featured</li>
          ) : null}
          {study.badges.map((b, i) => (
            <li key={b} className={i === 0 ? styles.badgeMain : styles.badge}>
              {b}
            </li>
          ))}
        </ul>
        <h3 id={headingId} className={styles.name}>
          {study.name}
        </h3>
        <p className={styles.oneLine}>{study.oneLine}</p>

        <div className={styles.block}>
          <h4 className={styles.blockTitle}>What they needed</h4>
          <p className={styles.blockText}>{study.needed}</p>
        </div>

        <div className={styles.block}>
          <h4 className={styles.blockTitle}>What I built</h4>
          <ul className={styles.checks}>
            {study.built.map((b) => (
              <li key={b}>
                <TbCheck aria-hidden="true" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {study.results.length > 0 ? (
          <div className={styles.results}>
            <h4 className={styles.blockTitle}>What changed</h4>
            <ul>
              {study.results.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {study.quote ? (
          <figure className={styles.quote}>
            <TbQuote className={styles.quoteIcon} aria-hidden="true" />
            <blockquote>{study.quote.text}</blockquote>
            <figcaption>{study.quote.by}</figcaption>
          </figure>
        ) : null}

        {study.href ? (
          <a
            href={study.href}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.visit}
          >
            Visit the site
            <TbArrowRight aria-hidden="true" />
            <span className="visually-hidden">
              : {study.name} (opens in a new tab)
            </span>
          </a>
        ) : null}
      </div>
    </article>
  );
}
