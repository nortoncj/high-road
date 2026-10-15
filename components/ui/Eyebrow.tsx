import type { ReactNode } from "react";
import styles from "./Eyebrow.module.css";

type EyebrowProps = {
  children: ReactNode;
  /** Centered eyebrows drop the shoreline rule. */
  align?: "start" | "center";
};

/** Small section label with the brass shoreline rule. Sentence case, never all caps. */
export function Eyebrow({ children, align = "start" }: EyebrowProps) {
  return (
    <p
      className={`${styles.eyebrow} ${align === "center" ? styles.center : ""}`}
    >
      {align === "start" ? (
        <span className={styles.rule} aria-hidden="true" />
      ) : null}
      {children}
    </p>
  );
}
