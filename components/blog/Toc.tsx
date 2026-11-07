"use client";

import { post } from "@/content/blog";
import { useActiveSection } from "@/hooks/use-active-section";
import type { TocItem } from "@/lib/sanity/portable-text";
import styles from "./Toc.module.css";

/** "On this page" with the section you're reading highlighted. Plain anchor links without JS. */
export function Toc({ items }: { items: TocItem[] }) {
  const active = useActiveSection(items.map((i) => i.id));

  if (items.length < 2) return null;

  return (
    <nav className={styles.toc} aria-labelledby="toc-heading">
      <p id="toc-heading" className={styles.title}>
        {post.toc}
      </p>
      <ol className={styles.list}>
        {items.map((i) => (
          <li key={i.id}>
            <a href={`#${i.id}`} className={styles.link} aria-current={active === i.id ? "location" : undefined}>
              {i.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
