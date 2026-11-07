// Copy for /industries. The industry cards themselves live in Sanity (see /studio).

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
  go: "See how it works",
  caseStudy: "Read the case study",
  /** Where a card links when it has no case study and no link of its own. */
  fallbackHref: "/services",
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
