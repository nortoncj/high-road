"use client";

import { caseStudyPage as copy } from "@/content/case-study";
import { useActiveSection } from "@/hooks/use-active-section";
import styles from "./JumpNav.module.css";

type JumpNavProps = { links: { id: string; label: string }[]; readLabel: string };

/** Sticky bar under the main nav: one tap to each section, with the current one marked. */
export function JumpNav({ links, readLabel }: JumpNavProps) {
  const active = useActiveSection(links.map((l) => l.id));

  if (links.length < 2) return null;

  return (
    <div className={styles.bar}>
      <div className={`container ${styles.inner}`}>
        <nav aria-label={copy.jumpLabel} className={styles.nav}>
          {links.map((l) => (
            <a key={l.id} href={`#${l.id}`} className={styles.link} aria-current={active === l.id ? "location" : undefined}>
              {l.label}
            </a>
          ))}
        </nav>
        <span className={styles.read}>{readLabel}</span>
      </div>
    </div>
  );
}
