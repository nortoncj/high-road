"use client";

import { useEffect } from "react";
import { TbCalendarCheck } from "react-icons/tb";
import styles from "./CalendarEmbed.module.css";

type Props = {
  /** Your scheduling page URL (Calendly, Cal.com, Google Calendar booking page, etc.). Empty shows a placeholder. */
  src: string;
  title: string;
  placeholderHeading: string;
  placeholderBody: string;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Lazy-loaded scheduling iframe.
 * Fires a GA4 "book_call" event when a booking completes. Calendly and Cal.com
 * both post a message to the page; anything else can call window.gtag itself.
 */
export function CalendarEmbed({ src, title, placeholderHeading, placeholderBody }: Props) {
  useEffect(() => {
    if (!src) return;
    const onMessage = (e: MessageEvent) => {
      const data = e.data as { event?: string; type?: string } | null;
      const booked =
        data?.event === "calendly.event_scheduled" || // Calendly
        data?.type === "bookingSuccessful" || // Cal.com
        data?.type === "booking_successful";
      if (booked) window.gtag?.("event", "book_call", { method: "calendar" });
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [src]);

  if (!src) {
    return (
      <div className={styles.placeholder}>
        <TbCalendarCheck className={styles.placeholderIcon} aria-hidden="true" />
        <p className={styles.placeholderHeading}>{placeholderHeading}</p>
        <p className={styles.placeholderBody}>{placeholderBody}</p>
      </div>
    );
  }

  // Calendly: hide its cookie banner and match the brand colors.
  const url = src.includes("calendly.com")
    ? `${src}${src.includes("?") ? "&" : "?"}hide_gdpr_banner=1&primary_color=1f5c63&background_color=ffffff&text_color=211c16`
    : src;

  return (
    <div className={styles.frame}>
      <iframe src={url} title={title} loading="lazy" className={styles.iframe} />
    </div>
  );
}
