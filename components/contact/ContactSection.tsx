import { TbCalendarEvent, TbPhone } from "react-icons/tb";
import { contactPage } from "@/content/contact";
import { site } from "@/content/home";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ContactForm } from "./ContactForm";
import styles from "./Contact.module.css";

/** The whole /contact page: intro, form, and a "rather talk?" card. */
export function ContactSection() {
  return (
    <section className={styles.section} aria-labelledby="contact-heading">
      <div className={`container ${styles.grid}`}>
        <header className={styles.header}>
          <Eyebrow>{contactPage.eyebrow}</Eyebrow>
          <h1 id="contact-heading" className={styles.headline}>
            {contactPage.headline}
          </h1>
          <p className={styles.intro}>{contactPage.intro}</p>
        </header>

        <div className={styles.card}>
          <ContactForm source="contact" />
        </div>

        <aside className={styles.side} aria-labelledby="contact-side">
          <h2 id="contact-side" className={styles.sideTitle}>
            {contactPage.sideTitle}
          </h2>
          <p className={styles.sideBody}>{contactPage.sideBody}</p>
          <Button href={site.bookHref} icon={<TbCalendarEvent />} block>
            {contactPage.sideBook}
          </Button>
          <a href={site.phoneHref} className={styles.call}>
            <TbPhone aria-hidden="true" />
            {contactPage.sideCallPrefix} {site.phone}
          </a>
          <p className={styles.spanish}>{contactPage.spanish}</p>
        </aside>
      </div>
    </section>
  );
}
