"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { TbAlertTriangle, TbArrowLeft, TbArrowRight, TbCheck } from "react-icons/tb";
import { applyCopy, type ApplyLang } from "@/content/demo";
import styles from "./ApplyDemo.module.css";

type Application = { role: string; times: string[]; name: string; phone: string; lang: ApplyLang };

type Props = {
  initialLang?: ApplyLang;
  /**
   * DEMO: leave this undefined so nothing is ever sent or stored.
   * CLIENT SITES: pass a handler that posts to your API route (text + email alert, sheet row).
   */
  onSubmit?: (application: Application) => void | Promise<void>;
};

const TOTAL = 3;

/** Three-step caregiver application. Switching language keeps every answer. */
export function ApplyDemo({ initialLang = "en", onSubmit }: Props) {
  const [lang, setLang] = useState<ApplyLang>(initialLang);
  const [step, setStep] = useState(0); // 0..2 = questions, 3 = done
  const [role, setRole] = useState<number | null>(null);
  const [times, setTimes] = useState<number[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const c = applyCopy[lang];

  // Move focus to the new question so keyboard and screen reader users follow along.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const clearError = () => setError("");

  const toggleTime = (i: number) => {
    clearError();
    setTimes((prev) => (prev.includes(i) ? prev.filter((t) => t !== i) : [...prev, i]));
  };

  const handleNext = async (e: FormEvent) => {
    e.preventDefault();
    if (step === 0 && role === null) return setError(c.needRole);
    if (step === 1 && times.length === 0) return setError(c.needTime);
    if (step === 2) {
      if (!name.trim()) return setError(c.needName);
      if (phone.replace(/\D/g, "").length !== 10) return setError(c.needPhone);
      if (onSubmit && role !== null) {
        await onSubmit({ role: c.roles[role], times: times.map((t) => c.times[t]), name: name.trim(), phone, lang });
      }
    }
    clearError();
    setStep((s) => s + 1);
  };

  const reset = () => {
    setStep(0);
    setRole(null);
    setTimes([]);
    setName("");
    setPhone("");
    clearError();
  };

  const langToggle = (
    <div className={styles.lang} role="group" aria-label="Language / Idioma">
      {(["en", "es"] as const).map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={lang === l}
          onClick={() => {
            setLang(l);
            clearError();
          }}
        >
          {l === "en" ? "English" : "Español"}
        </button>
      ))}
    </div>
  );

  if (step >= TOTAL) {
    return (
      <div className={styles.card} lang={lang}>
        <div className={styles.done} aria-live="polite">
          <svg className={styles.check} viewBox="0 0 64 64" aria-hidden="true">
            <circle cx="32" cy="32" r="28" />
            <path d="M21 33l7 7l15 -15" />
          </svg>
          <h3 ref={headingRef} tabIndex={-1} className={styles.question}>
            {c.doneTitle}
          </h3>
          <p className={styles.doneBody}>{c.doneBody}</p>
          <button type="button" className={styles.linkButton} onClick={reset}>
            {c.again}
          </button>
        </div>
      </div>
    );
  }

  const questions = [c.q1, c.q2, c.q3];
  const errorId = "apply-error";

  return (
    <form className={styles.card} lang={lang} onSubmit={handleNext} noValidate>
      <div className={styles.top}>
        <span className={styles.stepLabel}>{c.step(step + 1, TOTAL)}</span>
        {langToggle}
      </div>
      <div className={styles.track} aria-hidden="true">
        <div className={styles.fill} style={{ transform: `scaleX(${(step + 1) / TOTAL})` }} />
      </div>

      <div className={styles.body} key={`${step}-${lang}`}>
        <h3 ref={headingRef} tabIndex={-1} className={styles.question} id="apply-question">
          {questions[step]}
        </h3>

        {step === 0 ? (
          <fieldset className={styles.options} aria-labelledby="apply-question" aria-describedby={error ? errorId : undefined}>
            {c.roles.map((r, i) => (
              <label key={r} className={styles.option} data-checked={role === i}>
                <input
                  type="radio"
                  name="role"
                  checked={role === i}
                  onChange={() => {
                    setRole(i);
                    clearError();
                  }}
                />
                <span className={styles.radio} aria-hidden="true" />
                {r}
              </label>
            ))}
          </fieldset>
        ) : null}

        {step === 1 ? (
          <fieldset className={styles.options} aria-labelledby="apply-question" aria-describedby={error ? errorId : undefined}>
            <p className={styles.hint}>{c.q2Hint}</p>
            {c.times.map((t, i) => (
              <label key={t} className={styles.option} data-checked={times.includes(i)}>
                <input type="checkbox" checked={times.includes(i)} onChange={() => toggleTime(i)} />
                <span className={styles.box} aria-hidden="true">
                  {times.includes(i) ? <TbCheck /> : null}
                </span>
                {t}
              </label>
            ))}
          </fieldset>
        ) : null}

        {step === 2 ? (
          <div className={styles.fields}>
            <div className={styles.field}>
              <label htmlFor="apply-name">{c.name}</label>
              <input
                id="apply-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setName(e.target.value);
                  clearError();
                }}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="apply-phone">{c.phone}</label>
              <span className={styles.hint} id="apply-phone-hint">
                {c.phoneHint}
              </span>
              <input
                id="apply-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                aria-describedby="apply-phone-hint"
                value={phone}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setPhone(e.target.value);
                  clearError();
                }}
              />
            </div>
          </div>
        ) : null}

        {error ? (
          <p className={styles.error} id={errorId} role="alert">
            <TbAlertTriangle aria-hidden="true" />
            {error}
          </p>
        ) : null}

        <div className={styles.actions}>
          {step > 0 ? (
            <button
              type="button"
              className={styles.back}
              onClick={() => {
                clearError();
                setStep((s) => s - 1);
              }}
            >
              <TbArrowLeft aria-hidden="true" />
              {c.back}
            </button>
          ) : (
            <span />
          )}
          <button type="submit" className={styles.next}>
            {step < 2 ? c.next : c.send}
            {step < 2 ? <TbArrowRight aria-hidden="true" /> : null}
          </button>
        </div>
      </div>
    </form>
  );
}
