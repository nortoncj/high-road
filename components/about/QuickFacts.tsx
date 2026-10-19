import type { IconType } from "react-icons";
import { TbArrowUpRight, TbCertificate, TbCode, TbMapPin, TbSchool, TbWorld } from "react-icons/tb";
import { quickFacts } from "@/content/about";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./QuickFacts.module.css";

const icons: Record<(typeof quickFacts.facts)[number]["icon"], IconType> = {
  pin: TbMapPin,
  world: TbWorld,
  school: TbSchool,
  cert: TbCertificate,
  code: TbCode,
};

export function QuickFacts() {
  const { portfolio } = quickFacts;
  return (
    <section className={styles.section} aria-labelledby="facts-heading">
      <div className={`container ${styles.grid}`}>
        <div className={styles.factsCol}>
          <header className={styles.header}>
            <Eyebrow>{quickFacts.eyebrow}</Eyebrow>
            <h2 id="facts-heading" className={styles.heading}>
              {quickFacts.heading}
            </h2>
          </header>
          <dl className={styles.facts}>
            {quickFacts.facts.map((f) => {
              const Icon = icons[f.icon];
              return (
                <div key={f.label} className={styles.fact}>
                  <Icon className={styles.icon} aria-hidden="true" />
                  <dt>{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              );
            })}
          </dl>
        </div>

        <aside className={styles.portfolio} aria-labelledby="portfolio-heading">
          <span className={styles.code} aria-hidden="true">
            {"</>"}
          </span>
          <h3 id="portfolio-heading" className={styles.pHeading}>
            {portfolio.heading}
          </h3>
          <p className={styles.pBody}>{portfolio.body}</p>
          <a href={portfolio.href} className={styles.pLink} target="_blank" rel="noopener noreferrer">
            {portfolio.linkText}
            <TbArrowUpRight aria-hidden="true" />
            <span className="visually-hidden"> (opens in a new tab)</span>
          </a>
        </aside>
      </div>
    </section>
  );
}
