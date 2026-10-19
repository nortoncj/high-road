// Every word on /book lives here. [Brackets] are yours to fill.

import { site } from "@/content/home";

export const bookMeta = {
  title: "Book a Free 15 Minute Call, WebTech Ninjas",
  description:
    "Pick a time for a free 15 minute call about your business website. No pressure, no tech talk. Or send a message and I'll get back to you.",
  path: "/book",
};

export const book = {
  eyebrow: "Free 15 minute call",
  headline: "Book your free 15 minute call",
  steps: [
    "You tell me what your business does and where your leads come from today.",
    "I pull up your current site and show you what's getting in the way of calls and bookings.",
    "You leave with the first thing I'd fix, whether you hire me or not.",
  ],
  smallLine: "On the phone or video, your choice. No pressure, no tech talk.",
  trustLine: "You'll talk to me, Chris, not a sales rep.",

  tabs: {
    calendar: "Pick a time",
    message: "Send a message",
    label: "How do you want to reach me?",
  },

  calendar: {
    // TODO: point this at a 15 minute event type. "/30min" doesn't match the page.
    src: "https://calendly.com/webtechninjas/30min" as string,
    title: "Pick a time for your free 15 minute call",
    loading: "Loading available times",
    slow: "Calendar taking a while?",
    slowCta: "Open it in a new tab",
    placeholderHeading: "Calendar goes here",
    placeholderBody: "Paste your scheduling link into content/book.ts and it appears in this spot.",
    // Where to send people after they book. The redirect waits a beat so they see Calendly's confirmation.
    afterBookingHref: "/thanks/booked",
    // Brand colors Calendly applies to the embed (needs a paid Calendly plan; ignored otherwise). No "#".
    colors: { background: "fbfaf7", text: "223438", primary: "1f5c63" },
  },
  underCalendar: "Times are shown in your time zone. Don't see one that works?",
  underCalendarCta: "Call or text me",

  message: {
    heading: "Rather write it out?",
    body: "Tell me a little about your business and what's not working. I'll reply by email, usually the same day.",
    // TODO: your existing Brevo-backed contact route.
    endpoint: "/api/contact",
    successHref: "/thanks/message",
    fields: {
      name: { label: "Your name", placeholder: "Dana Ruiz" },
      email: { label: "Email", placeholder: "dana@ruizheating.com" },
      phone: { label: "Phone", placeholder: "(555) 555-0142", hint: "Optional. Only if you'd rather I call." },
      website: { label: "Current website", placeholder: "ruizheating.com", hint: "Optional. Leave blank if you don't have one yet." },
      message: { label: "What's going on?", placeholder: "We get calls but the website form never sends anything..." },
    },
    submit: "Send my message",
    sending: "Sending",
    error: `That didn't send. Call or text me at ${site.phone} and I'll sort it out.`,
    privacy: "I'll only use this to reply to you. No newsletters, no list.",
  },
};
