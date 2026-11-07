"use client";

import { useRef, useState } from "react";
import { TbArrowLeft, TbArrowRight } from "react-icons/tb";
import { caseStudyPage } from "@/content/case-study";
import type { PlanStep } from "@/lib/sanity/types";
import styles from "./CaseStudy.module.css";

const copy = caseStudyPage.plan;

/** Numbered steps on the left, the picked step's "what I did / why it matters" on the right. */
export function ActionPlan({ steps }: { steps: PlanStep[] }) {
  const [current, setCurrent] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const step = steps[current];
  const n = steps.length;

  const go = (i: number, focusPanel = false) => {
    setCurrent(Math.max(0, Math.min(n - 1, i)));
    if (focusPanel) panelRef.current?.focus({ preventScroll: true });
  };

  return (
    <div className={styles.plan}>
      <ol className={styles.steps}>
        {steps.map((s, i) => (
          <li key={s._key}>
            <button
              type="button"
              className={styles.step}
              aria-pressed={i === current}
              aria-controls="plan-panel"
              onClick={() => go(i)}
            >
              <span className={styles.stepNum}>{i + 1}</span>
              <span className={styles.stepText}>
                <span className={styles.stepTitle}>{s.title}</span>
                {s.short ? <span className={styles.stepShort}>{s.short}</span> : null}
              </span>
            </button>
          </li>
        ))}
      </ol>

      <div id="plan-panel" ref={panelRef} tabIndex={-1} className={styles.panel} aria-live="polite" key={step._key}>
        <span className={styles.panelRule} aria-hidden="true" />
        <p className={styles.panelStep}>{copy.stepOf(current + 1, n)}</p>
        <h3 className={styles.panelTitle}>{step.title}</h3>
        <div className={styles.panelCols}>
          {step.did ? (
            <div>
              <p className={styles.panelLabel}>{copy.did}</p>
              <p className={styles.panelText}>{step.did}</p>
            </div>
          ) : null}
          {step.why ? (
            <div className={styles.why}>
              <p className={styles.panelLabel}>{copy.why}</p>
              <p className={styles.panelText}>{step.why}</p>
            </div>
          ) : null}
        </div>
        {n > 1 ? (
          <div className={styles.panelNav}>
            <button type="button" onClick={() => go(current - 1, true)} disabled={current === 0}>
              <TbArrowLeft aria-hidden="true" />
              {copy.prev}
            </button>
            <button type="button" onClick={() => go(current + 1, true)} disabled={current === n - 1}>
              {copy.next}
              <TbArrowRight aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
