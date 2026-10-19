// Copy for /services/website-design. Edit words here, not in components.
// Anything in [brackets] is a placeholder you still need to fill.

import { about, recentWork, site } from "@/content/home";

export type Problem = {
  number: string;
  title: string;
  /** Composite "sound familiar?" line. Not a testimonial: never put a name on it. */
  voice: string;
  fixes: string[];
  icon: "bolt" | "sparkles" | "chart";
  /** Which mockup sits beside it: a phone getting the lead, an old vs new site, a lead-source report. */
  visual: "alerts" | "makeover" | "report";
};

export type Basic = {
  icon: "phone" | "call" | "form" | "approve" | "search" | "chart" | "person";
  title: string;
  body: string;
};

export const meta = {
  title: "Website design for local businesses",
  description:
    "Fast, phone-first websites for local businesses that live on calls, bookings and form leads. Instant lead alerts, call tracking and a plain English monthly report. Fixed prices.",
  path: "/services/website-design",
};

export const hero = {
  eyebrow: "Website design for local businesses",
  headline: "A website that makes your phone ring, not just one that looks nice.",
  body: "If you make money when someone calls, books or fills out a form, I build the site that gets them to do it, then texts you the second they do.",
  primaryCta: { label: "Book a free call", href: site.bookHref },
  secondaryCta: { label: "See my work", href: "/#work" },
  reassurances: ["Free 15 minute call", "Fixed prices, no surprise invoices", "No tech talk"],
  // The animated lead timeline on the right. Example only, labelled as such.
  timelineLabel: "What happens when a lead comes in",
  timeline: [
    { time: "2:14:06 PM", title: "New form lead", meta: "Water heater install · Kitchen leak" },
    { time: "2:14:08 PM", title: "Text sent to you", meta: "Dana R. · (555) 555-0142 · Tap to call" },
    { time: "2:14:08 PM", title: "Auto reply sent to Dana", meta: "Thanks! I'll call you within the hour." },
    { time: "2:14:08 PM", title: "Source logged", meta: "Google Maps · Mobile" },
  ],
  timelineNote: "Example lead",
};

export const problems = {
  eyebrow: "Where leads leak",
  heading: "Most small business websites lose customers in the same three places.",
  voiceLabel: "Sound familiar?",
  fixesLabel: "What I build in",
  items: [
    {
      number: "01",
      icon: "bolt",
      visual: "alerts",
      title: "Stop losing people who were ready to buy",
      voice:
        "Someone filled out my contact form on Friday. I saw it Tuesday. They'd already hired the other guy.",
      fixes: [
        "Click-to-call on every page",
        "Short forms people actually finish",
        "A text to you the second a lead comes in",
        "An auto reply so they stop shopping around",
      ],
    },
    {
      number: "02",
      icon: "sparkles",
      visual: "makeover",
      title: "Look like the business you actually are",
      voice: "My website looks like I built it in 2014, because I did. People assume I'm the cheap option.",
      fixes: [
        "A modern design built for phones first",
        // TODO: only say "under 2 seconds" if you check every launch in PageSpeed Insights.
        "Fast pages that don't make people wait",
        "Plain English copy: what you do, for who, why you",
        "Real reviews and real photos up front",
      ],
    },
    {
      number: "03",
      icon: "chart",
      visual: "report",
      title: "Get found, then know what's working",
      voice: "I'm paying for a website and I have no idea if anyone has ever called because of it.",
      fixes: [
        "Service and area pages built for local search",
        "Google Business Profile set up and connected",
        "Every call and form tracked to its source",
        "A plain English monthly report",
      ],
    },
  ] satisfies Problem[],
  // Mockup copy. The report is example data and says so on screen.
  mock: {
    notifications: [
      { app: "Text", title: "New lead: Dana R.", body: "Water heater install · Tap to call" },
      { app: "Website", title: "Auto reply sent", body: "\u201cThanks! I'll call you within the hour.\u201d" },
    ],
    before: { label: "Typical DIY site", title: "Welcome to our website!", body: "Click here for more info about our services" },
    after: { label: "A site I built", project: recentWork.projects[1] },
    report: {
      title: "Where your leads came from",
      note: "Example data",
      total: "42 leads this month",
      sources: [
        { name: "Google search", value: 18 },
        { name: "Google Maps", value: 14 },
        { name: "Referrals", value: 7 },
        { name: "Facebook", value: 3 },
      ],
    },
  },
  honesty:
    "Nobody honest can promise you a #1 ranking. I promise a site built the way Google and your customers expect, and the numbers to show what's working.",
};

export const basics = {
  eyebrow: "Included",
  heading: "Every site comes with the basics done right.",
  items: [
    { icon: "phone", title: "Built for phones first", body: "Big buttons, readable text, fast pages." },
    { icon: "call", title: "Click to call everywhere", body: "One tap to reach you from every page." },
    { icon: "form", title: "Forms that get finished", body: "Short, clear, and they land in your inbox instantly." },
    { icon: "approve", title: "You approve everything", body: "Nothing goes live until you sign off." },
    { icon: "search", title: "Search basics", body: "Clean titles and structure, so Google knows what you do and where." },
    { icon: "chart", title: "Tracking from day one", body: "You're never guessing where visitors came from." },
    { icon: "person", title: "One person, start to finish", body: "I build every site myself and answer my own phone." },
  ] satisfies Basic[],
};

// Real client sites, pulled from the homepage so the two never drift apart.
export const work = {
  eyebrow: "Recent work",
  heading: "Real sites for real local businesses.",
  link: { label: "See all my work", href: "/work" },
  projects: [recentWork.featured, ...recentWork.projects],
};

export const fit = {
  eyebrow: "Who it's for",
  heading: "Built for local businesses that live on leads.",
  good: {
    title: "A good fit if",
    items: [
      "Your business makes money when someone calls, books or fills out a form",
      "Your website is out of date, slow, hard to update, or missing",
      "You've had leads slip through the cracks and want that to stop",
      "You'd rather work with one person who answers the phone than a big agency",
    ],
  },
  bad: {
    title: "Not a fit if",
    items: [
      "You need a large online store with hundreds of products",
      "You want guaranteed rankings. Nobody honest can promise that.",
    ],
  },
};

export const cta = {
  eyebrow: "Free 15 minute call",
  heading: "Find out what your website is costing you.",
  body: "I'll look at your site the way a customer would and show you where leads slip away. Hire me or not, you'll know what to fix first.",
  person: { name: about.name, line: "Answers his own phone", photo: about.photo },
  primaryCta: { label: "Book a free call", href: site.bookHref },
  secondaryCta: { label: "See my work", href: "/#work" },
  fine: `Website packages start at ${site.priceFloor}.`,
};
