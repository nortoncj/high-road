"use client";

import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { TbSearch } from "react-icons/tb";
import { blogIndex as copy } from "@/content/blog";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PostCard } from "./PostCard";
import type { PostCardView } from "./views";
import styles from "./PostBrowser.module.css";

const ALL = "all";

// Breadcrumbs on a post link here as /blog?topic=<slug>#all-posts. The URL doesn't change while
// the page is open, so there's nothing to subscribe to; the server snapshot is "no topic".
const noSubscribe = () => () => {};
const topicFromUrl = () => new URLSearchParams(window.location.search).get("topic");

/** Every post except the featured one: search, topic chips, and "show more". All client side, the list is small. */
export function PostBrowser({ posts }: { posts: PostCardView[] }) {
  const urlTopic = useSyncExternalStore(noSubscribe, topicFromUrl, () => null);
  // null until a chip is clicked: then the URL's topic (if it's a real one) is the starting filter.
  const [picked, setPicked] = useState<string | null>(null);
  const cat = picked ?? (urlTopic && posts.some((p) => p.category?.slug === urlTopic) ? urlTopic : ALL);
  const [q, setQ] = useState("");
  const [showAll, setShowAll] = useState(false);
  const firstNewRef = useRef<HTMLLIElement>(null);
  const focusNew = useRef(false);
  const searchId = useId();

  const query = q.trim().toLowerCase();
  const searched = useMemo(
    () => (query ? posts.filter((p) => `${p.title} ${p.excerpt ?? ""} ${p.category?.title ?? ""}`.toLowerCase().includes(query)) : posts),
    [posts, query],
  );

  // Chips come from the posts themselves, busiest topic first. Counts follow the search.
  const chips = useMemo(() => {
    const byCat = new Map<string, { slug: string; title: string; total: number }>();
    for (const p of posts) {
      if (!p.category) continue;
      const c = byCat.get(p.category.slug) ?? { slug: p.category.slug, title: p.category.title, total: 0 };
      c.total++;
      byCat.set(p.category.slug, c);
    }
    const sorted = [...byCat.values()].sort((a, b) => b.total - a.total || a.title.localeCompare(b.title));
    return [
      { slug: ALL, title: copy.all, count: searched.length },
      ...sorted.map((c) => ({ ...c, count: searched.filter((p) => p.category?.slug === c.slug).length })),
    ];
  }, [posts, searched]);

  const filtered = cat === ALL ? searched : searched.filter((p) => p.category?.slug === cat);
  const limit = showAll ? filtered.length : copy.pageSize;
  const visible = filtered.slice(0, limit);

  // After "show more", move focus to the first new card so keyboard users land on it.
  useEffect(() => {
    if (focusNew.current && showAll) {
      firstNewRef.current?.querySelector("a")?.focus();
      focusNew.current = false;
    }
  }, [showAll]);

  const pick = (slug: string) => {
    setPicked(slug);
    setShowAll(false);
  };

  const reset = () => {
    setPicked(ALL);
    setQ("");
    setShowAll(false);
  };

  return (
    <section id="all-posts" className={styles.section} aria-labelledby="all-posts-heading">
      <div className="container">
        <header className={styles.header}>
          <div className={styles.titles}>
            <Eyebrow>{copy.allEyebrow}</Eyebrow>
            <h2 id="all-posts-heading" className={styles.heading}>
              {copy.heading}
            </h2>
          </div>
          <div className={styles.search}>
            <label htmlFor={searchId} className={styles.searchLabel}>
              {copy.searchLabel}
            </label>
            <span className={styles.searchBox}>
              <TbSearch aria-hidden="true" />
              <input
                id={searchId}
                type="search"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setShowAll(false);
                }}
                placeholder={copy.searchPlaceholder}
                autoComplete="off"
                className={styles.searchInput}
              />
            </span>
          </div>
        </header>

        <div className={styles.toolbar}>
          <div className={styles.chips} role="group" aria-label={copy.filterLabel}>
            {chips.map((c) => (
              <button
                key={c.slug}
                type="button"
                className={styles.chip}
                aria-pressed={cat === c.slug}
                onClick={() => pick(c.slug)}
              >
                {c.title}
                <span className={styles.count}>{c.count}</span>
              </button>
            ))}
          </div>
          <p className={styles.status} aria-live="polite">
            <span className={styles.dot} aria-hidden="true" />
            {copy.showing(visible.length, filtered.length)}
          </p>
        </div>

        {visible.length ? (
          <ul className={styles.grid}>
            {visible.map((p, i) => (
              <li
                key={p.id}
                ref={i === copy.pageSize ? firstNewRef : undefined}
                className="settle"
                style={{ "--i": i % copy.pageSize } as CSSProperties}
              >
                <PostCard post={p} />
              </li>
            ))}
          </ul>
        ) : (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>{copy.emptyTitle}</p>
            <p>{copy.emptyBody}</p>
            <button type="button" className={styles.moreButton} onClick={reset}>
              {copy.emptyReset}
            </button>
          </div>
        )}

        {filtered.length > limit ? (
          <div className={styles.moreRow}>
            <button
              type="button"
              className={styles.moreButton}
              onClick={() => {
                focusNew.current = true;
                setShowAll(true);
              }}
            >
              {copy.showMore}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
