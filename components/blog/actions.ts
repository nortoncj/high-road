"use server";

import { headers } from "next/headers";
import { newsletter } from "@/content/blog";
import { allow } from "@/lib/rate-limit";

export type SubscribeState = { ok?: boolean; error?: string; email?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Adds the email to the Brevo list in BREVO_NEWSLETTER_LIST_ID. Re-subscribing an existing contact is fine. */
export async function subscribe(_prev: SubscribeState, fd: FormData): Promise<SubscribeState> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();

  // Honeypot: bots get a fake success and nothing is sent.
  if (String(fd.get("company") ?? "")) return { ok: true };

  if (!EMAIL_RE.test(email) || email.length > 254) return { error: newsletter.errors.email, email };

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  if (!allow(`newsletter:${ip}`)) return { error: newsletter.errors.rateLimited, email };

  const apiKey = process.env.BREVO_API_KEY;
  const listId = Number(process.env.BREVO_NEWSLETTER_LIST_ID);
  if (!apiKey || !listId) {
    console.error("[newsletter] BREVO_API_KEY or BREVO_NEWSLETTER_LIST_ID missing");
    return { error: newsletter.errors.server, email };
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: { "api-key": apiKey, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ email, listIds: [listId], updateEnabled: true }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.error("[newsletter] Brevo rejected", res.status, await res.text());
      return { error: newsletter.errors.server, email };
    }
  } catch (err) {
    console.error("[newsletter] Brevo request failed", err);
    return { error: newsletter.errors.server, email };
  }

  return { ok: true };
}
