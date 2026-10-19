// Copy and prices for /pricing. Every number on the page comes from here,
// so a price change is a one-line edit.

import { site } from "@/content/home";

export type Billing = "once" | "monthly";

export type Package = {
  id: "launch" | "grow" | "run";
  name: string;
  once: number;
  monthly: number;
  months: number;
  blurb: string;
  featured?: boolean;
  badge?: string;
  features: string[];
  cta: string;
};

export type CarePlan = { id: string; name: string; price: number; featured?: boolean };
/** true = included, string = included with a limit, false/undefined = not included */
export type CareRow = { label: string; values: Record<string, boolean | string> };

export type AddOn = { name: string; price: number; note?: string };
export type Faq = { q: string; a: string };

export const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export const meta = {
  title: "Pricing",
  description:
    "Fixed website prices for local businesses: Launch $1,500, Grow $2,500, Run $4,500, or pay monthly over 12 months with no money down. Optional care plans from $39/month.",
  path: "/pricing",
};

export const hero = {
  eyebrow: "Pricing",
  headline: "Three fixed prices. No surprise invoices.",
  body: "You know the price before I start. You see every page before it goes live. And you own the site when we're done.",
  cta: { label: "Book a free call", href: site.bookHref },
  reassurances: ["Pay once or pay monthly", "You own your site", "No contracts on care plans"],
};

export const packages = {
  eyebrow: "Packages",
  heading: "Pick the one that fits where your business is now.",
  toggle: { once: "Pay once", monthly: "Pay monthly" },
  items: [
    {
      id: "launch",
      name: "Launch",
      once: 1500,
      monthly: 149,
      months: 12,
      blurb: "Get a real site up, fast. For new businesses, or anyone who needs to look legit this month.",
      features: [
        "Up to 5 pages, built for phones first",
        "Click-to-call on every page",
        "Contact form that lands in your inbox",
        "You send the words, I tighten them",
        "2 rounds of revisions",
        "30 days of fixes after launch",
      ],
      cta: "Start with Launch",
    },
    {
      id: "grow",
      name: "Grow",
      once: 2500,
      monthly: 249,
      months: 12,
      featured: true,
      badge: "Most popular",
      blurb: "The one most businesses need. For established businesses that want more calls and bookings.",
      features: [
        "Everything in Launch, up to 10 pages",
        "I write your copy",
        "Booking or quote form, with email and text alerts the second a lead comes in",
        "Google Business Profile set up",
        "Local SEO for your service areas",
        "A launch report showing your speed and search setup",
        "3 rounds of revisions",
        "60 days of fixes after launch",
      ],
      cta: "Start with Grow",
    },
    {
      id: "run",
      name: "Run",
      once: 4500,
      monthly: 399,
      months: 12,
      blurb: "For businesses ready to track and automate every lead.",
      features: [
        "Everything in Grow, up to 15 pages",
        "Lead dashboard to see every call and form in one place",
        "2 custom automations for your workflow",
        "90-day check-in to tune what's working",
        "4 rounds of revisions",
        "90 days of fixes after launch",
      ],
      cta: "Start with Run",
    },
  ] satisfies Package[],
};

/** Links each package CTA to the booking page with the package preselected. */
export const packageHref = (id: Package["id"], billing: Billing) =>
  `${site.bookHref}?package=${id}&billing=${billing}`;

export const payMonthly = {
  eyebrow: "Pay monthly",
  heading: "No money down.",
  body: "Rather not drop it all at once? Spread any package over 12 months. The Handled care plan is included the whole time, and the site is 100% yours once the 12 months are done.",
  columns: { pkg: "Package", once: "Pay once", monthly: "Pay monthly" },
};

const careRows: CareRow[] = [
  { label: "Hosting, SSL, daily backups", values: { hosted: true, handled: true, growth: true } },
  { label: "Updates and security monitoring", values: { hosted: false, handled: true, growth: true } },
  { label: "Small edits", values: { hosted: false, handled: "30 min/month", growth: "Up to 2 hours/month" } },
  { label: "Monthly report of visits, calls and leads", values: { hosted: false, handled: false, growth: true } },
  { label: "Same-day response", values: { hosted: false, handled: false, growth: true } },
];

export const care = {
  eyebrow: "Care plans",
  heading: "Optional. Your site keeps running either way.",
  body: "These just mean you never have to think about it.",
  plans: [
    { id: "hosted", name: "Hosted", price: 39 },
    { id: "handled", name: "Handled", price: 79, featured: true },
    { id: "growth", name: "Growth", price: 149 },
  ] satisfies CarePlan[],
  rows: careRows,
  includedNote: "Included with pay monthly",
  fine: "Cancel any time. If you leave, I'll hand over your files or move the site wherever you want.",
};

export const addOns = {
  eyebrow: "Add-ons",
  heading: "Need one more thing?",
  body: "Add it to any package.",
  items: [
    { name: "Extra page", price: 200 },
    { name: "Online booking setup", price: 300 },
    { name: "Google Business Profile setup", price: 350, note: "Launch only" },
    { name: "Custom automation", price: 400 },
    { name: "Full copywriting", price: 500, note: "Launch only" },
    { name: "Speed fix for an existing site", price: 500 },
    { name: "Business email setup", price: 600 },
  ] satisfies AddOn[],
  budget: {
    heading: "Working with a smaller budget?",
    body: "Tell me what you've got and I'll tell you exactly what it buys. No pressure to upgrade, and no pretending it buys more than it does.",
    cta: { label: "Tell me your budget", href: `${site.bookHref}?topic=budget` },
  },
};

export const notIncluded = {
  eyebrow: "What's not included",
  heading: "So nothing surprises you later.",
  items: [
    "Logo or brand design",
    "Photography (I can recommend someone)",
    "Paid ads management",
    "Online stores with lots of products",
    "Domain registration and third-party tools (booking software, email inboxes, etc.). You pay those directly, so you own the accounts.",
  ],
};

export const faq = {
  eyebrow: "Pricing questions",
  heading: "Straight answers about money.",
  items: [
    {
      q: "Why don't you just charge $500 like the template guys?",
      a: "Because a $500 site is a template with your logo on it. You're paying for a site that's built to bring in leads, with copy that sells, alerts so you never miss one, and tracking so you know it's working.",
    },
    {
      q: "How do payments work?",
      a: "Half up front to get on the schedule, half at launch. Run is split into three payments: 40% up front, 30% at the design approval and 30% at launch.",
    },
    {
      q: "What if I go over on revisions?",
      a: "Extra rounds are $85/hour, and I'll always tell you before we cross that line.",
    },
    {
      q: "What happens if I cancel pay monthly early?",
      a: "The remaining balance is due, or the site comes down. It's all in the agreement before we start, in plain English.",
    },
    {
      q: "Do I own the website?",
      a: "Yes. Your domain, your content and your photos are yours. On pay monthly, the site is fully yours once the 12 months are done.",
    },
    {
      q: "Can I upgrade later?",
      a: "Yes. Start with Launch and move up to Grow or Run any time. You only pay the difference.",
    },
    {
      q: "How long does it take?",
      a: "About 2 weeks for Launch, 3 to 4 weeks for Grow and 5 to 6 weeks for Run, as long as you send photos and approvals on time.",
    },
  ] satisfies Faq[],
};

export const cta = {
  eyebrow: "Free 15 minute call",
  heading: "Not sure which one you need?",
  body: "Book a free 15 minute call. I'll look at what you have now, ask what you need it to do, and tell you which package fits. Sometimes the answer is the cheapest one.",
  primaryCta: { label: "Book a free call", href: site.bookHref },
};
