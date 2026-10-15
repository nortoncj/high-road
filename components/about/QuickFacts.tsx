import type { IconType } from "react-icons";
import { TbCertificate, TbCode, TbExternalLink, TbLanguage, TbMapPin, TbSchool, TbWorld } from "react-icons/tb";
import { quickFacts } from "@/content/about";
import { AboutHeading } from "./AboutHeading";
import styles from "./QuickFacts.module.css";

type FactIcon = (typeof quickFacts.facts)[number]["icon"];

const icons: Record<FactIcon, IconType> = {
  pin: TbMapPin,
  world: TbWorld,
  language: TbLanguage,
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
          <AboutHeading id="facts-heading" eyebrow={quickFacts.eyebrow} heading={quickFacts.heading} />
          <dl className={styles.facts}>
            {quickFacts.facts.map((f) => {
              const Icon = icons[f.icon];
              return (
                <div key={f.label} className={styles.fact}>
                  <dt>
                    <Icon aria-hidden="true" />
                    {f.label}
                  </dt>
                  <dd>{f.value}</dd>
                </div>
              );
            })}
          </dl>
        </div>

        <aside className={styles.portfolio} aria-labelledby="portfolio-heading">
          <h3 id="portfolio-heading" className={styles.portfolioHeading}>
            {portfolio.heading}
          </h3>
          <p className={styles.portfolioBody}>{portfolio.body}</p>
          {/* Opens in a new tab so owners don't lose your site */}
          <a href={portfolio.href} target="_blank" rel="noopener noreferrer" className={styles.portfolioLink}>
            {portfolio.linkText}
            <TbExternalLink aria-hidden="true" />
            <span className="visually-hidden"> (opens in a new tab)</span>
          </a>
        </aside>
      </div>
    </section>
  );
}
