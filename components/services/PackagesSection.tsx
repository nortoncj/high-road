import Link from "next/link";
import { TbArrowRight, TbCheck, TbLanguage, TbStar } from "react-icons/tb";
import { packages, type Package } from "@/content/services";
import { site } from "@/content/home";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "./SectionHeader";
import styles from "./PackagesSection.module.css";

export function PackagesSection() {
  return (
    <section className={styles.section} aria-labelledby="packages-heading">
      <div className="container">
        <SectionHeader id="packages-heading" eyebrow={packages.eyebrow} heading={packages.heading} />

        <ul className={styles.cards}>
          {packages.items.map((pkg) => (
            <li key={pkg.name}>
              <PackageCard pkg={pkg} />
            </li>
          ))}
        </ul>

        <div className={styles.addons}>
          <div className={styles.addon}>
            <TbStar className={styles.addonIcon} aria-hidden="true" />
            <div>
              <p className={styles.addonTitle}>
                {packages.carePlan.title} <span className={styles.addonPrice}>{packages.carePlan.price}</span>
              </p>
              <p className={styles.addonBody}>{packages.carePlan.body}</p>
            </div>
          </div>
          <div className={styles.addon}>
            <TbLanguage className={styles.addonIcon} aria-hidden="true" />
            <div>
              <p className={styles.addonTitle}>
                {packages.spanish.title} <span className={styles.addonPrice}>{packages.spanish.price}</span>
              </p>
              <p className={styles.addonBody}>{packages.spanish.body}</p>
            </div>
          </div>
        </div>

        <Link href={packages.ctaHref} className={styles.more}>
          {packages.cta}
          <TbArrowRight aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

function PackageCard({ pkg }: { pkg: Package }) {
  return (
    <article className={`${styles.card} ${pkg.featured ? styles.featured : ""}`}>
      {pkg.featured ? <span className={styles.badge}>Most popular</span> : null}
      <h3 className={styles.name}>{pkg.name}</h3>
      <p className={styles.price}>{pkg.price}</p>
      <p className={styles.bestFor}>{pkg.bestFor}</p>
      <ul className={styles.includes}>
        {pkg.includes.map((line) => (
          <li key={line}>
            <TbCheck aria-hidden="true" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
      <Button href={site.bookHref} variant={pkg.featured ? "primary" : "secondary"} block className={styles.cardCta}>
        Book a free call
      </Button>
    </article>
  );
}
