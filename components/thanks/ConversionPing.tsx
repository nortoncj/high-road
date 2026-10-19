"use client";

import { useEffect } from "react";
import type { ThanksKind } from "@/content/thanks";

type Win = Window & {
  dataLayer?: Record<string, unknown>[];
  gtag?: (...args: unknown[]) => void;
};

/**
 * Fires one conversion event when a thank-you page loads, so ads and analytics can count leads.
 * Works with Google Tag Manager (dataLayer) or plain GA4 (gtag); does nothing if neither is on the page.
 * The session flag stops a refresh from counting the same lead twice.
 */
export function ConversionPing({ kind }: { kind: ThanksKind }) {
  useEffect(() => {
    const key = `wtn-conversion-${kind}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Private mode or storage blocked: still send, a rare double count beats none.
    }
    const w = window as Win;
    const payload = { lead_type: kind === "booked" ? "call_booked" : "message" };
    w.dataLayer?.push({ event: "generate_lead", ...payload });
    w.gtag?.("event", "generate_lead", payload);
  }, [kind]);

  return null;
}
