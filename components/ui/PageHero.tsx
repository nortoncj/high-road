import type { CSSProperties, ReactNode } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./PageHero.module.css";

const stagger = (i: number) => ({ "--i": i }) as CSSProperties;

type PageHeroProps = {
  id: string;
  eyebrow: string;
  headline: string;
  body: string;
  /** Under the body, e.g. a button. */
  children?: ReactNode;
  /** Right column on desktop. Defaults to drifting facets. */
  art?: ReactNode;
  /** Above the eyebrow, e.g. breadcrumbs. */
  crumbs?: ReactNode;
};

/** Hero for /blog and the industry pages: the teal wash from /work, a coastal rule underneath, facets on the right. */
export function PageHero({ id, eyebrow, headline, body, children, art, crumbs }: PageHeroProps) {
  return (
    <section className={styles.hero} aria-labelledby={id}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.copy}>
          {crumbs ? <div className={styles.crumbs}>{crumbs}</div> : null}
          <div className="settle" style={stagger(0)}>
            <Eyebrow>{eyebrow}</Eyebrow>
          </div>
          <h1 id={id} className={`settle ${styles.headline}`} style={stagger(1)}>
            {headline}
          </h1>
          <p className={`settle ${styles.body}`} style={stagger(2)}>
            {body}
          </p>
          {children ? (
            <div className="settle" style={stagger(3)}>
              {children}
            </div>
          ) : null}
        </div>
        <div className={styles.art}>
          {art ?? (
            <div className={styles.facets} aria-hidden="true">
              <span className={`${styles.facet} ${styles.f1}`} />
              <span className={`${styles.facet} ${styles.f2}`} />
              <span className={`${styles.facet} ${styles.f3}`} />
              <span className={`${styles.facet} ${styles.f4}`} />
            </div>
          )}
        </div>
      </div>
      <div className={styles.rule} aria-hidden="true" />
    </section>
  );
}
