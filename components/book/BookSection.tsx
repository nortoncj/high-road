import { TbPhone } from "react-icons/tb";
import { book } from "@/content/book";
import { site } from "@/content/home";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { CalendarEmbed } from "./CalendarEmbed";
import styles from "./BookSection.module.css";

/** The whole /book page: three lines on the call, then the calendar, then a phone fallback. */
export function BookSection() {
  return (
    <section className={styles.section} aria-labelledby="book-heading">
      <div className={`container ${styles.grid}`}>
        <div className={styles.copy}>
          <Eyebrow>{book.eyebrow}</Eyebrow>
          <h1 id="book-heading" className={styles.headline}>
            {book.headline}
          </h1>
          <ol className={styles.steps}>
            {book.steps.map((s, i) => (
              <li key={s}>
                <span className={styles.number} aria-hidden="true">
                  {i + 1}
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
          <p className={styles.smallLine}>{book.smallLine}</p>
          <p className={styles.trust}>{book.trustLine}</p>
        </div>

        <div className={styles.calendar}>
          <CalendarEmbed
            src={book.calendar.src}
            title={book.calendar.title}
            placeholderHeading={book.calendar.placeholderHeading}
            placeholderBody={book.calendar.placeholderBody}
          />
          <p className={styles.under}>
            {book.underCalendar}{" "}
            <a href={site.phoneHref} className={styles.phone}>
              <TbPhone aria-hidden="true" />
              {book.underCalendarCta} at {site.phone}
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
