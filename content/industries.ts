// Copy for /industries and /industries/[slug]. The industries themselves live in Sanity (see /studio).

import { site } from "@/content/home";
import type { IndustryGroup } from "@/lib/sanity/types";

export const industriesMeta = {
  title: "Websites by industry",
  description:
    "Websites for contractors, woodworkers, restaurants, senior care, HVAC, plumbing, roofing and more. Every one built to turn a stranger on Google into a customer on the phone.",
  path: "/industries",
};

export const industriesHero = {
  eyebrow: "Industries",
  headline: "Built for businesses that run on calls, bookings and quotes",
  body: "From contractors to sushi pop-ups, every site I build has the same job: turn a stranger on Google into a customer on the phone. Here's who I've built for, and who I'm ready for next.",
  cta: "Find your industry",
};

export const industryBrowser = {
  eyebrow: "Who I build for",
  heading: "Pick your industry",
  filterLabel: "Filter industries",
  all: "All",
  clientWork: "Client work",
  groups: {
    home: "Home services",
    makers: "Builders and makers",
    food: "Food and retail",
    care: "Care and services",
  } satisfies Record<IndustryGroup, string>,
  showing: (shown: number, total: number) => `Showing ${shown} of ${total} industries`,
  go: "See how I help",
  caseStudy: "See the work",
  empty: "Industries are on their way. In the meantime, tell me what you do and I'll tell you if I'm a fit.",
};

export const playbook = {
  eyebrow: "Same playbook, every industry",
  heading: "Different trades. Same three jobs.",
  items: [
    {
      icon: "search",
      title: "Get found",
      body: "Pages for the services you sell and the towns you serve, plus a Google Business Profile that actually gets filled out.",
    },
    {
      icon: "phone",
      title: "Get the call",
      body: "Click-to-call on every page, short forms, and a text to your phone the second a lead comes in.",
    },
    {
      icon: "chart",
      title: "Know what's working",
      body: "Every call and form tracked to where it came from, in a plain English report.",
    },
  ] as const,
};

export const notListed = {
  eyebrow: "Not on the list?",
  heading: "If people call, book or ask for a quote, I can build for it",
  body: "The list grows every time a new kind of business finds me. Tell me what you do and I'll tell you honestly if I'm a fit.",
  cta: { label: "Tell me about your business", href: "/book#message" },
};

export const industriesCta = {
  eyebrow: "Free 15 minute call",
  heading: "See what your site is costing you",
  body: "I'll look at your site the way your customers do and tell you what to fix first, whether you hire me or not.",
  primaryCta: { label: "Book a free call", href: site.bookHref },
};

/** "Contractors and HVAC" → "contractors and HVAC", for use mid-sentence. */
const midSentence = (name: string) =>
  name
    .split(" ")
    .map((w) => (w.length > 1 && w === w.toUpperCase() ? w : w.toLowerCase()))
    .join(" ");

/** Labels and fallbacks for /industries/[slug]. Anything an industry fills in the Studio wins. */
export const industryPage = {
  crumbs: { home: { label: "Industries", href: "/industries" } },
  eyebrow: (name: string) => `Websites for ${midSentence(name)}`,
  title: (name: string) => `${name} website design`,
  primaryCta: { label: "Book a free call", href: site.bookHref },
  proofLink: "See the work",
  clientWork: "I've built for this industry",
  stats: {
    eyebrow: "By the numbers",
    heading: "The numbers behind every lead",
    source: "Source",
  },
  problems: { eyebrow: "The problem", heading: "Sound familiar?" },
  solutions: {
    eyebrow: "The fix",
    heading: (name: string) => `What I build for ${midSentence(name)}`,
  },
  proof: {
    eyebrow: "Proof",
    heading: "Real work for businesses like yours",
    otherEyebrow: "Same playbook, different trade",
    otherHeading: "Recent work from other industries",
    read: "Read the case study",
    all: "All work",
  },
  faqs: { eyebrow: "Questions", heading: "What owners ask me first" },
  others: { label: "Other industries I build for", all: "All industries" },
  cta: {
    eyebrow: "Free 15 minute call",
    heading: "Find out what your website is costing you",
    body: "I'll check your phone buttons, your forms and your Google listing, and tell you what to fix first, whether you hire me or not.",
    secondaryCta: { label: "See pricing", href: "/pricing" },
  },
};
