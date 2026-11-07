import type { CSSProperties } from "react";
import type { IconType } from "react-icons";
import { TbArrowDown, TbChartBar, TbPhoneCall, TbSearch } from "react-icons/tb";
import { industriesHero, playbook } from "@/content/industries";
import { Thumb } from "@/components/blog/Thumb";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import type { IndustryView } from "./views";
import styles from "./IndustrySections.module.css";

/** Hero with six industry illustrations bobbing on the right. */
export function IndustriesHero({ tiles }: { tiles: IndustryView[] }) {
  return (
    <PageHero
      id="industries-hero-heading"
      eyebrow={industriesHero.eyebrow}
      headline={industriesHero.headline}
      body={industriesHero.body}
      art={
        tiles.length >= 3 ? (
          <div className={styles.tiles} aria-hidden="true">
            {tiles.slice(0, 6).map((t, i) => (
              <span key={t.id} className={styles.tile} style={{ "--i": i } as CSSProperties}>
                <Thumb image={t.image} sizes="180px" />
              </span>
            ))}
          </div>
        ) : undefined
      }
    >
      <a href="#industries" className={styles.jump}>
        {industriesHero.cta}
        <TbArrowDown aria-hidden="true" />
      </a>
    </PageHero>
  );
}

/** Every industry name on a slow teal ticker. Duplicated for a seamless loop; screen readers get the list once. */
export function IndustryMarquee({ names }: { names: string[] }) {
  if (names.length < 3) return null;
  return (
    <div className={styles.marquee}>
      <ul className="visually-hidden">
        {names.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
      <div className={styles.window} aria-hidden="true">
        <div className={styles.track}>
          {[...names, ...names].map((n, i) => (
            <span key={`${n}-${i}`} className={styles.item}>
              {n}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

const icons: Record<(typeof playbook.items)[number]["icon"], IconType> = {
  search: TbSearch,
  phone: TbPhoneCall,
  chart: TbChartBar,
};

/** "Different trades. Same three jobs." */
export function Playbook() {
  return (
    <section className={styles.playbook} aria-labelledby="playbook-heading">
      <div className="container">
        <header className={styles.header}>
          <Eyebrow>{playbook.eyebrow}</Eyebrow>
          <h2 id="playbook-heading" className={styles.heading}>
            {playbook.heading}
          </h2>
        </header>
        <ol className={styles.jobs}>
          {playbook.items.map((job, i) => {
            const Icon = icons[job.icon];
            return (
              <li key={job.title}>
                <Reveal className={styles.job} index={i}>
                  <span className={styles.icon} aria-hidden="true">
                    <Icon />
                  </span>
                  <h3 className={styles.jobTitle}>{job.title}</h3>
                  <p className={styles.jobBody}>{job.body}</p>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
