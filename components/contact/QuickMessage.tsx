import { quickMessage } from "@/content/contact";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ContactForm } from "./ContactForm";
import styles from "./Contact.module.css";

/** "Not ready to book?" block. Drop it under <BookSection /> on /book. */
export function QuickMessage() {
  return (
    <section id="message" className={styles.quick} aria-labelledby="quick-heading">
      <div className={`container ${styles.quickInner}`}>
        <div className={styles.quickCopy}>
          <Eyebrow>{quickMessage.eyebrow}</Eyebrow>
          <h2 id="quick-heading" className={styles.quickHeadline}>
            {quickMessage.headline}
          </h2>
          <p className={styles.intro}>{quickMessage.intro}</p>
        </div>
        <div className={styles.card}>
          <ContactForm source="book" />
        </div>
      </div>
    </section>
  );
}
