import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./AboutHeading.module.css";

type Props = { id: string; eyebrow: string; heading: string };

/** Eyebrow + H2 used at the top of each About section. */
export function AboutHeading({ id, eyebrow, heading }: Props) {
  return (
    <header className={styles.header}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 id={id} className={styles.heading}>
        {heading}
      </h2>
    </header>
  );
}
