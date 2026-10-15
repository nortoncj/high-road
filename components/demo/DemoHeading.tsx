import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./DemoHeading.module.css";

type Props = { id: string; eyebrow: string; heading: string; children?: ReactNode };

/** Eyebrow + H2 (+ optional lead) used at the top of each Demo section. */
export function DemoHeading({ id, eyebrow, heading, children }: Props) {
  return (
    <header className={styles.header}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 id={id} className={styles.heading}>
        {heading}
      </h2>
      {children ? <p className={styles.lead}>{children}</p> : null}
    </header>
  );
}
