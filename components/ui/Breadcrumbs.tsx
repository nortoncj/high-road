import Link from "next/link";
import styles from "./Breadcrumbs.module.css";

export type Crumb = { label: string; href?: string };

/** Trail above a post or case study. The last crumb is the current page and isn't a link. */
export function Breadcrumbs({ items, label = "Breadcrumb" }: { items: Crumb[]; label?: string }) {
  return (
    <nav aria-label={label} className={styles.nav}>
      <ol className={styles.list}>
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${c.label}-${i}`}>
              {c.href && !last ? (
                <Link href={c.href}>{c.label}</Link>
              ) : (
                <span aria-current={last ? "page" : undefined}>{c.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** schema.org BreadcrumbList for the same trail. Only crumbs with links are listed, plus the current page. */
export function breadcrumbJsonLd(items: Crumb[], base: string, currentPath: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      item: new URL(i === items.length - 1 ? currentPath : (c.href ?? currentPath), base).toString(),
    })),
  };
}
