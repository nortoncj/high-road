import { BookHeader, BookTabs } from "@/components/book";
import { bookMeta } from "@/content/book";
import { buildMetadata } from "@/lib/seo";
import styles from "./page.module.css";

export const metadata = buildMetadata({
  title: bookMeta.title,
  description: bookMeta.description,
  // If buildMetadata takes a canonical path, pass bookMeta.path here.
});

export default function BookPage() {
  return (
    <section className={styles.section} aria-labelledby="book-heading">
      <div className={`container ${styles.grid}`}>
        <BookHeader />
        <BookTabs />
      </div>
    </section>
  );
}
