"use client";

import { useActionState } from "react";
import { TbMailCheck } from "react-icons/tb";
import { sendMagicLink, type LoginState } from "./actions";
import styles from "./Admin.module.css";

const initial: LoginState = {};

/** One email field. Sends a magic link if it's the admin email. */
export function LoginForm() {
  const [state, action, pending] = useActionState(sendMagicLink, initial);

  if (state.sent) {
    return (
      <p className={styles.sent} role="status">
        <TbMailCheck aria-hidden="true" />
        If that's the admin email, a login link is on its way. Check your inbox.
      </p>
    );
  }

  return (
    <form action={action} className={styles.loginForm}>
      <label htmlFor="admin-email" className={styles.label}>
        Email
      </label>
      <input
        id="admin-email"
        name="email"
        type="email"
        autoComplete="email"
        required
        className={styles.input}
      />
      {state.error ? (
        <p className={styles.loginError} role="alert">
          {state.error}
        </p>
      ) : null}
      <button type="submit" className={styles.primary} disabled={pending}>
        {pending ? "Sending..." : "Email me a login link"}
      </button>
    </form>
  );
}
