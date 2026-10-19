import Image from "next/image";
import { TbMouse } from "react-icons/tb";
import { labels, type CaseStudy } from "@/content/work";
import styles from "./DeviceShowcase.module.css";

const host = (href?: string) => {
  if (!href) return "";
  try {
    return new URL(href).host.replace(/^www\./, "");
  } catch {
    return "";
  }
};

/**
 * A browser window with the desktop screenshot and a phone with the mobile one, overlapping.
 * Hover or focus a screen and the full-page screenshot scrolls top to bottom. Pure CSS.
 */
export function DeviceShowcase({ study }: { study: CaseStudy }) {
  const domain = host(study.href);
  const { desktop, mobile } = study;
  // A one-screen thumbnail has nothing to scroll, so it gets no hover hint or scroll cursor
  const scrolls = desktop.height / desktop.width > 1;
  return (
    <div className={styles.stage} data-tint={study.tint} data-phone={mobile ? undefined : "none"}>
      <figure className={styles.browser}>
        <div className={styles.bar} aria-hidden="true">
          <span className={styles.dots}>
            <i />
            <i />
            <i />
          </span>
          <span className={styles.url}>{domain || study.name}</span>
        </div>
        <div
          className={styles.screen}
          data-scrolls={scrolls || undefined}
          tabIndex={scrolls ? 0 : undefined}
          aria-label={scrolls ? `${desktop.alt}. ${labels.hoverHint}.` : undefined}
        >
          <Image
            src={desktop.src}
            alt={desktop.alt}
            width={desktop.width}
            height={desktop.height}
            sizes="(min-width: 1080px) 640px, 92vw"
            className={styles.shot}
          />
        </div>
        <figcaption className="visually-hidden">
          {study.name}, {labels.desktop}
        </figcaption>
      </figure>

      {mobile ? (
        <figure className={styles.phone}>
          <div className={styles.phoneScreen} tabIndex={0} aria-label={`${mobile.alt}. ${labels.hoverHint}.`}>
            <Image
              src={mobile.src}
              alt={mobile.alt}
              width={mobile.width}
              height={mobile.height}
              sizes="200px"
              className={styles.shot}
            />
          </div>
          <figcaption className="visually-hidden">
            {study.name}, {labels.mobile}
          </figcaption>
        </figure>
      ) : null}

      {scrolls || mobile ? (
        <span className={styles.hint} aria-hidden="true">
          <TbMouse />
          {labels.hoverHint}
        </span>
      ) : null}
    </div>
  );
}
