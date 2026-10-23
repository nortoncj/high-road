"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import { TbArrowRight, TbLoader2, TbLock } from "react-icons/tb";
import posthog from "posthog-js";
import { book } from "@/content/book";
import { submitLead, type ContactState, type Field } from "@/components/contact/actions";
import styles from "./ContactForm.module.css";

const initial: ContactState = {};
const FIELD_ORDER: Field[] = ["name", "email", "phone", "website", "message"];

/**
 * Message form under the calendar. Same server action as /contact: emails you through Brevo,
 * saves the lead (source "book"), then the server sends them to /thanks/message.
 * Spam: a hidden honeypot field plus a minimum fill time, both checked on the server.
 */
export function ContactForm() {
  const m = book.message;
  const f = m.fields;
  const id = useId();
  const [state, action, pending] = useActionState(submitLead, initial);
  const startedRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Timestamp for the "too fast to be human" check. Set after mount to avoid a hydration mismatch.
  useEffect(() => {
    if (startedRef.current) startedRef.current.value = String(Date.now());
  }, []);

  // After a failed submit, put focus on the first field with a problem.
  useEffect(() => {
    const first = FIELD_ORDER.find((k) => state.errors?.[k]);
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  }, [state.errors]);

  const fid = (k: string) => `${id}-${k}`;
  const v = state.values ?? {};
  const err = state.errors ?? {};
  const describe = (k: Field, hint?: boolean) =>
    [err[k] ? fid(`${k}-error`) : null, hint ? fid(`${k}-hint`) : null].filter(Boolean).join(" ") || undefined;
  const fieldError = (k: Field) =>
    err[k] ? (
      <p id={fid(`${k}-error`)} className={styles.fieldError}>
        {err[k]}
      </p>
    ) : null;

  return (
    <div className={styles.wrap}>
      <div className={styles.intro}>
        <h2 className={styles.heading}>{m.heading}</h2>
        <p className={styles.body}>{m.body}</p>
      </div>

      <form
        ref={formRef}
        className={styles.form}
        action={action}
        onSubmit={() => posthog.capture("lead_form_submit_attempted", { source: "book" })}
        noValidate
      >
        <input type="hidden" name="source" value="book" />
        <input ref={startedRef} type="hidden" name="startedAt" defaultValue="" />

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor={fid("name")}>{f.name.label}</label>
            <input
              id={fid("name")}
              name="name"
              autoComplete="name"
              maxLength={120}
              placeholder={f.name.placeholder}
              defaultValue={v.name}
              aria-invalid={err.name ? true : undefined}
              aria-describedby={describe("name")}
              required
            />
            {fieldError("name")}
          </div>
          <div className={styles.field}>
            <label htmlFor={fid("email")}>{f.email.label}</label>
            <input
              id={fid("email")}
              name="email"
              type="email"
              autoComplete="email"
              placeholder={f.email.placeholder}
              defaultValue={v.email}
              aria-invalid={err.email ? true : undefined}
              aria-describedby={describe("email")}
              required
            />
            {fieldError("email")}
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
              defaultValue={v.phone}
              aria-invalid={err.phone ? true : undefined}
              aria-describedby={describe("phone", true)}
            />
            <p id={fid("phone-hint")} className={styles.hint}>
              {f.phone.hint}
            </p>
            {fieldError("phone")}
          </div>
          <div className={styles.field}>
            <label htmlFor={fid("website")}>{f.website.label}</label>
            <input
              id={fid("website")}
              name="website"
              inputMode="url"
              autoComplete="url"
              placeholder={f.website.placeholder}
              defaultValue={v.website}
              aria-invalid={err.website ? true : undefined}
              aria-describedby={describe("website", true)}
            />
            <p id={fid("website-hint")} className={styles.hint}>
              {f.website.hint}
            </p>
            {fieldError("website")}
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor={fid("message")}>{f.message.label}</label>
          <textarea
            id={fid("message")}
            name="message"
            rows={5}
            placeholder={f.message.placeholder}
            defaultValue={v.message}
            aria-invalid={err.message ? true : undefined}
            aria-describedby={describe("message")}
            required
          />
          {fieldError("message")}
        </div>

        {/* Honeypot: hidden from people and screen readers, irresistible to bots */}
        <div className={styles.trap} aria-hidden="true">
          <label htmlFor={fid("company")}>Company website</label>
          <input id={fid("company")} name="company" tabIndex={-1} autoComplete="off" />
        </div>

        {state.formError ? (
          <p className={styles.error} role="alert">
            {state.formError}
          </p>
        ) : null}

        <div className={styles.foot}>
          <button type="submit" className={styles.submit} disabled={pending}>
            {pending ? (
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
