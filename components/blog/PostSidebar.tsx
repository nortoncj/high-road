import Link from "next/link";
import { TbArrowRight, TbCalendarEvent } from "react-icons/tb";
import { formCheck } from "@/content/blog";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { FormCheckForm } from "./FormCheckForm";
import { Newsletter } from "./Newsletter";
import styles from "./FormCheck.module.css";

/** Sticky rail beside a post: free form check, a call link, and the monthly email. */
export function PostSidebar({ postTitle }: { postTitle: string }) {
  return (
    <aside className={styles.rail} aria-label="Get help with your website">
      <div className={styles.sticky}>
        <section className={styles.card} aria-labelledby="form-check-heading">
          <span className={styles.rule} aria-hidden="true" />
          <Eyebrow>{formCheck.eyebrow}</Eyebrow>
          <h2 id="form-check-heading" className={styles.heading}>
            {formCheck.heading}
          </h2>
          <p className={styles.body}>{formCheck.body}</p>
          <FormCheckForm postTitle={postTitle} />
          <p className={styles.footnote}>{formCheck.footnote}</p>
        </section>

        <div className={styles.talk}>
          <span className={styles.talkIcon} aria-hidden="true">
            <TbCalendarEvent />
          </span>
          <div>
            <p className={styles.talkTitle}>{formCheck.talkTitle}</p>
            <Link href={formCheck.talkHref} className={styles.talkLink}>
              {formCheck.talkLink}
              <TbArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>

        <Newsletter variant="rail" />
      </div>
    </aside>
  );
}
