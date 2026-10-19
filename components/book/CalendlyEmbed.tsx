"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { TbArrowUpRight, TbCalendarEvent } from "react-icons/tb";
import { book } from "@/content/book";
import styles from "./CalendlyEmbed.module.css";

const CALENDLY_ORIGIN = "https://calendly.com";
const START_HEIGHT = 680; // close to Calendly's first screen, so the page barely moves when it loads

type CalendlyMessage = {
  event?: string;
  payload?: { height?: string };
};

/**
 * Calendly inline embed that sizes itself to its content.
 *
 * Calendly posts `calendly.page_height` to the parent page whenever its content changes
 * (date picked, form step, confirmation). We set the iframe to exactly that height, so there's
 * no scrollbar inside the frame and nothing below it jumps around.
 * Those messages only fire when the URL carries embed_domain and embed_type, which we add here.
 */
export function CalendlyEmbed() {
  const cfg = book.calendar;
  const router = useRouter();
  const params = useSearchParams();
  const [src, setSrc] = useState<string | null>(null);
  const [height, setHeight] = useState(START_HEIGHT);
  const [ready, setReady] = useState(false);
  const [slow, setSlow] = useState(false);
  const scheduled = useRef(false);

  // Carry the pricing page's package choice into Calendly as UTM fields. They show up on the
  // booking and in the webhook payload your Supabase lead insert receives.
  const utm = useMemo((): Record<string, string> => {
    const pkg = params.get("package");
    const billing = params.get("billing");
    const topic = params.get("topic");
    return {
      utm_source: "website",
      utm_medium: "book_page",
      utm_campaign: topic ?? "free-call",
      ...(pkg ? { utm_content: billing ? `${pkg}-${billing}` : pkg } : {}),
    };
  }, [params]);

  // Build the URL after mount: embed_domain has to be the real host.
  useEffect(() => {
    if (!cfg.src) return;
    const url = new URL(cfg.src);
    const set = (k: string, v: string) => url.searchParams.set(k, v);
    set("embed_domain", window.location.host);
    set("embed_type", "Inline");
    set("hide_gdpr_banner", "1");
    set("hide_event_type_details", "1"); // the left column already explains the call
    set("background_color", cfg.colors.background);
    set("text_color", cfg.colors.text);
    set("primary_color", cfg.colors.primary);
    Object.entries(utm).forEach(([k, v]) => set(k, v));
    setSrc(url.toString());
  }, [cfg.src, cfg.colors, utm]);

  // Listen to Calendly: resize, mark ready, redirect after booking.
  useEffect(() => {
    const onMessage = (e: MessageEvent<CalendlyMessage>) => {
      if (e.origin !== CALENDLY_ORIGIN || !e.data?.event?.startsWith("calendly.")) return;
      const { event, payload } = e.data;

      if (event === "calendly.page_height" && payload?.height) {
        const h = parseInt(payload.height, 10);
        if (Number.isFinite(h) && h > 200) setHeight(h);
        setReady(true);
      }
      if (event === "calendly.event_type_viewed") setReady(true);
      if (event === "calendly.event_scheduled" && !scheduled.current) {
        scheduled.current = true;
        window.setTimeout(() => router.push(cfg.afterBookingHref), 1500);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [router, cfg.afterBookingHref]);

  // If Calendly hasn't spoken after 8 seconds, offer the direct link.
  useEffect(() => {
    if (!src || ready) return;
    const id = window.setTimeout(() => setSlow(true), 8000);
    return () => window.clearTimeout(id);
  }, [src, ready]);

  if (!cfg.src) {
    return (
      <div className={styles.placeholder}>
        <TbCalendarEvent aria-hidden="true" />
        <p className={styles.placeholderHeading}>{cfg.placeholderHeading}</p>
        <p>{cfg.placeholderBody}</p>
      </div>
    );
  }

  return (
    <div className={styles.wrap} style={{ height }} data-ready={ready}>
      {!ready ? (
        <div className={styles.skeleton} role="status">
          <span className="visually-hidden">{cfg.loading}</span>
          <div className={styles.skHead} aria-hidden="true" />
          <div className={styles.skGrid} aria-hidden="true">
            {Array.from({ length: 35 }, (_, i) => (
              <span key={i} data-on={[9, 10, 13, 16, 17, 20, 23, 24].includes(i)} />
            ))}
          </div>
          {slow ? (
            <p className={styles.slow}>
              {cfg.slow}{" "}
              <a href={cfg.src} target="_blank" rel="noopener noreferrer">
                {cfg.slowCta}
                <TbArrowUpRight aria-hidden="true" />
              </a>
            </p>
          ) : null}
        </div>
      ) : null}

      {src ? (
        <iframe
          src={src}
          title={cfg.title}
          className={styles.frame}
          loading="lazy"
          allow="payment"
          // Height comes from Calendly's own messages, so the frame never needs to scroll.
          scrolling="no"
        />
      ) : null}
    </div>
  );
}
