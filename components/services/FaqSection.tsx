import { TbChevronDown } from "react-icons/tb";
import { faq } from "@/content/services";
import { SectionHeader } from "./SectionHeader";
import styles from "./FaqSection.module.css";

type Props = {
  /**
   * Adds FAQPage JSON-LD. Google stopped showing FAQ rich results in 2026, so this
   * won't change how you look in Google, but it's harmless and other tools still read it.
   */
  withSchema?: boolean;
};

/** Native <details> accordion: works without JavaScript, and every answer stays in the HTML for search. */
export function FaqSection({ withSchema = true }: Props) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <section id="faq" className={styles.section} aria-labelledby="faq-heading">
      <div className={`container ${styles.layout}`}>
        <SectionHeader id="faq-heading" eyebrow={faq.eyebrow} heading={faq.heading} />

        <div className={styles.list}>
          {faq.items.map((item, i) => (
            <details key={item.question} className={styles.item} open={i === 0}>
              <summary className={styles.summary}>
                <h3 className={styles.question}>{item.question}</h3>
                <TbChevronDown className={styles.chevron} aria-hidden="true" />
              </summary>
              <p className={styles.answer}>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>

      {withSchema ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ) : null}
    </section>
  );
}
