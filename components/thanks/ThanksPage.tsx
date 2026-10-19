import Link from "next/link";
import { Suspense, type CSSProperties } from "react";
import { TbArrowRight, TbCalendarCheck, TbMailCheck, TbRefresh } from "react-icons/tb";
import { thanks, type ThanksKind } from "@/content/thanks";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { BookingDetails } from "./BookingDetails";
import { ConversionPing } from "./ConversionPing";
import styles from "./ThanksPage.module.css";

const stagger = (i: number) => ({ "--i": i }) as CSSProperties;

/** One layout for both thank-you pages. Copy and the extra blocks come from content/thanks.ts. */
export function ThanksPage({ kind }: { kind: ThanksKind }) {
  const page = thanks[kind];
  const Icon = page.icon === "mail" ? TbMailCheck : TbCalendarCheck;

  return (
    <section className={styles.section} aria-labelledby="thanks-heading">
      <ConversionPing kind={kind} />
      <span className={styles.shardA} aria-hidden="true" />
      <span className={styles.shardB} aria-hidden="true" />

      <div className={`container ${styles.inner}`}>
        <div className={styles.card}>
          {/* A check that draws itself once, with one soft ring */}
          <div className={styles.badge} aria-hidden="true">
            <svg viewBox="0 0 52 52" className={styles.check}>
              <circle className={styles.circle} cx="26" cy="26" r="23" />
              <path className={styles.tick} d="M15 27l7 7 15-16" />
            </svg>
            <span className={styles.ring} />
          </div>

          <div className="settle" style={stagger(1)}>
            <Eyebrow align="center">{page.eyebrow}</Eyebrow>
          </div>
          <h1 id="thanks-heading" className={`settle ${styles.headline}`} style={stagger(2)}>
            {page.headline}
          </h1>
          <p className={`settle ${styles.body}`} style={stagger(3)}>
            <Icon aria-hidden="true" className={styles.bodyIcon} />
            {page.body}
          </p>

          {kind === "booked" ? (
            <Suspense fallback={null}>
              <BookingDetails />
            </Suspense>
          ) : null}
        </div>

        <div className={styles.steps}>
          <h2 className={styles.stepsHeading}>{page.stepsHeading}</h2>
          <ol>
            {page.steps.map((s, i) => (
              <li key={s.title} style={stagger(4 + i)} className="settle">
                <span className={styles.num} aria-hidden="true">
                  {i + 1}
                </span>
                <div>
                  <p className={styles.stepTitle}>{s.title}</p>
                  <p className={styles.stepBody}>{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {page.nudge ? (
          <div className={styles.nudge}>
            <div>
              <p className={styles.nudgeHeading}>{page.nudge.heading}</p>
              <p className={styles.nudgeBody}>{page.nudge.body}</p>
            </div>
            <Button href={page.nudge.href} arrow>
              {page.nudge.cta}
            </Button>
          </div>
        ) : null}

        {page.aside ? (
          <div className={styles.aside}>
            <TbRefresh aria-hidden="true" className={styles.asideIcon} />
            <div>
              <p className={styles.asideHeading}>{page.aside.heading}</p>
              <p className={styles.asideBody}>{page.aside.body}</p>
            </div>
          </div>
        ) : null}

        <nav className={styles.wait} aria-labelledby="wait-heading">
          <h2 id="wait-heading" className={styles.waitHeading}>
            {thanks.whileYouWait.heading}
          </h2>
          <ul>
            {thanks.whileYouWait.links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={styles.waitLink}>
                  <span className={styles.waitLabel}>
                    {l.label}
                    <TbArrowRight aria-hidden="true" />
                  </span>
                  <span className={styles.waitBody}>{l.body}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
