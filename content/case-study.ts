// Labels for /work/[slug]. The case studies themselves live in Sanity (see /studio).

import { site } from "@/content/home";

const words = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
const count = (n: number) => words[n] ?? String(n);

export const caseStudyPage = {
  badge: "Case study",
  jumpLabel: "Jump to section",
  jump: { summary: "30-second version", problem: "Problem", plan: "Plan", results: "Results" },
  minRead: (n: number) => `${n} min read`,
  breadcrumbLabel: "Breadcrumb",
  industriesCrumb: { label: "Industries", href: "/industries" },
  workCrumb: { label: "Work", href: "/work" },
  visit: "Visit the site",
  summary: {
    eyebrow: "No time? Read this",
    heading: "The 30-second version",
    problem: "Problem",
    plan: "Plan",
    result: "Result",
  },
  problem: {
    eyebrow: "The problem",
    heading: "What wasn't working",
    toggleLabel: "Show before or after",
    before: "Before",
    after: "After",
    shotBefore: "The old site",
    shotAfter: "The new site",
  },
  plan: {
    eyebrow: "The action plan",
    heading: (n: number) => `${count(n)} ${n === 1 ? "move" : "moves"}, in order`,
    intro: "Tap a step to see what I did and why it mattered.",
    stepOf: (i: number, n: number) => `Step ${i} of ${n}`,
    did: "What I did",
    why: "Why it matters to you",
    prev: "Previous",
    next: "Next step",
    fallbackHeading: "What I did",
  },
  results: {
    eyebrow: "The results",
    heading: "What changed",
    before: "Before",
    after: "After",
    estimated: "Estimate",
    chartBefore: "Before",
    chartAfter: "After",
    galleryHeading: "From the project",
  },
  takeaways: {
    eyebrow: "Steal this for your business",
    heading: (n: number) => `${count(n)} ${n === 1 ? "thing" : "things"} you can do this week`,
    hood: "For your web person: under the hood",
    stack: "Built with",
  },
  related: { eyebrow: "Related guides", heading: "Do it yourself", all: "All guides" },
  cta: {
    eyebrow: "Your turn",
    heading: "Is your website losing leads too?",
    body: "On a free 15 minute call I'll check your form, your Google listing and your phone buttons, and tell you what to fix first.",
    primaryCta: { label: "Book a free call", href: site.bookHref },
    secondaryCta: { label: "See more case studies", href: "/work" },
    shareTitle: "Not the one who handles the website?",
    shareBody: "Send this page to whoever does. It takes them two minutes to read.",
    copy: "Copy the link",
    copied: "Link copied",
    copiedStatus: "Copied. Paste it in a text or email.",
  },
};
