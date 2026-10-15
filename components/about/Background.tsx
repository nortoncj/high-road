import Image from "next/image";
import type { IconType } from "react-icons";
import { TbBuildingStore, TbCircleCheck, TbTargetArrow } from "react-icons/tb";
import { background } from "@/content/about";
import { AboutHeading } from "./AboutHeading";
import styles from "./Background.module.css";

type MeansIcon = (typeof background.means)[number]["icon"];

const icons: Record<MeansIcon, IconType> = {
  works: TbCircleCheck,
  sells: TbTargetArrow,
  real: TbBuildingStore,
};

export function Background() {
  return (
    <section className={styles.section} aria-labelledby="background-heading">
      <div className={`container ${styles.grid}`}>
        <div className={styles.copy}>
          <AboutHeading id="background-heading" eyebrow={background.eyebrow} heading={background.heading} />
          <div className={styles.body}>
            {background.paragraphs.map((p) => (
              <p key={p.slice(0, 32)}>{p}</p>
            ))}
          </div>
        </div>

        <div className={styles.media}>
          <div className={styles.photo}>
            <Image
              src={background.photo.src}
              alt={background.photo.alt}
              fill
              sizes="(min-width: 1080px) 460px, 100vw"
              className={styles.photoImg}
            />
          </div>
        </div>
      </div>

      <div className="container">
        <h3 className={styles.meansHeading}>{background.meansHeading}</h3>
        <ul className={styles.means}>
          {background.means.map((m) => {
            const Icon = icons[m.icon];
            return (
              <li key={m.title} className={styles.mean}>
                <span className={styles.iconTile} aria-hidden="true">
                  <Icon />
                </span>
                <div>
                  <p className={styles.meanTitle}>{m.title}</p>
                  <p className={styles.meanBody}>{m.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
