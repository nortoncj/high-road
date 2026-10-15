import { TbHeartHandshake } from "react-icons/tb";
import { whyHomeCare } from "@/content/about";
import { AboutHeading } from "./AboutHeading";
import styles from "./WhyHomeCare.module.css";

export function WhyHomeCare() {
  return (
    <section className={styles.section} aria-labelledby="why-heading">
      <div className={`container ${styles.inner}`}>
        <AboutHeading id="why-heading" eyebrow={whyHomeCare.eyebrow} heading={whyHomeCare.heading} />

        {/* Only renders when you've written a real reason. Set personalReason to null to hide it. */}
        {whyHomeCare.personalReason ? (
          <figure className={styles.personal}>
            <TbHeartHandshake className={styles.personalIcon} aria-hidden="true" />
            <blockquote>{whyHomeCare.personalReason}</blockquote>
          </figure>
        ) : null}

        <div className={styles.body}>
          {whyHomeCare.paragraphs.map((p) => (
            <p key={p.slice(0, 32)}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
