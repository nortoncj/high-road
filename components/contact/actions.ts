"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { contactForm } from "@/content/contact";
import { sendLeadAlert, type LeadForEmail } from "@/lib/brevo";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { allow } from "@/lib/rate-limit";
import { flushPostHogLogs, logLeadSubmissionAccepted, logLeadSubmissionProcessed } from "@/lib/posthog-logs";

export type Field = "name" | "email" | "phone" | "message" | "website" | "business";

export type ContactState = {
  errors?: Partial<Record<Field, string>>;
  formError?: string;
  /** Echoed back so the form keeps what they typed when there's an error. */
  values?: Record<string, string>;
};

const SOURCES = new Set(["contact", "book", "home"]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

export async function submitLead(_prev: ContactState, fd: FormData): Promise<ContactState> {
  const source = SOURCES.has(str(fd, "source")) ? (str(fd, "source") as "contact" | "book" | "home") : "contact";
  const values = {
    name: str(fd, "name"),
    method: str(fd, "method") === "phone" ? "phone" : "email",
    email: str(fd, "email"),
    phone: str(fd, "phone"),
    website: str(fd, "website"),
    message: str(fd, "message"),
    business: str(fd, "business"),
  };

  // The homepage form has one "phone or email" box and no message, so fill those in here.
  if (source === "home") {
    const contact = str(fd, "contact");
    const isEmail = contact.includes("@");
    values.method = isEmail ? "email" : "phone";
    values.email = isEmail ? contact : "";
    values.phone = isEmail ? "" : contact;
    values.message = values.business ? `New lead\nBusiness: ${values.business}` : "New lead";
  }

  // ---- Spam traps: bots get a fake success and nothing is saved. ----
  const honeypot = str(fd, "company");
  const startedAt = Number(str(fd, "startedAt"));
  const tooFast = Number.isFinite(startedAt) && Date.now() - startedAt < 2500;
  if (honeypot || tooFast) redirect("/thanks/message");

  // ---- Rate limit by IP (Nginx must pass X-Forwarded-For) ----
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  if (!allow(`lead:${ip}`)) return { formError: contactForm.errors.rateLimited, values };

  // ---- Validate ----
  const e = contactForm.errors;
  const errors: ContactState["errors"] = {};
  if (!values.name) errors.name = e.name;
  else if (values.name.length > 120) errors.name = e.tooLong;

  if (values.method === "email" && !EMAIL_RE.test(values.email)) errors.email = e.email;
  if (values.method === "phone") {
    const digits = values.phone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 15) errors.phone = e.phone;
  }
  // Keep the other field too if they filled it in and it's valid.
  if (values.email && values.email.length > 254) errors.email = e.tooLong;

  if (values.website.length > 300) errors.website = e.tooLong;

  if (source === "home" && !values.business) errors.business = e.business;
  else if (values.business.length > 200) errors.business = e.tooLong;

  if (values.message.length < 2) errors.message = e.message;
  else if (values.message.length > 4000) errors.message = e.tooLong;

  if (Object.keys(errors).length) return { errors, values };

  logLeadSubmissionAccepted(source);

  const lead: LeadForEmail = {
    name: values.name,
    contactMethod: values.method as "email" | "phone",
    email: values.email && EMAIL_RE.test(values.email) ? values.email : null,
    phone: values.phone || null,
    website: values.website || null,
    message: values.message,
    source,
  };

  // ---- 1. Email first, so you get the lead even if the database is down or paused ----
  const emailed = await sendLeadAlert(lead);

  // ---- 2. Then save it ----
  let saved = false;
  try {
    const { error } = await supabaseAdmin().from("leads").insert({
      name: lead.name,
      contact_method: lead.contactMethod,
      email: lead.email,
      phone: lead.phone,
      website: lead.website,
      message: lead.message,
      source: lead.source,
      email_sent: emailed,
    });
    if (error) console.error("[lead] Supabase insert failed", error.message);
    saved = !error;
  } catch (err) {
    console.error("[lead] Supabase unreachable", err);
  }

  logLeadSubmissionProcessed({ source, emailAlertDelivered: emailed, databaseRecordSaved: saved });
  await flushPostHogLogs();

  // Only fail if BOTH paths failed. Otherwise you have the lead somewhere.
  if (!emailed && !saved) return { formError: e.server, values };

  redirect("/thanks/message");
}
