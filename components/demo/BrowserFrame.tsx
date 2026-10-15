import type { ReactNode } from "react";
import styles from "./BrowserFrame.module.css";

type Props = { url?: string; children: ReactNode; className?: string };

/** A clean browser window for screenshots. Put an <Image fill> or a mock inside. */
export function BrowserFrame({ url, children, className }: Props) {
  return (
    <div className={`${styles.frame} ${className ?? ""}`}>
      <div className={styles.bar} aria-hidden="true">
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
        {url ? <span className={styles.url}>{url}</span> : null}
      </div>
      <div className={styles.view}>{children}</div>
    </div>
  );
}
