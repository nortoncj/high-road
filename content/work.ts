// Copy for /work. Every case study lives here.
// Screenshots live in /public/assets/img/work as {slug}-desktop.jpg and {slug}-mobile.jpg.
//   desktop: full-page capture at 1440px wide (tall is fine, it scrolls on hover)
//   mobile:  full-page capture at 390px wide

import { site } from "@/content/home";

export type Shot = { src: string; alt: string; width: number; height: number };

export type CaseStudy = {
  slug: string;
  name: string;
  /** Shown as small chips under the name. */
  meta: string[];
  badge?: string;
  problem: string;
  built: string[];
  /** Leave undefined until you have a real one. The block hides itself. */
  result?: string;
  href?: string;
  /** Background behind the devices. One of the token tints. */
  tint: "foam" | "brass" | "mist" | "glass";
  desktop: Shot;
  /** Leave undefined until you have a real phone capture. The phone hides itself. */
  mobile?: Shot;
};

export type Quote = { text: string; name: string; business: string };

const shot = (slug: string, view: "desktop" | "mobile", alt: string): Shot =>
  view === "desktop"
    ? { src: `/assets/img/work/${slug}-desktop.webp`, alt, width: 1440, height: 3200 }
    : { src: `/assets/img/work/${slug}-mobile.webp`, alt, width: 390, height: 1700 };

export const meta = {
  title: "Work",
  description:
    "Websites built start to finish by Chris Norton for local businesses: a contractor, a custom woodworker, a sushi pop-up and an assisted living community. Desktop and mobile views of each.",
  path: "/work",
};

export const hero = {
  eyebrow: "Work",
  headline: "Real businesses, real sites, real results.",
  body: "Every site here was built by me, start to finish. No templates and no handoffs, just one person who picks up the phone.",
  cta: { label: "Book a free call", href: site.bookHref },
  jumpLabel: "Jump to a project",
};

export const labels = {
  problem: "The problem",
  built: "What I built",
  result: "The result",
  view: "View the site",
  desktop: "Desktop",
  mobile: "Phone",
  hoverHint: "Hover to scroll the page",
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "john-clark",
    name: "John R Clark & CO",
    meta: [
      "Contractor",
      "Tarpon Springs, FL",
      "Painting, wallpaper, tile, flooring, carpentry",
    ],
    problem:
      "John has 30+ years of work behind him, but his estimate requests were vanishing. His contact form was sending emails that never arrived, so customers who were ready to hire him were getting silence.",
    built: [
      "A custom WordPress site with a services hub, a page for every service, and a filterable project gallery",
      "An estimate request form that actually delivers, rebuilt on authenticated email so requests land in his inbox instead of disappearing",
      "A Google Business Profile set up and filled with reviews from past customers",
      "A local SEO plan built around wallpaper installation, the service where he can win fastest",
    ],
    // TODO: swap for before/after estimate requests per month once you have them.
    result: "Every estimate request now lands in his inbox within seconds.",
    href: "https://johnrclarkco.com",
    tint: "foam",
    desktop: shot(
      "john-clark",
      "desktop",
      "John R Clark & CO website on desktop",
    ),
    mobile: shot(
      "john-clark",
      "mobile",
      "John R Clark & CO website on a phone",
    ),
  },
  {
    slug: "butcher-block",
    name: "Butcher Block Group",
    meta: [
      "Custom woodworker",
      "Brandon, FL",
      "Countertops, tables, cutting boards, custom builds",
    ],
    problem:
      "Troy's work sells itself once people see it, but his old setup buried it. Customers had to dig to find photos, and he had no easy way to show off new pieces.",
    built: [
      "A custom WordPress theme designed to feel like a coffee-table book, made to attract high-end clients without scaring off everyone else",
      "A gallery you can filter by product type and wood species, with full-screen photos",
      "A gallery Troy updates himself from his phone, with no developer needed",
      "A reviews page with a scrolling photo wall of his real builds",
    ],
    // TODO: inquiries or quote requests since launch, or a quote from Troy.
    result:
      "23 confirmed sales in the first month from about 800 impressions (2.9% of viewers), verified through customer reviews.",
    href: "https://nortoncj.github.io/ButcherBlockGuy/", // TODO: live domain
    tint: "brass",
    desktop: shot(
      "butcher-block",
      "desktop",
      "Butcher Block Group website on desktop",
    ),
    mobile: shot(
      "butcher-block",
      "mobile",
      "Butcher Block Group website on a phone",
    ),
  },
  {
    slug: "high-tyde",
    name: "High Tyde Sushi",
    meta: ["Sushi pop-up", "Tampa Bay, FL"],
    problem:
      "A pop-up moves every week. Customers needed to know where High Tyde would be and get hungry before they showed up.",
    built: [
      "A full homepage rebuild with a split-screen hero, featured roll cards and a story section",
      "Animations that bring the coastal brand to life, with reduced-motion settings for customers who need them",
      "A mobile-first layout, since everyone checks a pop-up's location from their phone",
    ],
    // TODO: a result, or a quote from the owner.
    result: undefined,
    href: "https://nortoncj.github.io/highTyde/", // TODO: live URL
    tint: "glass",
    desktop: shot("high-tyde", "desktop", "High Tyde Sushi website on desktop"),
    mobile: shot("high-tyde", "mobile", "High Tyde Sushi website on a phone"),
  },
  {
    slug: "casa-de-la-paz",
    name: "Casa de la Paz",
    meta: ["Assisted living and senior housing"],
    badge: "Senior care",
    problem:
      "Families choosing senior housing need to trust you before they ever visit. Casa de la Paz needed a site that felt warm, clear and easy to read at any age.",
    built: [
      "A clean, easy-to-read site with large type and plain language for older readers and the adult children helping them",
      "Click-to-call on every page, so families reach a real person in one tap",
    ],
    result: undefined,
    href: "https://www.cdpliving.com",
    tint: "mist",
    desktop: shot(
      "casa-de-la-paz",
      "desktop",
      "Casa de la Paz website on desktop",
    ),
    mobile: shot(
      "casa-de-la-paz",
      "mobile",
      "Casa de la Paz website on a phone",
    ),
  },
];

export const ownSystem = {
  eyebrow: "My own lead system",
  name: "WebTech Ninjas",
  meta: ["The site you're on right now"],
  intro: "This is the setup I give Run clients, running live on my own business:",
  built: [
    "A contact form that saves every lead to a database and emails me the second it comes in",
    "A private dashboard to track every lead from “new” to “booked” to “won”",
    "Spam protection that stops bots without annoying real people",
    "Built with Next.js and hosted on AWS, so the pages load fast",
  ],
  tryIt: { label: "Fill out my contact form and you'll see it work from the customer's side.", cta: "Try the contact form", href: "/#book" },
  // The pipeline mock. Example data, labelled on the page.
  board: {
    label: "Lead pipeline",
    note: "Example data",
    columns: [
      { id: "new", title: "New", cards: [{ name: "Dana R.", meta: "Water heater · Google Maps", time: "2m ago" }, { name: "Marcus T.", meta: "Roof repair · Website form", time: "1h ago" }] },
      { id: "booked", title: "Booked", cards: [{ name: "Ellen P.", meta: "Kitchen tile · Referral", time: "Thu 10 AM" }] },
      { id: "won", title: "Won", cards: [{ name: "Ray K.", meta: "Wallpaper · Google search", time: "$2,400" }] },
    ],
  },
};

export const quotes = {
  eyebrow: "What clients say",
  // Real quotes only. Empty text = hidden. Never ship a placeholder quote.
  items: [
    { text: "", name: "John Clark", business: "John R Clark & CO" }, // TODO: real quote from John
    { text: "", name: "Troy", business: "Butcher Block Group" }, // TODO: real quote from Troy
    { text: "Finding good people is so much easier.", name: "Petra", business: "Casa de la Paz" },
  ] satisfies Quote[],
};

export const cta = {
  eyebrow: "Free 15 minute call",
  heading: "Your business could be next.",
  body: "On a free 15 minute call, I'll look at your current site the way a customer would and tell you what's costing you leads, whether you hire me or not.",
  primaryCta: { label: "Book a free call", href: site.bookHref },
  secondaryCta: { label: "See pricing", href: "/pricing" },
};
