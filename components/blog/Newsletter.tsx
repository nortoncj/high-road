import { newsletter } from "@/content/blog";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { NewsletterForm } from "./NewsletterForm";
import styles from "./Newsletter.module.css";

/** Hidden until there's a Brevo list to send signups to. */
export const newsletterEnabled = () => Boolean(process.env.BREVO_NEWSLETTER_LIST_ID && process.env.BREVO_API_KEY);

/** Monthly email signup. "band" is a full-width section on /blog; "rail" sits in a post's sidebar. */
export function Newsletter({ variant = "band" }: { variant?: "band" | "rail" }) {
  if (!newsletterEnabled()) return null;

  if (variant === "rail") {
    return (
      <div className={styles.rail}>
        <p className={styles.railTitle}>{newsletter.railTitle}</p>
        <p className={styles.railBody}>{newsletter.railBody}</p>
        <NewsletterForm variant="rail" where="post-sidebar" />
      </div>
    );
  }

  return (
    <section className={styles.section} aria-labelledby="newsletter-heading">
      <div className="container">
        <div className={styles.band}>
          <span className={styles.stripes} aria-hidden="true" />
          <div className={styles.copy}>
            <Eyebrow>{newsletter.eyebrow}</Eyebrow>
            <h2 id="newsletter-heading" className={styles.heading}>
              {newsletter.heading}
            </h2>
            <p className={styles.body}>{newsletter.body}</p>
          </div>
          <NewsletterForm variant="band" where="blog-index" />
        </div>
      </div>
    </section>
  );
}
