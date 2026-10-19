import { TbQuote } from "react-icons/tb";
import { quotes } from "@/content/work";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./ClientQuotes.module.css";

/** Real client quotes only. Entries with empty text are skipped; with none left, the section disappears. */
export function ClientQuotes() {
  const items = quotes.items.filter((q) => q.text.trim().length > 0);
  if (items.length === 0) return null;

  return (
    <section className={styles.section} aria-label={quotes.eyebrow}>
      <div className="container">
        <div className={styles.heading}>
          <Eyebrow>{quotes.eyebrow}</Eyebrow>
        </div>
        <ul className={styles.grid} data-count={items.length}>
          {items.map((q) => (
            <li key={q.name} className={styles.card}>
              <figure>
                <TbQuote className={styles.mark} aria-hidden="true" />
                <blockquote className={styles.text}>{q.text}</blockquote>
                <figcaption className={styles.who}>
                  <strong>{q.name}</strong>
                  <span>{q.business}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
