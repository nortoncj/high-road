"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { TbAlertCircle, TbArrowRight, TbLoader2, TbMail, TbPhone } from "react-icons/tb";
import { contactForm as copy } from "@/content/contact";
import { RichText } from "@/components/legal/RichText";
import { submitLead, type ContactState, type Field } from "./actions";
import styles from "./ContactForm.module.css";

type Props = {
  /** Where the form lives, saved with the lead: "contact" (the /contact page) or "book" (under the calendar). */
  source?: "contact" | "book";
};

const initial: ContactState = {};
const FIELD_ORDER: Field[] = ["name", "email", "phone", "website", "message"];

/** Short lead form. Emails you through Brevo, saves to Supabase, then sends them to /thanks/message. */
export function ContactForm({ source = "contact" }: Props) {
  const [state, action, pending] = useActionState(submitLead, initial);
  const [method, setMethod] = useState<"email" | "phone">(
    state.values?.method === "phone" ? "phone" : "email",
  );
  const startedRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const uid = useId();
  const id = (f: string) => `${uid}-${f}`;

  // Timestamp for the "too fast to be human" check. Set after mount to avoid a hydration mismatch.
  useEffect(() => {
    if (startedRef.current) startedRef.current.value = String(Date.now());
  }, []);

  // Keep the toggle in sync when the server echoes values back.
  useEffect(() => {
    if (state.values?.method === "phone" || state.values?.method === "email") setMethod(state.values.method);
  }, [state.values?.method]);

  // After a failed submit, put focus on the first field with a problem.
  useEffect(() => {
    const first = FIELD_ORDER.find((f) => state.errors?.[f]);
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  }, [state.errors]);

  const v = state.values ?? {};
  const err = state.errors ?? {};
  const describe = (f: Field, hint?: boolean) =>
    [err[f] ? id(`${f}-error`) : null, hint ? id(`${f}-hint`) : null].filter(Boolean).join(" ") || undefined;

  return (
    <form ref={formRef} action={action} className={styles.form} noValidate>
      <input type="hidden" name="source" value={source} />
      <input ref={startedRef} type="hidden" name="startedAt" defaultValue="" />
      {/* Honeypot: hidden from people and screen readers, irresistible to bots. */}
      <div className={styles.trap} aria-hidden="true">
        <label htmlFor={id("company")}>Company website</label>
        <input id={id("company")} name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {state.formError ? (
        <p className={styles.formError} role="alert">
          <TbAlertCircle aria-hidden="true" />
          <span>{state.formError}</span>
        </p>
      ) : null}

      {/* Name */}
      <div className={styles.field}>
        <label htmlFor={id("name")} className={styles.label}>
          {copy.name.label}
        </label>
        <input
          id={id("name")}
          name="name"
          type="text"
          autoComplete="name"
          required
          maxLength={120}
          placeholder={copy.name.placeholder}
          defaultValue={v.name}
          aria-invalid={err.name ? true : undefined}
          aria-describedby={describe("name")}
          className={styles.input}
        />
        <FieldError id={id("name-error")} msg={err.name} />
      </div>

      {/* How to reach them */}
      <fieldset className={styles.fieldset}>
        <legend className={styles.label}>{copy.method.legend}</legend>
        <div className={styles.toggle}>
          <label className={styles.toggleOption}>
            <input
              type="radio"
              name="method"
              value="email"
              checked={method === "email"}
              onChange={() => setMethod("email")}
            />
            <span>
              <TbMail aria-hidden="true" />
              {copy.method.email}
            </span>
          </label>
          <label className={styles.toggleOption}>
            <input
              type="radio"
              name="method"
              value="phone"
              checked={method === "phone"}
              onChange={() => setMethod("phone")}
            />
            <span>
              <TbPhone aria-hidden="true" />
              {copy.method.phone}
            </span>
          </label>
        </div>
      </fieldset>

      {method === "email" ? (
        <div className={styles.field} key="email">
          <label htmlFor={id("email")} className={styles.label}>
            {copy.email.label}
          </label>
          <input
            id={id("email")}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            maxLength={254}
            placeholder={copy.email.placeholder}
            defaultValue={v.email}
            aria-invalid={err.email ? true : undefined}
            aria-describedby={describe("email")}
            className={styles.input}
          />
          <FieldError id={id("email-error")} msg={err.email} />
        </div>
      ) : (
        <div className={styles.field} key="phone">
          <label htmlFor={id("phone")} className={styles.label}>
            {copy.phone.label}
          </label>
          <input
            id={id("phone")}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            maxLength={40}
            placeholder={copy.phone.placeholder}
            defaultValue={v.phone}
            aria-invalid={err.phone ? true : undefined}
            aria-describedby={describe("phone")}
            className={styles.input}
          />
          <FieldError id={id("phone-error")} msg={err.phone} />
        </div>
      )}

      {/* Website (optional) */}
      <div className={styles.field}>
        <label htmlFor={id("website")} className={styles.label}>
          {copy.website.label} <span className={styles.optional}>({copy.website.optional})</span>
        </label>
        <input
          id={id("website")}
          name="website"
          type="text"
          inputMode="url"
          autoComplete="url"
          maxLength={300}
          placeholder={copy.website.placeholder}
          defaultValue={v.website}
          aria-invalid={err.website ? true : undefined}
          aria-describedby={describe("website", true)}
          className={styles.input}
        />
        <p id={id("website-hint")} className={styles.hint}>
          {copy.website.hint}
        </p>
        <FieldError id={id("website-error")} msg={err.website} />
      </div>

      {/* Message */}
      <div className={styles.field}>
        <label htmlFor={id("message")} className={styles.label}>
          {copy.message.label}
        </label>
        <textarea
          id={id("message")}
          name="message"
          required
          rows={5}
          maxLength={4000}
          placeholder={copy.message.placeholder}
          defaultValue={v.message}
          aria-invalid={err.message ? true : undefined}
          aria-describedby={describe("message")}
          className={styles.textarea}
        />
        <FieldError id={id("message-error")} msg={err.message} />
      </div>

      <button type="submit" className={styles.submit} disabled={pending} aria-disabled={pending}>
        {pending ? (
          <>
            <TbLoader2 className={styles.spin} aria-hidden="true" />
            {copy.sending}
          </>
        ) : (
          <>
            {copy.submit}
            <TbArrowRight className={styles.arrow} aria-hidden="true" />
          </>
        )}
      </button>

      <p className={styles.privacy}>
        <RichText text={copy.privacy} />
      </p>
    </form>
  );
}

function FieldError({ id, msg }: { id: string; msg?: string }) {
  if (!msg) return null;
  return (
    <p id={id} className={styles.error}>
      <TbAlertCircle aria-hidden="true" />
      {msg}
    </p>
  );
}
