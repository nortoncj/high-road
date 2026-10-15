import Image from "next/image";
import Link from "next/link";
import { TbArrowRight, TbHeart } from "react-icons/tb";
import { recentWork, type FeaturedProject, type Project } from "@/content/home";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./RecentWork.module.css";

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

        <FeaturedCard project={recentWork.featured} />

        <ul className={styles.grid}>
          {recentWork.projects.map((p: Project) => (
            <li key={p.name}>
              <ProjectCard project={p} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function FeaturedCard({ project }: { project: FeaturedProject }) {
  return (
    <article className={styles.featured}>
      <div className={styles.featuredMedia}>
        <div className={styles.browser}>
          <div className={styles.browserBar} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className={styles.browserView}>
            <Image
              src={project.image.src}
              alt={project.image.alt}
              fill
              sizes="(min-width: 1080px) 700px, 100vw"
              className={styles.cover}
            />
          </div>
        </div>
      </div>

      <div className={styles.featuredBody}>
        <div className={styles.badges}>
          <span className={styles.badgeTint}>
            <TbHeart aria-hidden="true" />
            {project.badge}
          </span>
          <span className={styles.badgeBrass}>Featured</span>
        </div>
        <div>
          <h3 className={styles.featuredName}>{project.name}</h3>
          <p className={styles.industry}>{project.industry}</p>
        </div>
        <p className={styles.summary}>{project.summary}</p>
        <figure className={styles.quote}>
          <blockquote>{project.quote.text}</blockquote>
          <figcaption>
            {project.quote.name}, {project.quote.title}
          </figcaption>
        </figure>
        <Link href={project.href} className={styles.more}>
          See the project
          <TbArrowRight aria-hidden="true" />
          <span className="visually-hidden">: {project.name}</span>
        </Link>
      </div>
    </article>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={project.href} className={styles.card}>
      <div className={styles.thumb}>
        <Image
          src={project.image.src}
          alt={project.image.alt}
          fill
          sizes="(min-width: 1080px) 380px, (min-width: 640px) 50vw, 100vw"
          className={styles.cover}
        />
      </div>
      <div className={styles.cardBody}>
        <span className={styles.cardName}>{project.name}</span>
        <span className={styles.cardIndustry}>{project.industry}</span>
      </div>
    </Link>
  );
}
