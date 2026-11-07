import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./CtaBand.module.css";

type Cta = { label: string; href: string };

type CtaBandProps = {
  id: string;
  eyebrow: string;
  heading: string;
  body: string;
  primaryCta: Cta;
  secondaryCta?: Cta;
  /** "teal" is the page-ending call to action. "soft" is a quieter sand panel for a side door. */
  variant?: "teal" | "soft";
  /** Extra content beside the copy, e.g. a share panel. Replaces the buttons column. */
  aside?: ReactNode;
};

/** The closing call to action on the Sanity-backed pages. Same coastal band as /work. */
export function CtaBand({ id, eyebrow, heading, body, primaryCta, secondaryCta, variant = "teal", aside }: CtaBandProps) {
  const headingId = `${id}-heading`;
  return (
    <section id={id} className={styles.section} aria-labelledby={headingId}>
      <div className="container">
        <div className={`${styles.band} ${styles[variant]}`}>
          {variant === "soft" ? <span className={styles.stripes} aria-hidden="true" /> : null}
          <div className={styles.copy}>
            <Eyebrow>{eyebrow}</Eyebrow>
            <h2 id={headingId} className={styles.heading}>
              {heading}
            </h2>
            <p className={styles.body}>{body}</p>
            {aside ? (
              <div className={styles.inlineActions}>
                <Button href={primaryCta.href} arrow className={styles.solid}>
                  {primaryCta.label}
                </Button>
                {secondaryCta ? (
                  <Button href={secondaryCta.href} variant="quiet" className={styles.quiet}>
                    {secondaryCta.label}
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
          {aside ?? (
            <div className={styles.actions}>
              <Button href={primaryCta.href} arrow block variant={variant === "soft" ? "secondary" : "primary"} className={styles.solid}>
                {primaryCta.label}
              </Button>
              {secondaryCta ? (
                <Button href={secondaryCta.href} variant="secondary" block className={styles.ghost}>
                  {secondaryCta.label}
                </Button>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
