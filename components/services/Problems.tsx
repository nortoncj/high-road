import Image from "next/image";
import type { CSSProperties, JSX } from "react";
import type { IconType } from "react-icons";
import {
  TbBolt,
  TbChartLine,
  TbCheck,
  TbLock,
  TbMessageCircle,
  TbPhoneCall,
  TbQuote,
  TbSend,
  TbSparkles,
} from "react-icons/tb";
import { problems, type Problem } from "@/content/services/website-design";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { ctaBg } from "@img/home";
import styles from "./Problems.module.css";

const icons: Record<Problem["icon"], IconType> = {
  bolt: TbBolt,
  sparkles: TbSparkles,
  chart: TbChartLine,
};

const visuals: Record<Problem["visual"], () => JSX.Element> = {
  alerts: Alerts,
  makeover: Makeover,
  report: Report,
};

/** The three leaks: a picture of the fix, the owner's pain in one line, and what the site does about it. */
export function Problems() {
  return (
    <section className={styles.section} aria-labelledby="problems-heading">
      <div className="container">
        <header className={styles.header}>
          <Eyebrow>{problems.eyebrow}</Eyebrow>
          <h2 id="problems-heading" className={styles.heading}>
            {problems.heading}
          </h2>
        </header>

        <ol className={styles.list}>
          {problems.items.map((p) => {
            const Icon = icons[p.icon];
            const Visual = visuals[p.visual];
            const headingId = `problem-${p.number}`;
            return (
              <li key={p.number} className={styles.item} aria-labelledby={headingId}>
                <Reveal className={styles.visual}>
                  <Visual />
                </Reveal>

                <div className={styles.story}>
                  <div className={styles.top}>
                    <span className={styles.number} aria-hidden="true">
                      {p.number}
                    </span>
                    <Icon className={styles.icon} aria-hidden="true" />
                  </div>
                  <h3 id={headingId} className={styles.title}>
                    {p.title}
                  </h3>
                  <figure className={styles.voice}>
                    <figcaption className={styles.voiceLabel}>
                      <TbQuote aria-hidden="true" />
                      {problems.voiceLabel}
                    </figcaption>
                    <blockquote>{p.voice}</blockquote>
                  </figure>
                  <div>
                    <p className={styles.fixesTitle}>{problems.fixesLabel}</p>
                    <ul className={styles.fixes}>
                      {p.fixes.map((f) => (
                        <li key={f}>
                          <span className={styles.tick} aria-hidden="true">
                            <TbCheck />
                          </span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <p className={styles.honesty}>{problems.honesty}</p>
      </div>
    </section>
  );
}

/* ---------- Mockups. Decorative, so hidden from screen readers; the list beside each says it in words. ---------- */

const noteIcons = [TbMessageCircle, TbSend];

/** A phone on the lock screen as the lead lands. */
function Alerts() {
  return (
    <div className={styles.stage} aria-hidden="true">
      <div className={styles.phone}>
        <div className={styles.screen}>
          <Image src={ctaBg} alt="" fill sizes="280px" className={styles.wallpaper} />
          <div className={styles.lock}>
            <TbLock />
            <span className={styles.clock}>2:14</span>
            <span className={styles.date}>Friday, October 17</span>
          </div>
          <ul className={styles.notes}>
            {problems.mock.notifications.map((n, i) => {
              const Icon = noteIcons[i % noteIcons.length];
              return (
                <li key={n.title} className={styles.note} style={{ "--n": i } as CSSProperties}>
                  <span className={styles.noteIcon}>
                    <Icon />
                  </span>
                  <span className={styles.noteText}>
                    <span className={styles.noteApp}>
                      {n.app}
                      <span>now</span>
                    </span>
                    <strong>{n.title}</strong>
                    <span>{n.body}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <span className={styles.callChip}>
        <TbPhoneCall />
        Tap to call
      </span>
    </div>
  );
}

/** A dated DIY page behind a real site I built. */
function Makeover() {
  const { before, after } = problems.mock;
  return (
    <div className={`${styles.stage} ${styles.makeover}`} aria-hidden="true">
      <div className={styles.before}>
        <span className={styles.tag}>{before.label}</span>
        <div className={styles.oldBar}>
          <span>HOME</span>
          <span>ABOUT US</span>
          <span>SERVICES</span>
          <span>CONTACT</span>
        </div>
        <div className={styles.oldBody}>
          <p className={styles.oldTitle}>{before.title}</p>
          <span className={styles.oldImg} />
          <p className={styles.oldText}>{before.body}</p>
          <span className={styles.oldLines} />
        </div>
      </div>

      <div className={styles.after}>
        <span className={`${styles.tag} ${styles.tagAfter}`}>{after.label}</span>
        <div className={styles.browserBar}>
          <span className={styles.dots}>
            <span />
            <span />
            <span />
          </span>
          <span className={styles.address}>
            <TbLock />
            {new URL(after.project.href).hostname.replace(/^www\./, "")}
          </span>
        </div>
        <div className={styles.shotWrap}>
          <Image
            src={after.project.image.src}
            alt=""
            fill
            sizes="(min-width: 1080px) 440px, 90vw"
            className={styles.shot}
          />
        </div>
      </div>
    </div>
  );
}

/** A slice of the monthly report: where the leads came from. */
function Report() {
  const { report } = problems.mock;
  const max = Math.max(...report.sources.map((s) => s.value));
  return (
    <div className={styles.stage} aria-hidden="true">
      <div className={styles.report}>
        <div className={styles.reportTop}>
          <span className={styles.reportTitle}>{report.title}</span>
          <span className={styles.example}>{report.note}</span>
        </div>
        <p className={styles.reportTotal}>{report.total}</p>
        <ul className={styles.bars}>
          {report.sources.map((s, i) => (
            <li key={s.name} style={{ "--w": `${(s.value / max) * 100}%`, "--n": i } as CSSProperties}>
              <span className={styles.barLabel}>
                {s.name}
                <strong>{s.value}</strong>
              </span>
              <span className={styles.barTrack}>
                <span className={styles.barFill} data-series={i} />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
