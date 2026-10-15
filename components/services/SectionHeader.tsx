import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./SectionHeader.module.css";

type Props = {
  id: string;
  eyebrow: string;
  heading: string;
  children?: ReactNode;
  align?: "start" | "center";
};

/** Eyebrow + H2 (+ optional lead) used at the top of each services section. */
export function SectionHeader({ id, eyebrow, heading, children, align = "start" }: Props) {
  return (
    <header className={`${styles.header} ${align === "center" ? styles.center : ""}`}>
      <Eyebrow align={align}>{eyebrow}</Eyebrow>
      <h2 id={id} className={styles.heading}>
        {heading}
      </h2>
      {children ? <div className={styles.lead}>{children}</div> : null}
    </header>
  );
}
