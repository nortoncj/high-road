import Link from "next/link";
import { TbArrowRight } from "react-icons/tb";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PostCard } from "./PostCard";
import { Thumb } from "./Thumb";
import type { CaseStudyCardView, PostCardView } from "./views";
import styles from "./CardRows.module.css";

type RowHeaderProps = { id: string; eyebrow: string; heading: string; link?: { label: string; href: string } };

function RowHeader({ id, eyebrow, heading, link }: RowHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.titles}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 id={id} className={styles.heading}>
          {heading}
        </h2>
      </div>
      {link ? (
        <Link href={link.href} className={styles.all}>
          {link.label}
          <TbArrowRight aria-hidden="true" />
        </Link>
      ) : null}
    </header>
  );
}

/** "See it fixed on real businesses": up to three case study cards. */
export function CaseStudyRow({ id, eyebrow, heading, cards, linkLabel }: RowHeaderProps & { cards: CaseStudyCardView[]; linkLabel: string }) {
  if (!cards.length) return null;
  return (
    <section className={styles.section} aria-labelledby={id}>
      <div className="container">
        <RowHeader id={id} eyebrow={eyebrow} heading={heading} />
        <ul className={styles.grid}>
          {cards.map((c) => (
            <li key={c.id}>
              <Link href={c.href} className={styles.case}>
                <span className={styles.caseMedia}>
                  <Thumb image={c.image} sizes="(min-width: 1080px) 390px, (min-width: 640px) 50vw, 100vw" />
                </span>
                <span className={styles.caseBody}>
                  {c.meta.length ? <span className={styles.caseMeta}>{c.meta.join(" · ")}</span> : null}
                  <h3 className={styles.caseName}>{c.name}</h3>
                  {c.excerpt ? <span className={styles.caseText}>{c.excerpt}</span> : null}
                  <span className={styles.go} aria-hidden="true">
                    {linkLabel}
                    <TbArrowRight />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** "Keep reading" / "Do it yourself": up to three posts, compact or as small cards. */
export function PostRow({
  id,
  eyebrow,
  heading,
  link,
  posts,
  variant = "compact",
}: RowHeaderProps & { posts: PostCardView[]; variant?: "compact" | "brief" }) {
  if (!posts.length) return null;
  return (
    <section className={styles.section} aria-labelledby={id}>
      <div className="container">
        <RowHeader id={id} eyebrow={eyebrow} heading={heading} link={link} />
        <ul className={styles.grid}>
          {posts.map((p) => (
            <li key={p.id}>
              {variant === "compact" ? <PostCard post={p} variant="compact" /> : <PostCard post={p} brief />}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
