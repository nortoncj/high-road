"use client";

import { useId, useMemo, useSyncExternalStore, type CSSProperties } from "react";
import { TbCheck } from "react-icons/tb";
import { blocks } from "@/content/blog";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./Checklist.module.css";

type ChecklistProps = {
  id?: string;
  /** localStorage key, so ticks survive a reload on this device. */
  storageKey: string;
  eyebrow?: string;
  heading?: string;
  items: string[];
  doneMessage?: string;
};

// Ticks live in localStorage. This tiny store lets React read them without a hydration mismatch
// (the server snapshot is "nothing ticked") and keeps two lists on one page in sync.
const CHANGE = "wtn:checklist";
const memory = new Map<string, string>();

const read = (key: string) => {
  try {
    return localStorage.getItem(key) ?? memory.get(key) ?? null;
  } catch {
    return memory.get(key) ?? null;
  }
};

const write = (key: string, value: string) => {
  memory.set(key, value);
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private mode or blocked storage: ticks last until the page reloads.
  }
  window.dispatchEvent(new Event(CHANGE));
};

const subscribe = (onChange: () => void) => {
  window.addEventListener(CHANGE, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE, onChange);
    window.removeEventListener("storage", onChange);
  };
};

/** "Tick these off this week." Real checkboxes, a progress bar, and ticks remembered per post. */
export function Checklist({ id, storageKey, eyebrow, heading, items, doneMessage }: ChecklistProps) {
  const uid = useId();
  const key = `checklist:${storageKey}`;
  const saved = useSyncExternalStore(subscribe, () => read(key), () => null);

  const done = useMemo(() => {
    try {
      const parsed: unknown = JSON.parse(saved ?? "null");
      return items.map((_, i) => Array.isArray(parsed) && Boolean(parsed[i]));
    } catch {
      return items.map(() => false);
    }
  }, [saved, items]);

  const toggle = (i: number) => write(key, JSON.stringify(done.map((d, j) => (j === i ? !d : d))));

  const count = done.filter(Boolean).length;
  const pct = Math.round((count / items.length) * 100);

  return (
    <section id={id} className={styles.box} aria-labelledby={`${uid}-heading`}>
      <div className={styles.head}>
        <div className={styles.titles}>
          <Eyebrow>{eyebrow || blocks.checklist.eyebrow}</Eyebrow>
          <h2 id={`${uid}-heading`} className={styles.heading}>
            {heading || blocks.checklist.heading}
          </h2>
        </div>
        <span className={styles.count} aria-live="polite">
          {blocks.checklist.done(count, items.length)}
        </span>
      </div>
      <div className={styles.track} aria-hidden="true">
        <span className={styles.fill} style={{ "--pct": `${pct}%` } as CSSProperties} />
      </div>
      <ul className={styles.list}>
        {items.map((label, i) => (
          <li key={`${i}-${label}`}>
            <label className={styles.task} data-done={done[i]}>
              <input type="checkbox" checked={done[i]} onChange={() => toggle(i)} className={styles.input} />
              <span className={styles.box2} aria-hidden="true">
                <TbCheck />
              </span>
              <span className={styles.label}>{label}</span>
            </label>
          </li>
        ))}
      </ul>
      {count === items.length ? (
        <p className={styles.allDone} role="status">
          {doneMessage || blocks.checklist.allDone}
        </p>
      ) : null}
    </section>
  );
}
