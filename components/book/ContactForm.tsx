"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { TbArrowRight, TbLoader2, TbLock } from "react-icons/tb";
import { book } from "@/content/book";
import styles from "./ContactForm.module.css";

type Status = "idle" | "sending" | "error";

/**
 * Message form. Posts to your existing contact route (which sends the Brevo confirmation),
 * then pushes to the thank-you page. Swap the endpoint in content/book.ts.
 * Spam: a hidden honeypot field plus a minimum fill time. Bots fill both; people don't.
 */
export function ContactForm() {
  const m = book.message;
  const f = m.fields;
  const id = useId();
  const router = useRouter();
  // Stamped on mount, not during render: Date.now() in render breaks prerendering with cacheComponents.
  const startedAt = useRef(0);
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;

    // Honeypot filled or submitted in under 3 seconds: pretend it worked, send nothing.
    if (data.company_fax || Date.now() - startedAt.current < 3000) {
      router.push(m.successHref);
      return;
    }
    delete data.company_fax;

    setStatus("sending");
    try {
      const res = await fetch(m.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, source: "book-page" }),
      });
      if (!res.ok) throw new Error(String(res.status));
      router.push(m.successHref);
    } catch {
      setStatus("error");
    }
  }

  const fid = (k: string) => `${id}-${k}`;

  return (
    <div className={styles.wrap}>
      <div className={styles.intro}>
        <h2 className={styles.heading}>{m.heading}</h2>
        <p className={styles.body}>{m.body}</p>
      </div>

      <form className={styles.form} onSubmit={onSubmit}>
        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor={fid("name")}>{f.name.label}</label>
            <input id={fid("name")} name="name" autoComplete="name" placeholder={f.name.placeholder} required />
          </div>
          <div className={styles.field}>
            <label htmlFor={fid("email")}>{f.email.label}</label>
            <input id={fid("email")} name="email" type="email" autoComplete="email" placeholder={f.email.placeholder} required />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor={fid("phone")}>{f.phone.label}</label>
            <input
              id={fid("phone")}
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder={f.phone.placeholder}
              aria-describedby={fid("phone-hint")}
            />
            <p id={fid("phone-hint")} className={styles.hint}>
              {f.phone.hint}
            </p>
          </div>
          <div className={styles.field}>
            <label htmlFor={fid("website")}>{f.website.label}</label>
            <input
              id={fid("website")}
              name="website"
              inputMode="url"
              autoComplete="url"
              placeholder={f.website.placeholder}
              aria-describedby={fid("website-hint")}
            />
            <p id={fid("website-hint")} className={styles.hint}>
              {f.website.hint}
            </p>
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor={fid("message")}>{f.message.label}</label>
          <textarea id={fid("message")} name="message" rows={5} placeholder={f.message.placeholder} required />
        </div>

        {/* Honeypot: hidden from people and screen readers, irresistible to bots */}
        <div className={styles.trap} aria-hidden="true">
          <label htmlFor={fid("fax")}>Company fax</label>
          <input id={fid("fax")} name="company_fax" tabIndex={-1} autoComplete="off" />
        </div>

        {status === "error" ? (
          <p className={styles.error} role="alert">
            {m.error}
          </p>
        ) : null}

        <div className={styles.foot}>
          <button type="submit" className={styles.submit} disabled={status === "sending"}>
            {status === "sending" ? (
              <>
                <TbLoader2 className={styles.spin} aria-hidden="true" />
                {m.sending}
              </>
            ) : (
              <>
                {m.submit}
                <TbArrowRight aria-hidden="true" />
              </>
            )}
          </button>
          <p className={styles.privacy}>
            <TbLock aria-hidden="true" />
            {m.privacy}
          </p>
        </div>
      </form>
    </div>
  );
}
