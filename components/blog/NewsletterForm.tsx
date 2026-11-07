"use client";

import { useActionState, useId } from "react";
import { TbAlertCircle, TbCircleCheck, TbLoader2 } from "react-icons/tb";
import posthog from "posthog-js";
import { newsletter as copy } from "@/content/blog";
import { subscribe, type SubscribeState } from "./actions";
import styles from "./Newsletter.module.css";

const initial: SubscribeState = {};

/** One email field. Shows the confirmation in place instead of leaving the page. */
export function NewsletterForm({ variant, where }: { variant: "band" | "rail"; where: string }) {
  const [state, action, pending] = useActionState(subscribe, initial);
  const uid = useId();

  if (state.ok) {
    return (
      <p className={styles.success} role="status">
        <TbCircleCheck aria-hidden="true" />
        {copy.success}
      </p>
    );
  }

  return (
    <form
      action={action}
      onSubmit={() => posthog.capture("newsletter_signup_attempted", { where })}
      className={`${styles.form} ${variant === "rail" ? styles.formRail : ""}`}
    >
      {/* Honeypot: hidden from people and screen readers, irresistible to bots. */}
      <div className={styles.trap} aria-hidden="true">
        <label htmlFor={`${uid}-company`}>Company</label>
        <input id={`${uid}-company`} name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div className={styles.field}>
        <label htmlFor={`${uid}-email`} className={styles.label}>
          {copy.email.label}
        </label>
        <input
          id={`${uid}-email`}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          maxLength={254}
          placeholder={copy.email.placeholder}
          defaultValue={state.email}
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? `${uid}-error` : undefined}
          className={styles.input}
        />
      </div>
      <button type="submit" className={styles.submit} disabled={pending}>
        {pending ? <TbLoader2 className={styles.spin} aria-hidden="true" /> : null}
        {pending ? copy.sending : variant === "rail" ? copy.railSubmit : copy.submit}
      </button>
      {state.error ? (
        <p id={`${uid}-error`} className={styles.error} role="alert">
          <TbAlertCircle aria-hidden="true" />
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
