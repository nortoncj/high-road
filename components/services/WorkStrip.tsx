import Image from "next/image";
import Link from "next/link";
import { TbArrowRight, TbLock } from "react-icons/tb";
import { work } from "@/content/services/website-design";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import styles from "./WorkStrip.module.css";

const host = (href: string) => new URL(href).hostname.replace(/^www\./, "");

/** Proof before pitch: real client sites in browser frames, right under the hero. */
export function WorkStrip() {
  return (
    <section className={styles.section} aria-labelledby="work-strip-heading">
      <div className="container">
        <header className={styles.header}>
          <div className={styles.headerText}>
            <Eyebrow>{work.eyebrow}</Eyebrow>
            <h2 id="work-strip-heading" className={styles.heading}>
              {work.heading}
            </h2>
          </div>
          <Link href={work.link.href} className={styles.more}>
            {work.link.label}
            <TbArrowRight aria-hidden="true" />
          </Link>
        </header>

        <ul className={styles.grid}>
          {work.projects.map((p, i) => (
            <li key={p.name}>
              <Reveal className={styles.reveal} index={i}>
                <a href={p.href} className={styles.card} target="_blank" rel="noopener noreferrer">
                  <div className={styles.browser}>
                    <div className={styles.bar} aria-hidden="true">
                      <span className={styles.dots}>
                        <span />
                        <span />
                        <span />
                      </span>
                      <span className={styles.address}>
                        <TbLock />
                        <span className={styles.host}>{host(p.href)}</span>
                      </span>
                    </div>
                    <div className={styles.view}>
                      <Image
                        src={p.image.src}
                        alt={p.image.alt}
                        fill
                        sizes="(min-width: 1080px) 290px, 50vw"
                        className={styles.shot}
                      />
                    </div>
                  </div>
                  <span className={styles.name}>{p.name}</span>
                  <span className={styles.industry}>{p.industry}</span>
                  <span className="visually-hidden"> (opens in a new tab)</span>
                </a>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
