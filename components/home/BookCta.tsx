"use client";

import Image from "next/image";
import { useId, useState, type FormEvent } from "react";
import { TbArrowRight, TbLoader2 } from "react-icons/tb";
import { book, site } from "@/content/home";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./BookCta.module.css";

type Status = "idle" | "sending" | "sent" | "error";

/** Closing ask on a photo: a three-field lead form, then a link to pick a time. */
export function BookCta() {
  const id = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [first, setFirst] = useState("");
  const f = book.fields;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    setFirst((data.name ?? "").trim().split(/\s+/)[0] || "friend");
    setStatus("sending");
    try {
      const res = await fetch(site.leadEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, source: "home-book-cta" }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="book" className={styles.section} aria-labelledby="book-heading">
      <div className={styles.media} aria-hidden="true">
        <Image src={book.image.src} alt="" fill sizes="100vw" className={styles.bg} />
        <div className={styles.shade} />
      </div>

      <div className={`container ${styles.grid}`}>
        <div className={styles.copy}>
          <Eyebrow>{book.eyebrow}</Eyebrow>
          <h2 id="book-heading" className={styles.heading}>
            {book.heading}
          </h2>
          <p className={styles.body}>{book.body}</p>
        </div>

        <div className={styles.card}>
          {status === "sent" ? (
            <div className={styles.done} role="status">
              <p className={styles.doneTitle}>{book.successTitle(first)}</p>
              <p className={styles.doneBody}>{book.successBody}</p>
              <Button href={site.bookHref} arrow>
                {book.successCta}
              </Button>
            </div>
          ) : (
            <form className={styles.form} onSubmit={onSubmit} noValidate={false}>
              <div className={styles.field}>
                <label htmlFor={`${id}-name`}>{f.name.label}</label>
                <input id={`${id}-name`} name="name" autoComplete="name" placeholder={f.name.placeholder} required />
              </div>
              <div className={styles.field}>
                <label htmlFor={`${id}-biz`}>{f.business.label}</label>
                <input id={`${id}-biz`} name="business" autoComplete="organization" placeholder={f.business.placeholder} required />
              </div>
              <div className={styles.field}>
                <label htmlFor={`${id}-contact`}>{f.contact.label}</label>
                <input
                  id={`${id}-contact`}
                  name="contact"
                  autoComplete="tel"
                  placeholder={f.contact.placeholder}
                  aria-describedby={`${id}-contact-hint`}
                  required
                />
                <p id={`${id}-contact-hint`} className={styles.hint}>
                  {f.contact.hint}
                </p>
              </div>

              {status === "error" ? (
                <p className={styles.error} role="alert">
                  {book.error}
                </p>
              ) : null}

              <button type="submit" className={styles.submit} disabled={status === "sending"}>
                {status === "sending" ? (
                  <>
                    <TbLoader2 className={styles.spin} aria-hidden="true" />
                    {book.sending}
                  </>
                ) : (
                  <>
                    {book.submit}
                    <TbArrowRight aria-hidden="true" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
