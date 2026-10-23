"use client";

import Image from "next/image";
import { useActionState, useEffect, useId, useRef } from "react";
import { TbArrowRight, TbLoader2 } from "react-icons/tb";
import posthog from "posthog-js";
import { book } from "@/content/home";
import { submitLead, type ContactState } from "@/components/contact/actions";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./BookCta.module.css";

const initial: ContactState = {};

/**
 * Closing ask on a photo: a three-field lead form. Same server action as /book and /contact:
 * emails you through Brevo, saves the lead (source "home"), then sends them to /thanks/message.
 */
export function BookCta() {
  const id = useId();
  const f = book.fields;
  const [state, action, pending] = useActionState(submitLead, initial);
  const startedRef = useRef<HTMLInputElement>(null);

  // Timestamp for the server's "too fast to be human" check. Set after mount to avoid a hydration mismatch.
  useEffect(() => {
    if (startedRef.current) startedRef.current.value = String(Date.now());
  }, []);

  const v = state.values ?? {};
  const err = state.errors ?? {};
  // The phone-or-email box maps to whichever of the two the server checked.
  const contactError = err.email ?? err.phone;
  const contactValue = v.email || v.phone;
  const problem = state.formError ?? err.name ?? err.business ?? contactError;

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
          <form
            className={styles.form}
            action={action}
            onSubmit={() => posthog.capture("lead_form_submit_attempted", { source: "home" })}
          >
            <input type="hidden" name="source" value="home" />
            <input ref={startedRef} type="hidden" name="startedAt" defaultValue="" />

            <div className={styles.field}>
              <label htmlFor={`${id}-name`}>{f.name.label}</label>
              <input
                id={`${id}-name`}
                name="name"
                autoComplete="name"
                maxLength={120}
                placeholder={f.name.placeholder}
                defaultValue={v.name}
                aria-invalid={err.name ? true : undefined}
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor={`${id}-biz`}>{f.business.label}</label>
              <input
                id={`${id}-biz`}
                name="business"
                autoComplete="organization"
                maxLength={200}
                placeholder={f.business.placeholder}
                defaultValue={v.business}
                aria-invalid={err.business ? true : undefined}
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor={`${id}-contact`}>{f.contact.label}</label>
              <input
                id={`${id}-contact`}
                name="contact"
                autoComplete="tel"
                placeholder={f.contact.placeholder}
                defaultValue={contactValue}
                aria-invalid={contactError ? true : undefined}
                aria-describedby={`${id}-contact-hint`}
                required
              />
              <p id={`${id}-contact-hint`} className={styles.hint}>
                {f.contact.hint}
              </p>
            </div>

            {/* Honeypot: hidden from people and screen readers, irresistible to bots */}
            <div hidden aria-hidden="true">
              <label htmlFor={`${id}-company`}>Company website</label>
              <input id={`${id}-company`} name="company" tabIndex={-1} autoComplete="off" />
            </div>

            {problem ? (
              <p className={styles.error} role="alert">
                {problem}
              </p>
            ) : null}

            <button type="submit" className={styles.submit} disabled={pending}>
              {pending ? (
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
        </div>
      </div>
    </section>
  );
}
