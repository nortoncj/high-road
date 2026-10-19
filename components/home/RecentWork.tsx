import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { TbArrowRight, TbArrowUpRight, TbHeart, TbLock, TbSparkles } from "react-icons/tb";
import { recentWork, type FeaturedProject, type Project } from "@/content/home";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import styles from "./RecentWork.module.css";

const isExternal = (href: string) => /^https?:\/\//.test(href);
const host = (href: string) =>
  isExternal(href) ? new URL(href).hostname.replace(/^www\./, "") : href;
const newTab = (href: string) =>
  isExternal(href) ? { target: "_blank", rel: "noopener noreferrer" } : {};

/**
 * Featured project up top, then a grid of cards. Each screenshot sits in a small browser frame
 * and "loads" (wipes in top to bottom) as it scrolls into view; on hover it zooms and offers a
 * visit link.
 */
export function RecentWork() {
  return (
    <section className={styles.section} aria-labelledby="work-heading">
      <div className={`container ${styles.inner}`}>
        <header className={styles.header}>
          <div className={styles.headerText}>
            <Eyebrow>{recentWork.eyebrow}</Eyebrow>
            <h2 id="work-heading" className={styles.heading}>
              {recentWork.heading}
            </h2>
          </div>
          <p className={styles.aside}>{recentWork.aside}</p>
        </header>

        <Reveal className={styles.reveal}>
          <FeaturedCard project={recentWork.featured} />
        </Reveal>

        <ul className={styles.grid}>
          {recentWork.projects.map((p: Project, i) => (
            <li key={p.name}>
              <Reveal className={styles.reveal} index={i}>
                <ProjectCard project={p} />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function BrowserFrame({ href, children }: { href: string; children: ReactNode }) {
  return (
    <div className={styles.browser}>
      <div className={styles.browserBar} aria-hidden="true">
        <span className={styles.dots}>
          <span />
          <span />
          <span />
        </span>
        <span className={styles.address}>
          <TbLock />
          {host(href)}
        </span>
      </div>
      <div className={styles.browserView}>{children}</div>
    </div>
  );
}

function FeaturedCard({ project }: { project: FeaturedProject }) {
  return (
    <article className={styles.featured}>
      <div className={styles.featuredMedia}>
        <BrowserFrame href={project.href}>
          <Image
            src={project.image.src}
            alt={project.image.alt}
            fill
            sizes="(min-width: 1080px) 700px, 100vw"
            className={styles.shot}
          />
        </BrowserFrame>
      </div>

      <div className={styles.featuredBody}>
        <div className={styles.badges}>
          <span className={styles.badgeTint}>
            <TbHeart aria-hidden="true" />
            {project.badge}
          </span>
          <span className={styles.badgeBrass}>Featured</span>
        </div>
        <div className={styles.titleBlock}>
          <h3 className={styles.featuredName}>{project.name}</h3>
          <p className={styles.type}>{project.industry}</p>
        </div>
        <p className={styles.highlightStrip}>
          <TbSparkles aria-hidden="true" />
          <span>
            <span className={styles.highlightLabel}>Highlight</span>
            {project.highlight}
          </span>
        </p>
        <p className={styles.summary}>{project.summary}</p>
        <figure className={styles.quote}>
          <blockquote>{project.quote.text}</blockquote>
          <figcaption>
            {project.quote.name}, {project.quote.title}
          </figcaption>
        </figure>
        <Link href={project.href} className={styles.more} {...newTab(project.href)}>
          See the project
          <TbArrowRight aria-hidden="true" />
          <span className="visually-hidden">
            : {project.name}
            {isExternal(project.href) && " (opens in a new tab)"}
          </span>
        </Link>
      </div>
    </article>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={project.href} className={styles.card} {...newTab(project.href)}>
      <div className={styles.cardMedia}>
        <BrowserFrame href={project.href}>
          <Image
            src={project.image.src}
            alt={project.image.alt}
            fill
            sizes="(min-width: 1080px) 380px, (min-width: 640px) 50vw, 100vw"
            className={styles.shot}
          />
          <span className={styles.visit} aria-hidden="true">
            Visit site
            <TbArrowUpRight />
          </span>
        </BrowserFrame>
      </div>
      <div className={styles.cardBody}>
        <span className={styles.cardName}>{project.name}</span>
        <span className={styles.type}>{project.industry}</span>
        <span className={styles.highlight}>
          <TbSparkles aria-hidden="true" />
          {project.highlight}
        </span>
      </div>
      {isExternal(project.href) && <span className="visually-hidden"> (opens in a new tab)</span>}
    </Link>
  );
}
