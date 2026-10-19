import type { ReactNode } from "react";
import styles from "./Eyebrow.module.css";

type EyebrowProps = {
  children: ReactNode;
  align?: "start" | "center";
};

/**
 * Small section label: a brass-tinted pill with a diamond marker. Sentence case, never all caps.
 * Reads --accent / --accent-text, so dark sections re-point those tokens to a lighter gold.
 */
export function Eyebrow({ children, align = "start" }: EyebrowProps) {
  return (
    <p className={`${styles.eyebrow} ${align === "center" ? styles.center : ""}`}>
      <span className={styles.mark} aria-hidden="true" />
      {children}
    </p>
  );
}
