// Copy for /services/lead-alerts-and-booking. Edit words here, not in components.

import { pillarNight } from "@img/home";
import { serviceLeadAlerts } from "@img/services";
import { price } from "./prices";
import type { Service } from "./types";

export const leadAlerts: Service = {
  slug: "lead-alerts-and-booking",
  label: "Lead alerts & booking",
  icon: "bell",
  title: "Never miss another lead",
  summary: "A text the second someone reaches out, an instant reply so they stop shopping around, and booking that works while you're on a job.",
  highlights: ["Text alerts in seconds", "Online booking and quote requests", "Every lead saved, nothing lost"],
  price: "Included in Grow and Run",
  image: {
    src: serviceLeadAlerts,
    alt: "Plumber kneeling at a kitchen sink with his phone beside his toolbox",
  },
  meta: {
    title: "Lead alerts and online booking for service businesses",
    description:
      "Get a text the second a lead comes in, send an instant reply, and let customers book while you're on a job. Every lead saved, even when an email fails.",
  },
  hero: {
    eyebrow: "Lead alerts and online booking",
    intro:
      "The first business to call back usually gets the job. I set up your site so every form, booking and after-hours request reaches your phone in seconds, even when your hands are full.",
    badge: "Text alerts in seconds",
    reassurances: ["Free 15 minute call", "Alerts to the phone you already have", "Every lead saved"],
  },
  pains: {
    heading: "Leads don't wait for you to finish the job.",
    items: [
      "I can't answer the phone with my hands in a wall. By the time I call back, they've booked someone else.",
      "People call after hours, get my voicemail, and never leave a message.",
      "My contact form says thanks, but half the time the email never shows up.",
    ],
  },
  features: {
    heading: "How every lead reaches you",
    items: [
      {
        title: "A text the second someone reaches out",
        body: "When someone fills out your form, you get a text with their name, number and what they need. Tap once to call back while they're still deciding.",
        points: [
          "Text and email alerts in seconds",
          "Every detail in the message, tap to call back",
          "An auto reply so they stop calling around",
        ],
        visual: { mockup: "timeline" },
      },
      {
        title: "Let them book while you're on a job",
        body: "Some customers would rather pick a time than wait for a callback. Online booking shows your open times and puts the visit straight on your calendar.",
        points: [
          "Customers pick a time that's actually open",
          "Confirmations sent for you",
          "Works with the booking tool you already use, or I set one up",
        ],
        visual: { mockup: "booking" },
      },
      {
        title: "Catch the 9 PM search",
        body: "People search when the problem happens, not when you're open. After-hours requests and booking keep working while you sleep, and customers know exactly what happens next.",
        points: [
          "Click-to-call and click-to-text on every page",
          "A short after-hours callback form",
          "A clear message about when you'll call back",
        ],
        visual: { photo: { src: pillarNight, alt: "Homeowner on her porch at night, searching on her phone" } },
      },
    ],
  },
  tools: {
    items: [
      {
        icon: "phone",
        name: "Click-to-call and click-to-text",
        what: "One tap from any page calls or texts you. I test both on a real phone before launch.",
      },
      {
        icon: "message",
        name: "Text alerts",
        what: "A text to your phone with the lead's name, number and what they need, the second they hit send.",
      },
      {
        icon: "mail",
        name: "Email Automation",
        what: "A real email service sends your alerts, set up so they land in your inbox instead of spam.",
      },
      {
        icon: "database",
        name: "Database",
        what: "A secure database that saves every lead before anything else happens. If an email ever fails, the lead is still there.",
      },
      {
        icon: "calendar",
        name: "Calendly, or your booking tool",
        what: "Customers pick an open time and it lands on your calendar. I'll connect the tool you already use, or set one up.",
      },
      {
        icon: "reply",
        name: "Auto replies",
        what: "An instant “Got it, I'll call you within the hour” so they stop calling your competitors.",
      },
    ],
  },
  pricing: {
    heading: "Included in Grow and Run",
    body: "Booking or quote forms with email and text alerts come with Grow and Run. Every package includes click-to-call and a contact form that lands in your inbox.",
    lines: [
      { label: "Grow", price: price.grow, note: "Booking or quote form, with email and text alerts the second a lead comes in" },
      { label: "Online booking setup", price: price.booking, note: "Add to any package" },
      { label: "Launch", price: price.launch, note: "Click-to-call on every page and a contact form that lands in your inbox" },
    ],
  },
  faqs: [
    {
      q: "Do I need a special app for the alerts?",
      a: "No. Alerts come in as a regular text and email on the phone you already have. Tap the number in the text to call the customer back.",
    },
    {
      q: "Can customers book without calling me?",
      a: "Yes. They pick an open time and it goes straight on your calendar. If you'd rather look at each job first, it can be a quote request instead.",
    },
    {
      q: "What if an email alert doesn't arrive?",
      a: "Every lead is saved to a database before any email goes out, so it's never lost. A form that says thanks while the email quietly vanishes is the problem I find most often on other sites.",
    },
    {
      // TODO: confirm you add alerts and booking to sites you didn't build, or reword.
      q: "Will it work with my current website?",
      a: "Often, yes. Booking and alerts can usually be added to the site you have. If your current site makes that hard, I'll tell you honestly whether a fix or a rebuild costs less.",
    },
  ],
};
