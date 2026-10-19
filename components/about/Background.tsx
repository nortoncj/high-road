import Image from "next/image";
import type { IconType } from "react-icons";
import {
  TbBolt,
  TbChecks,
  TbHeartHandshake,
  TbMessageDollar,
  TbRocket,
  TbSchool,
  TbSpeakerphone,
  TbTemperature,
} from "react-icons/tb";
import { background, type TimelineStep } from "@/content/about";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./Background.module.css";

const stepIcons: Record<TimelineStep["icon"], IconType> = {
  school: TbSchool,
  hvac: TbTemperature,
  megaphone: TbSpeakerphone,
  rocket: TbRocket,
  bolt: TbBolt,
};

const meansIcons: Record<(typeof background.means)[number]["icon"], IconType> = {
  works: TbChecks,
  sells: TbMessageDollar,
  real: TbHeartHandshake,
};

/** Career as a timeline beside a working photo, then what it means for the client. */
export function Background() {
  return (
    <section className={styles.section} aria-labelledby="background-heading">
      <div className="container">
        <header className={styles.header}>
          <Eyebrow>{background.eyebrow}</Eyebrow>
          <h2 id="background-heading" className={styles.heading}>
            {background.heading}
          </h2>
        </header>

        <div className={styles.grid}>
          <ol className={styles.timeline}>
            {background.timeline.map((step) => {
              const Icon = stepIcons[step.icon];
              return (
                <li key={step.label} className={styles.step}>
                  <span className={styles.node} aria-hidden="true">
                    <Icon />
                  </span>
                  <div className={styles.stepBody}>
                    <h3 className={styles.stepLabel}>{step.label}</h3>
                    <p>{step.body}</p>
                  </div>
                </li>
              );
            })}
          </ol>

          <figure className={styles.photoWrap}>
            <div className={styles.photo}>
              <Image
                src={background.photo.src}
                alt={background.photo.alt}
                fill
                sizes="(min-width: 1080px) 420px, 92vw"
                className={styles.img}
              />
            </div>
          </figure>
        </div>

        <div className={styles.means}>
          <h3 className={styles.meansHeading}>{background.meansHeading}</h3>
          <ul className={styles.meansGrid}>
            {background.means.map((m) => {
              const Icon = meansIcons[m.icon];
              return (
                <li key={m.title} className={styles.mean}>
                  <span className={styles.meanIcon} aria-hidden="true">
                    <Icon />
                  </span>
                  <p className={styles.meanTitle}>{m.title}</p>
                  <p className={styles.meanBody}>{m.body}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
