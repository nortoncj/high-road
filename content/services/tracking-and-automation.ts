// Copy for /services/tracking-and-automation. Edit words here, not in components.

import { reportBg } from "@img/home";
import { serviceTracking } from "@img/services";
import { price } from "./prices";
import type { Service } from "./types";

export const trackingAndAutomation: Service = {
  slug: "tracking-and-automation",
  label: "Tracking & automation",
  icon: "chart",
  title: "Know what's working. Skip the busywork.",
  summary: "Every lead in one list, a plain English report of where they came from, and the repeat tasks set to run on their own.",
  highlights: ["Every lead in one list", "A monthly report you can read", "Review requests that send themselves"],
  price: `From ${price.automation}`,
  image: {
    src: serviceTracking,
    alt: "Office manager of a small service company smiling at a sales chart on her laptop",
  },
  meta: {
    title: "Lead tracking, reports and automation for small businesses",
    description:
      "See every call, form and booking in one list, know which marketing brings in work, and let the repeat tasks run themselves. Plain English reports, no jargon.",
  },
  hero: {
    eyebrow: "Lead tracking and automation",
    intro:
      "You shouldn't have to guess which ad, listing or referral brought in last month's jobs. I track every lead back to where it came from, and set up the busywork to run on its own.",
    badge: "A report you can actually read",
    reassurances: ["Free 15 minute call", "No cookies, nothing personal stored", "Built around the tools you use"],
  },
  pains: {
    heading: "If you can't see it, you can't fix it.",
    items: [
      "I'm spending money on Google and Facebook, and I can't tell you which one brings in work.",
      "Leads come in by phone, text, email and the website. Some of them fall through the cracks.",
      "I spend my evenings copying customer info from one app into another.",
    ],
  },
  features: {
    heading: "What I set up",
    items: [
      {
        title: "Every lead in one list",
        body: "Calls, forms and bookings land in one list you can check from your phone. Mark each one called, booked or won, and nothing falls through the cracks.",
        points: ["Every call, form and booking in one place", "Mark leads new, called, booked or won", "Works on your phone, nothing to install"],
        visual: { mockup: "leads" },
      },
      {
        title: "Know where your customers came from",
        body: "See which leads came from Google, Maps, Facebook or a referral. Each month you get a short report in plain English: what's working, and what I'd fix next.",
        points: [
          "Every call and form tracked to its source",
          "A monthly report in plain English",
          "Visitor stats with no cookies and nothing personal stored",
        ],
        visual: { photo: { src: reportBg, alt: "Business owner reading his monthly report at the kitchen table" } },
      },
      {
        title: "Let the busywork run itself",
        body: "If you do the same thing after every job, it can probably run on its own: a review request after the job, a nudge when a quote goes quiet, or a new lead sent straight to your scheduling app.",
        points: ["Review requests sent after every job", "Follow-ups when a quote goes quiet", "New leads sent to the tools you already use"],
        visual: { mockup: "automation" },
      },
    ],
  },
  tools: {
    items: [
      {
        icon: "chart",
        name: "Website Stats",
        what: "A custom in-house visitor counter. No cookies, nothing personal stored, and too small to slow your site down.",
      },
      {
        icon: "analytics",
        name: "Google Analytics",
        what: "Google's free visitor stats, set up so your calls and forms count as wins.",
      },
      {
        icon: "list",
        name: "Lead dashboard",
        what: "Every call, form and booking in one private list, stored in a secure Supabase database.",
      },
      {
        icon: "report",
        name: "Monthly report",
        what: "A short PDF in your inbox: visits, calls and leads, what changed, and what to fix next.",
      },
      {
        // TODO: confirm n8n is what you use for client automations (swap for Zapier or Make if not).
        icon: "automation",
        name: "Custom automations",
        what: "The glue between your apps. When one thing happens, like a job marked done, the next step runs on its own.",
      },
      {
        icon: "plug",
        name: "Connections to your tools",
        what: "New leads can go straight into Google Sheets, your calendar or the customer app you run jobs from, instead of being typed in twice.",
      },
    ],
  },
  pricing: {
    heading: "Pick the piece you need",
    body: "The lead dashboard comes with the Run package. Single automations can be added to any package, and the monthly report comes with the Growth care plan.",
    lines: [
      { label: "Run", price: price.run, note: "Lead dashboard, 2 custom automations and a 90-day check-in" },
      { label: "Custom automation", price: price.automation, note: "Add one to any package" },
      { label: "Growth care plan", price: price.growth, note: "Monthly report of visits, calls and leads" },
    ],
  },
  faqs: [
    {
      q: "Do I have to look at dashboards?",
      a: "Only if you want to. Most owners just read the monthly report, which says in plain English what happened and what to do next.",
    },
    {
      q: "What can be automated?",
      a: "Anything you do the same way every time. Common ones are a review request after each job, a follow-up text when a quote goes quiet, and new leads sent to your scheduling or customer app. We start with the one that saves you the most time.",
    },
    {
      q: "Will it work with the software I already use?",
      a: "Usually. Most calendars, spreadsheets and job apps can connect. Tell me what you use on the free call and I'll tell you straight if it can.",
    },
    {
      q: "Do you track people personally?",
      a: "No. The visitor counter I use stores no cookies and nothing personal. It counts visits and where they came from, not who someone is.",
    },
  ],
};
