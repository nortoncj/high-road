"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

type Props = { name: string; params?: Record<string, string> };

/** Fires one GA4 event when the page loads. Renders nothing. Guarded so dev mode doesn't double count. */
export function TrackEvent({ name, params }: Props) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    window.gtag?.("event", name, params ?? {});
  }, [name, params]);

  return null;
}
