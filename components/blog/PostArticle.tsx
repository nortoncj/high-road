import type { CSSProperties } from "react";
import { blocks, blogMeta, formatDate, formatLabels, minRead, post as labels } from "@/content/blog";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { toImg } from "@/lib/sanity/image";
import { buildToc } from "@/lib/sanity/portable-text";
import type { PostDetail } from "@/lib/sanity/types";
import { AuthorCard } from "./AuthorCard";
import { Byline } from "./Byline";
import { PortableBody } from "./PortableBody";
import { PostSidebar } from "./PostSidebar";
import { ReadingProgress } from "./ReadingProgress";
import { Thumb } from "./Thumb";
import { Toc } from "./Toc";
import styles from "./PostArticle.module.css";

const stagger = (i: number) => ({ "--i": i }) as CSSProperties;

export function postCrumbs(p: PostDetail) {
  return [
    { label: "Blog", href: blogMeta.path },
    ...(p.category ? [{ label: p.category.title, href: `${blogMeta.path}?topic=${p.category.slug}#all-posts` }] : []),
    { label: p.title },
  ];
}

/** Everything above the related rows on /blog/[slug]. */
export function PostArticle({ post: p }: { post: PostDetail }) {
  const { items, ids } = buildToc(p.body, blocks.checklist.heading);
  const hero = toImg(p.image, { width: 1600, aspect: 21 / 9 });
  const date = formatDate(p.publishedAt);

  return (
    <>
      <ReadingProgress targetId="post-body" />
      <header className={`container ${styles.header}`}>
        <div className={styles.headerInner}>
          <div className="settle" style={stagger(0)}>
            <Breadcrumbs items={postCrumbs(p)} label={labels.breadcrumbLabel} />
          </div>
          {p.category || p.format ? (
            <div className={`settle ${styles.badges}`} style={stagger(1)}>
              {p.category ? <span className={styles.badge}>{p.category.title}</span> : null}
              {p.format ? <span className={styles.format}>{formatLabels[p.format] ?? p.format}</span> : null}
            </div>
          ) : null}
          <h1 className={`settle ${styles.title}`} style={stagger(2)}>
            {p.title}
          </h1>
          {p.excerpt ? (
            <p className={`settle ${styles.lead}`} style={stagger(3)}>
              {p.excerpt}
            </p>
          ) : null}
          <div className="settle" style={stagger(4)}>
            <Byline date={date} dateTime={p.publishedAt} read={minRead(p.readMinutes)} size="md" />
          </div>
        </div>
      </header>

      {hero ? (
        <div className={`container settle ${styles.heroWrap}`} style={stagger(5)}>
          <div className={styles.hero}>
            <Thumb image={hero} sizes="(min-width: 1240px) 1176px, 100vw" priority />
          </div>
        </div>
      ) : null}

      <div className={`container ${styles.layout}`}>
        <article id="post-body" className={styles.article}>
          <Toc items={items} />
          {p.body?.length ? <PortableBody value={p.body} headingIds={ids} storageKey={p.slug} /> : null}
          <AuthorCard />
        </article>
        <PostSidebar postTitle={p.title} />
      </div>
    </>
  );
}
