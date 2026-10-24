// Every word and image on the homepage lives here, so you can edit copy
// without touching components (and move it into Sanity later).
// Anything in [brackets] is a placeholder you still need to fill.

import {
  CDP,
  ButcherBlockGroup,
  JohnRClark,
  VFW,
  AboutHeadshot,
} from "@img/thumbnails";
import {
  ctaBg,
  heroCleaning,
  heroHomecare,
  heroHVAC,
  heroPlumbing,
  heroRoofing,
  pillarHiring,
  pillarLeads,
  pillarNight,
  reportBg,
} from "@img/home";


export type NavLink = { label: string; href: string };
export type Img = { src: string; alt: string };

export type Trade = {
  id: string;
  label: string;
  /** One line under the headline that changes with the trade. */
  line: string;
  image: Img;
};

export type Pillar = {
  tag: string;
  title: string;
  body: string;
  image: Img;
  link?: NavLink;
};

export type ProcessStep = {
  icon: "call" | "browser" | "pin" | "chart";
  title: string;
  body: string;
  checklist: string[];
};

export type Stat = {
  label: string;
  value: number | string;
  unit?: string;
  delta: number;
  goodWhen?: "up" | "down";
  context: string;
  trend: number[];
  series: 1 | 2 | 3 | 4;
};

export type Series = { name: string; values: number[]; risk?: boolean };

export type Tier = {
  name: string;
  blurb: string;
  price: string;
  priceNote: string;
  featured?: boolean;
  badge?: string;
  features: string[];
  cta: string;
};

export type Faq = { q: string; a: string };

export type Project = {
  name: string;
  industry: string;
  /** One line on what the site does for the business. Shown under the name. */
  highlight: string;
  href: string;
  image: Img;
};

export type FeaturedProject = Project & {
  badge: string;
  summary: string;
  quote: { text: string; name: string; title: string };
};

// Placeholder photos live in /public/assets/img/home and are exported from its index.ts. They are faceted
// stand-ins, each labelled with the real shot to take. Swap the file, keep the alt honest.

export const site = {
  name: "WebTech Ninjas",
  tagline: "Already handled.",
  oneLiner:
    "Websites for service businesses that answer the phone, book the job and help you hire.",
  altOneLiner:
    "Fast, phone-first websites for HVAC, plumbing, roofing, cleaning and home care businesses. Leads that come straight to you, after-hours booking, and a hiring page. Fixed prices.",
  phone: "727-808-9853",
  phoneHref: "tel:+17278089853", // TODO: real number, digits only
  email: "chris@webtechninjas.com",
  emailHref: "mailto:chris@webtechninjas.com", // TODO
  city: "Orlando, FL",
  bookHref: "/book",
  demoHref: "/demo",
  priceFloor: "$1,500",
  // TODO: point at the route that saves leads to Supabase.
  logo: {
    onDark: "/brand/mask-light.png",
    onLight: "/brand/mask-dark.png",
  },
} as const;

export const navLinks: NavLink[] = [
  { label: "Services", href: "/services" },
  { label: "Work", href: "/work" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
];

export const hero = {
  eyebrow: "Websites for service businesses",
  headline: "Leads you don't have to share.",
  body: "I build websites that send the call straight to you, catch the 2 a.m. emergency, and help you hire good people. Fixed prices. Reports in plain English.",
  primaryCta: "Book a free call",
  secondaryCta: { label: "See how it works", href: "#how" },
  reassurances: ["Free 15 minute call", "No tech talk", "Built for phones"],
  pickerLabel: "Built for",
  rotateMs: 6000,
  trades: [
    {
      id: "hvac",
      label: "HVAC",
      line: "When the AC dies in July, they call whoever shows up first. Make it you.",
      image: {
        src: heroHVAC.src,
        alt: "HVAC tech on a rooftop condenser at dusk",
      },
    },
    {
      id: "plumbing",
      label: "Plumbing",
      line: "Burst pipe at midnight? They're calling whoever answers. Make it you.",
      image: {
        src: heroPlumbing.src,
        alt: "Plumber loading the van at sunrise",
      },
    },
    {
      id: "roofing",
      label: "Roofing",
      line: "After the storm, the first roofer they trust gets the job. Make it you.",
      image: {
        src: heroRoofing.src,
        alt: "Roofing crew on a pitched roof at golden hour",
      },
    },
    {
      id: "cleaning",
      label: "Cleaning",
      line: "Regulars want to rebook in ten seconds, not ten texts. Make it easy.",
      image: {
        src: heroCleaning.src,
        alt: "Cleaner finishing a bright kitchen",
      },
    },
    {
      id: "homecare",
      label: "Home care",
      line: "Families pick the agency that feels safe at first glance. Make it yours.",
      image: {
        src: heroHomecare.src,
        alt: "Caregiver and client talking on a porch",
      },
    },
  ] satisfies Trade[],
};

export const trades = {
  list: [
    "HVAC",
    "Plumbing",
    "Roofing",
    "Cleaning",
    "Home care",
    "Restoration",
    "Pest control",
    "Contractors",
    "Landscaping",
  ],
  line: "If you drive to the customer, I build for you.",
};

export const pillars = {
  eyebrow: "What you get",
  heading: "A website that works the night shift.",
  body: "Most sites for service businesses are a brochure nobody reads. Yours should answer the phone, book the job and find your next hire while you're on a call.",
  items: [
    {
      tag: "Leads",
      title: "Leads you don't share",
      body: "Lead sites sell the same homeowner to five companies. Your own site and Google listing send the call to you, and only you.",
      image: {
        src: pillarLeads.src,
        alt: "Owner answering a call in the truck",
      },
    },
    {
      tag: "After hours",
      title: "Answers at 2 a.m.",
      body: "Emergencies don't wait for business hours. Click-to-call on every page, online booking, and an after-hours request form that pings your phone the second it lands.",
      image: {
        src: pillarNight.src,
        alt: "Porch light on at night with a phone lit up",
      },
    },
    {
      tag: "Hiring",
      title: "A hiring pipeline",
      body: "A careers page and an application form that asks the right questions up front, so you only call back the people worth calling.",
      image: {
        src: pillarHiring.src,
        alt: "Crew photo in front of the trucks",
      },
      link: { label: "Try the demo application", href: "/demo" },
    },
  ] satisfies Pillar[],
};

export const leadMath = {
  eyebrow: "Do the math",
  heading: "What is renting leads really costing you?",
  body: "Move the sliders to match your month. Your numbers stay on this page.",
  sliders: {
    leads: {
      label: "Leads you buy each month",
      min: 0,
      max: 80,
      step: 1,
      initial: 20,
    },
    cost: {
      label: "Average cost per lead",
      min: 10,
      max: 200,
      step: 5,
      initial: 45,
    },
    shared: {
      label: "Companies each lead is sold to",
      min: 1,
      max: 6,
      step: 1,
      initial: 4,
    },
  },
  resultLabel: "You spend each year renting leads",
  footnote:
    "Every dollar of that builds their platform, not your business. A site you own keeps working after you stop paying for clicks.",
  cta: "Show me what I'd own instead",
};

export const processSection = {
  eyebrow: "How it works",
  heading: "Four steps. You approve everything.",
  body: "One call to start. You sign off before anything goes live.",
  steps: [
    {
      icon: "call",
      title: "Free 15 minute call",
      body: "I look at your site, your Google listing and how leads reach you today. You leave with a plan whether you hire me or not.",
      checklist: [
        "Your site checked on a phone",
        "Your Google Business Profile reviewed",
        "A fixed price before any work starts",
      ],
    },
    {
      icon: "browser",
      title: "I build it",
      body: "Depending on your package, I write the words and build a site made for phones first. You approve it before launch.",
      checklist: [
        "Copy written for how your customers search",
        "Click-to-call and booking on every page",
        "Built in [X] weeks from kickoff",
      ],
    },
    {
      icon: "pin",
      title: "Launch and get found",
      body: "I launch, connect your Google listing and make sure every call, form and booking lands where you'll see it.",
      checklist: [
        "Google Business Profile tuned up",
        "After-hours requests ping your phone",
        "Careers form ready for your next hire",
      ],
    },
    {
      icon: "chart",
      title: "Grow every month",
      body: "Add the care plan and I keep the site fast, safe and current, then send a report you can read in two minutes.",
      checklist: [
        "Hosting, updates and backups handled",
        "A plain-English report every month",
        "A short list of what I'm doing next",
      ],
    },
  ] satisfies ProcessStep[],
};

export const report = {
  eyebrow: "Every month",
  heading: "A report you can read in two minutes.",
  body: "Calls, bookings, reviews and where they came from. No jargon, no 40-page PDF. Just what moved and what I'm doing next.",
  image: { src: reportBg.src, alt: "" },
  title: "October report",
  badge: "Example data",
  stats: [
    {
      label: "Calls from your website",
      value: 48,
      delta: 23.1,
      context: "vs Sept",
      trend: [22, 27, 25, 31, 39, 48],
      series: 1,
    },
    {
      label: "Jobs booked online",
      value: 17,
      delta: 41.6,
      context: "vs Sept",
      trend: [6, 8, 9, 11, 12, 17],
      series: 2,
    },
    {
      label: "Average reply to a lead",
      value: 2.4,
      unit: "hrs",
      delta: -18,
      goodWhen: "down",
      context: "vs Sept",
      trend: [4.1, 3.8, 3.5, 3.1, 2.9, 2.4],
      series: 3,
    },
  ] satisfies Stat[],
  chart: {
    title: "Where your calls came from",
    subtitle: "May to October. Example data.",
    labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"],
    series: [
      { name: "Google search", values: [9, 11, 10, 13, 16, 20] },
      { name: "Google Maps", values: [7, 9, 8, 11, 14, 17] },
      { name: "Referrals", values: [4, 5, 5, 5, 6, 7] },
      { name: "Facebook", values: [2, 2, 2, 2, 3, 4] },
    ] satisfies Series[],
  },
};

export const recentWork = {
  eyebrow: "Recent work",
  heading: "Built for people who'd rather be on the job.",
  aside: "Built and written by me.",
  featured: {
    name: "Casa de la Paz",
    industry: "Assisted living and senior housing",
    badge: "Senior care",
    highlight:
      "Careers page and online application that keep good hires coming in",
    href: "https://www.cdpliving.com", // TODO: case study or live site
    summary:
      "Website for an assisted living and senior housing community in Sarasota, Florida. Built to attract families and caregivers, with a careers page and online application.",
    quote: {
      text: "Finding good people is so much easier.",
      name: "Petra",
      title: "Owner, Casa de la Paz",
    },
    image: {
      // TODO: replace with a real screenshot of the site.
      src: CDP.src,
      alt: "A caregiver talking with a group of seniors around a table",
    },
  } satisfies FeaturedProject,
  // TODO: confirm each highlight matches what the client would say about their site.
  projects: [
    {
      name: "Butcher Block Guy",
      industry: "Woodworking",
      highlight: "Shows off the craft and keeps “Order now” one tap away",
      href: "https://nortoncj.github.io/ButcherBlockGuy/",
      image: {
        src: ButcherBlockGroup.src,
        alt: "A craftsman cutting wood on a table saw",
      },
    },
    {
      name: "John R Clark & Co",
      industry: "Property maintenance",
      highlight: "Turns 30 years of word of mouth into a site that earns trust",
      href: "https://johnrclarkco.com",
      image: {
        src: JohnRClark.src,
        alt: "A man with a painted mural on a wall behind him",
      },
    },
    {
      name: "VFW Post 6827",
      industry: "Veterans post",
      highlight: "Joining the post and finding it are one tap each",
      href: "https://vfwpost6827.org/",
      image: {
        src: VFW.src,
        alt: "A group of veterans standing in front of a VFW post",
      },
    },
  ] satisfies Project[],
};

export const packages = {
  eyebrow: "Packages",
  heading: "Three fixed prices. No surprise invoices.",
  careToggle: "Add the care plan",
  careLine:
    "+ Care plan: hosting, updates, backups and security monitoring. $79/mo",
  careOnNote: "Care plan added. Cancel it any time.",
  careOffNote: "Prices are fixed before I start. The care plan is optional.",
  budgetNote:
    "Working with a smaller budget? Tell me what you've got and I'll tell you exactly what it buys. No pressure to upgrade.",
  tiers: [
    {
      name: "Launch",
      blurb: "Get a real site up, fast.",
      price: site.priceFloor,
      priceNote: "one time, or $149/mo for 12 months",
      features: [
        "Up to 5 pages, built for phones first",
        "Click-to-call on every page",
        "Contact form that lands in your inbox",
        "You send the words, I tighten them",
        "30 days of fixes after launch",
      ],
      cta: "Start with Launch",
    },
    {
      name: "Grow",
      blurb: "The one most businesses need.",
      price: "$2,500",
      priceNote: "one time, or $249/mo for 12 months",
      featured: true,
      badge: "Most popular",
      features: [
        "Everything in Launch, up to 10 pages",
        "I write your copy",
        "Booking or quote form, with email and text alerts",
        "Google Business Profile set up",
        "Local SEO for your service areas",
      ],
      cta: "Start with Grow",
    },
    {
      name: "Run",
      blurb: "For businesses ready to scale.",
      price: "$4,500",
      priceNote: "one time, or $399/mo for 12 months",
      features: [
        "Everything in Grow, up to 15 pages",
        "Lead dashboard to track every call and form",
        "2 custom automations for your workflow",
        "90-day check-in to tune what's working",
      ],
      cta: "Start with Run",
    },
  ] satisfies Tier[],
};

export const faq = {
  eyebrow: "FAQ",
  heading: "Straight answers.",
  body: "Still wondering about something? Ask on the call. That's what it's for.",
  items: [
    {
      q: "Who writes the words on my site?",
      a: "Depends on the package. On Grow and Run, I write it. On Launch, you send what you have and I tighten it up.",
    },
    {
      q: "What happens on the free call?",
      a: "Fifteen minutes, on the phone or on video. We look at your site and Google listing together and I tell you what's costing you calls. No pitch deck.",
    },
    {
      q: "Do I have to buy the care plan?",
      a: "No. It's an add-on, not a requirement. It covers hosting, updates, backups and the monthly report.",
    },
    {
      q: "How long does a build take?",
      a: "[X to Y weeks], depending on the package and how fast I get your photos and details.",
    },
    {
      q: "Do you only work with one trade?",
      a: "No. I build for service businesses that go to the customer: HVAC, plumbing, roofing, cleaning, home care, contractors and more.",
    },
  ] satisfies Faq[],
};

export const book = {
  eyebrow: "Free 15 minute call",
  heading: "Let's make your phone ring.",
  body: "We'll look at your site and your Google listing together. You'll leave knowing what's costing you calls, whether you hire me or not.",
  image: { src: ctaBg.src, alt: "" },
  fields: {
    name: { label: "Your name", placeholder: "Dana Ruiz" },
    business: { label: "Business name", placeholder: "Ruiz Heating & Air" },
    contact: {
      label: "Best phone or email",
      placeholder: "(555) 555-0142",
      hint: "I'll only use it to set up the call.",
    },
  },
  submit: "Book my free call",
  sending: "Sending",
};

export const about = {
  eyebrow: "Who you'll work with",
  heading: "One person builds your site. Same one answers the phone.",
  body: "No account managers, no handoffs. Book a free 15 minute call and I'll show you what's getting in the way of calls. No pressure, no tech talk.",
  primaryCta: "Book a free call",
  secondaryCta: "Try the demo application",
  name: "Chris Norton",
  role: "Owner and lead developer",
  bio: "I build every site myself and answer my own phone.",
  photo: {
    // Must be YOU before launch: a stock face labeled as you is the fastest
    // way to lose a trust-first buyer.
    src: AboutHeadshot.src,
    alt: "Chris Norton",
  },
};

export const footer = {
  serviceAreas: [
    "Sarasota",
    "Venice and North Port",
    "Lakewood Ranch",
    "Orlando",
    "Remote, anywhere in the U.S.",
  ],
  legal: [
    { label: "Privacy policy", href: "/privacy" },
    { label: "Terms of service", href: "/terms" },
  ] satisfies NavLink[],
};

// ---------------------------------------------------------------------------
// Legacy: still used by TrustStrip and DemoBand. Delete these (and those two
// components) once you're happy with the new page.
// ---------------------------------------------------------------------------

export type TrustItem = {
  icon: "heart" | "language" | "phone" | "chart" | "pin";
  label: string;
  detail: string;
};

export const trustHeading = "Built for service businesses";

export const trustItems: TrustItem[] = [
  {
    icon: "heart",
    label: "Senior care focus",
    detail: "Home care and assisted living",
  },
  {
    icon: "phone",
    label: "Built for phones",
    detail: "Apply in about 3 minutes",
  },
  {
    icon: "chart",
    label: "Tracking included",
    detail: "Calls, forms, applications",
  },
  { icon: "pin", label: "Florida based", detail: "Sarasota and Orlando" },
];

export const demo = {
  heading: "See it in action",
  body: "Apply to a pretend agency on your own phone. It's the same hiring flow I build for clients.",
  cta: "Try the demo application",
  features: [
    "Real application form",
    "Built for phones",
    "Text and email alerts",
  ],
};
