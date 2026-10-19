"use client";

import { Suspense, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { TbCalendarEvent, TbMessage, TbMessageCircle, TbPhone } from "react-icons/tb";
import { book } from "@/content/book";
import { site } from "@/content/home";
import { CalendlyEmbed } from "./CalendlyEmbed";
import { ContactForm } from "./ContactForm";
import styles from "./BookTabs.module.css";

type Tab = "calendar" | "message";
const TABS: Tab[] = ["calendar", "message"];

const smsHref = site.phoneHref.replace(/^tel:/, "sms:");

/**
 * Calendar and message form as two tabs in one card. Only one is on screen at a time, so the
 * calendar resizing itself can never push the form around. Both stay mounted, so switching
 * back doesn't reload Calendly. `/book#message` opens straight to the form.
 */
export function BookTabs() {
  const id = useId();
  const [tab, setTab] = useState<Tab>("calendar");
  const refs = useRef<Record<Tab, HTMLButtonElement | null>>({ calendar: null, message: null });

  useEffect(() => {
    const fromHash = () => setTab(window.location.hash === "#message" ? "message" : "calendar");
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  const select = (t: Tab) => {
    setTab(t);
    // Keep the URL shareable without adding history entries or jumping the page.
    window.history.replaceState(null, "", t === "message" ? "#message" : window.location.pathname + window.location.search);
  };

  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = TABS[(TABS.indexOf(tab) + 1) % TABS.length];
    select(next);
    refs.current[next]?.focus();
  };

  const icons = { calendar: TbCalendarEvent, message: TbMessage };

  return (
    <div className={styles.card}>
      <div role="tablist" aria-label={book.tabs.label} className={styles.tablist}>
        {TABS.map((t) => {
          const Icon = icons[t];
          return (
            <button
              key={t}
              ref={(el: HTMLButtonElement | null) => {
                refs.current[t] = el;
              }}
              type="button"
              role="tab"
              id={`${id}-tab-${t}`}
              aria-selected={tab === t}
              aria-controls={`${id}-panel-${t}`}
              tabIndex={tab === t ? 0 : -1}
              className={styles.tab}
              onClick={() => select(t)}
              onKeyDown={onKey}
            >
              <Icon aria-hidden="true" />
              {book.tabs[t]}
            </button>
          );
        })}
        <span className={styles.thumb} data-pos={tab} aria-hidden="true" />
      </div>

      <div
        id={`${id}-panel-calendar`}
        role="tabpanel"
        aria-labelledby={`${id}-tab-calendar`}
        hidden={tab !== "calendar"}
        className={styles.panel}
      >
        <Suspense fallback={null}>
          <CalendlyEmbed />
        </Suspense>
        <div className={styles.under}>
          <p>{book.underCalendar}</p>
          <div className={styles.contactLinks}>
            <span className={styles.ctaLabel}>{book.underCalendarCta}:</span>
            <a href={site.phoneHref} className={styles.contactLink}>
              <TbPhone aria-hidden="true" />
              <span className={styles.mono}>{site.phone}</span>
            </a>
            <a href={smsHref} className={styles.contactLink}>
              <TbMessageCircle aria-hidden="true" />
              Text
            </a>
            <button type="button" className={styles.switchLink} onClick={() => select("message")}>
              or send a message
            </button>
          </div>
        </div>
      </div>

      <div
        id={`${id}-panel-message`}
        role="tabpanel"
        aria-labelledby={`${id}-tab-message`}
        hidden={tab !== "message"}
        className={styles.panel}
      >
        <ContactForm />
      </div>
    </div>
  );
}
