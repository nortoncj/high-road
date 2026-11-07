"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import { TbAlertCircle, TbArrowRight, TbLoader2 } from "react-icons/tb";
import posthog from "posthog-js";
import { formCheck as copy } from "@/content/blog";
import { submitLead, type ContactState, type Field } from "@/components/contact/actions";
import styles from "./FormCheck.module.css";

const initial: ContactState = {};
const FIELD_ORDER: Field[] = ["name", "email", "website"];

/**
 * "I'll test your form" request. Goes through the same lead pipeline as the contact form
 * (Brevo alert + Supabase row, then /thanks/message), saved as a "contact" lead with the post in the message.
 */
export function FormCheckForm({ postTitle }: { postTitle: string }) {
  const [state, action, pending] = useActionState(submitLead, initial);
  const startedRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const uid = useId();
  const id = (f: string) => `${uid}-${f}`;

  // Timestamp for the "too fast to be human" check. Set after mount to avoid a hydration mismatch.
  useEffect(() => {
    if (startedRef.current) startedRef.current.value = String(Date.now());
  }, []);

  useEffect(() => {
    const first = FIELD_ORDER.find((f) => state.errors?.[f]);
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  }, [state.errors]);

  const v = state.values ?? {};
  const err = state.errors ?? {};

  return (
    <form
      ref={formRef}
      action={action}
      onSubmit={() => posthog.capture("lead_form_submit_attempted", { source: "form-check", post: postTitle })}
      className={styles.form}
    >
      <input type="hidden" name="source" value="contact" />
      <input type="hidden" name="method" value="email" />
      <input type="hidden" name="message" value={copy.message(postTitle)} />
      <input ref={startedRef} type="hidden" name="startedAt" defaultValue="" />
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

      <Input id={id("name")} name="name" label={copy.name.label} placeholder={copy.name.placeholder} autoComplete="name" defaultValue={v.name} error={err.name} />
      <Input
        id={id("email")}
        name="email"
        type="email"
        label={copy.email.label}
        placeholder={copy.email.placeholder}
        autoComplete="email"
        defaultValue={v.email}
        error={err.email}
      />
      <Input
        id={id("website")}
        name="website"
        label={copy.website.label}
        placeholder={copy.website.placeholder}
        autoComplete="url"
        inputMode="url"
        defaultValue={v.website}
        error={err.website}
      />

      <button type="submit" className={styles.submit} disabled={pending}>
        {pending ? <TbLoader2 className={styles.spin} aria-hidden="true" /> : null}
        <span>{pending ? copy.sending : copy.submit}</span>
        {pending ? null : <TbArrowRight className={styles.arrow} aria-hidden="true" />}
      </button>
    </form>
  );
}

type InputProps = {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  autoComplete: string;
  type?: string;
  inputMode?: "url" | "email";
  defaultValue?: string;
  error?: string;
};

function Input({ id, name, label, placeholder, autoComplete, type = "text", inputMode, defaultValue, error }: InputProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        required
        maxLength={name === "website" ? 300 : name === "email" ? 254 : 120}
        placeholder={placeholder}
        defaultValue={defaultValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={styles.input}
      />
      {error ? (
        <p id={`${id}-error`} className={styles.fieldError}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
