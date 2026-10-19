"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type TouchEvent,
} from "react";
import type { IconType } from "react-icons";
import {
  TbArrowLeft,
  TbArrowRight,
  TbBrowser,
  TbChartLine,
  TbCheck,
  TbMapPin,
  TbPhoneCall,
} from "react-icons/tb";
import { processSection, type ProcessStep } from "@/content/home";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./Process.module.css";

const icons: Record<ProcessStep["icon"], IconType> = {
  call: TbPhoneCall,
  browser: TbBrowser,
  pin: TbMapPin,
  chart: TbChartLine,
};

const SWIPE_MIN = 48;

/**
 * Four steps as tabs: pick one, its detail and checklist show below. All four fit on one row
 * at every width. While in view the steps cycle on their own (the active tab's top bar fills
 * as a timer); any tap, swipe or key press hands control to the visitor and stops the cycle.
 * Reduced-motion users never auto-cycle because the timer animation never runs.
 */
export function Process() {
  const { steps } = processSection;
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const [inView, setInView] = useState(false);
  const [hovered, setHovered] = useState(false);
  const id = useId();
  const section = useRef<HTMLElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const touch = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.4,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const go = (i: number) => {
    setAuto(false);
    setActive((i + steps.length) % steps.length);
  };

  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (active + dir + steps.length) % steps.length;
    go(next);
    tabs.current[next]?.focus();
  };

  const onTouchStart = (e: TouchEvent) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchEnd = (e: TouchEvent) => {
    const start = touch.current;
    touch.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < SWIPE_MIN || Math.abs(dx) < Math.abs(dy)) return;
    go(active + (dx < 0 ? 1 : -1));
  };

  const onHover = (over: boolean) => (e: PointerEvent) => {
    if (e.pointerType === "mouse") setHovered(over);
  };

  const step = steps[active];
  const Icon = icons[step.icon];

  return (
    <section
      ref={section}
      id="how"
      className={styles.section}
      aria-labelledby="process-heading"
      data-auto={auto || undefined}
      data-paused={!inView || hovered || undefined}
      onPointerEnter={onHover(true)}
      onPointerLeave={onHover(false)}
    >
      <div className="container">
        <header className={styles.header}>
          <Eyebrow>{processSection.eyebrow}</Eyebrow>
          <h2 id="process-heading" className={styles.heading}>
            {processSection.heading}
          </h2>
          <p className={styles.lead}>{processSection.body}</p>
        </header>

        <div role="tablist" aria-label="Steps" className={styles.tabs}>
          {steps.map((s, i) => {
            const TabIcon = icons[s.icon];
            return (
              <button
                key={s.title}
                ref={(el: HTMLButtonElement | null) => {
                  tabs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`${id}-tab-${i}`}
                aria-selected={i === active}
                aria-controls={`${id}-panel`}
                tabIndex={i === active ? 0 : -1}
                className={styles.tab}
                onClick={() => go(i)}
                onKeyDown={onKey}
              >
                {auto && i === active && (
                  <span
                    key={active}
                    className={styles.timer}
                    aria-hidden="true"
                    onAnimationEnd={() => setActive((active + 1) % steps.length)}
                  />
                )}
                <TabIcon className={styles.tabIcon} aria-hidden="true" />
                <span className={styles.num}>Step {String(i + 1).padStart(2, "0")}</span>
                <span className={styles.tabTitle}>{s.title}</span>
              </button>
            );
          })}
        </div>

        <div
          id={`${id}-panel`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${active}`}
          className={styles.panel}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div key={`copy-${active}`} className={styles.copy}>
            <Icon className={styles.icon} aria-hidden="true" />
            <h3 className={styles.title}>{step.title}</h3>
            <p className={styles.body}>{step.body}</p>
          </div>
          <ul key={`list-${active}`} className={styles.checklist}>
            {step.checklist.map((line) => (
              <li key={line}>
                <TbCheck aria-hidden="true" />
                {line}
              </li>
            ))}
          </ul>
          <div className={styles.pager}>
            <button
              type="button"
              className={styles.pagerBtn}
              aria-label="Previous step"
              aria-controls={`${id}-panel`}
              onClick={() => go(active - 1)}
            >
              <TbArrowLeft aria-hidden="true" />
            </button>
            <span className={styles.count}>
              {active + 1} of {steps.length}
            </span>
            <button
              type="button"
              className={styles.pagerBtn}
              aria-label="Next step"
              aria-controls={`${id}-panel`}
              onClick={() => go(active + 1)}
            >
              <TbArrowRight aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
