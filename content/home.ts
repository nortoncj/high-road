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
  heroElectricians,
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
  // priceFloor: "$1,500",
  priceFloor: 600,
  // TODO: point at the route that saves leads to Supabase.
  logo: {
    onDark: "/brand/wtn-wordmark-dark.svg",
    onLight: "/brand/wtn-wordmark.svg",
  },
} as const;

export const navLinks: NavLink[] = [
  { label: "Services", href: "/services" },
  { label: "Industries", href: "/industries" },
  { label: "Work", href: "/work" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
];

export const hero = {
  eyebrow: "Websites and lead systems for local service businesses",
  headline: "Leads you don't have to share.",
  body: "Turn local searches into direct inquiries. Give customers an easy way to call, request service, or book online, even when you're out on a job. Get a website built to capture opportunities and keep your business moving.",
  primaryCta: "Book a free call",
  secondaryCta: { label: "See how it works", href: "#how" },
  reassurances: [
    "Free 15-minute call",
    "Fixed price before work starts",
    "Built for phones",
  ],
  pickerLabel: "BUILT FOR",
  rotateMs: 6000,
  trades: [
    {
      id: "hvac",
      label: "HVAC",
      line: "When the AC fails in July, customers need a way to reach you fast. Make the next step obvious.",
      image: {
        src: heroHVAC.src,
        alt: "HVAC tech on a rooftop condenser at dusk",
      },
    },
    {
      id: "plumbing",
      label: "Plumbing",
      line: "A burst pipe can't wait. Put your services and contact options one tap away.",
      image: {
        src: heroPlumbing.src,
        alt: "Plumber loading the van at sunrise",
      },
    },
    {
      id: "electricians",
      label: "Electricians",
      line: "When the power goes out, they call whoever can get there fast. Make it you.",
      image: {
        src: heroElectricians.src,
        alt: "Electrician working on a home electrical panel",
      },
    },
    {
      id: "roofing",
      label: "Roofing",
      line: "After a storm, homeowners compare roofers quickly. Show your work and make requesting an inspection easy.",
      image: {
        src: heroRoofing.src,
        alt: "Roofing crew on a pitched roof at golden hour",
      },
    },
    {
      id: "cleaning",
      label: "Cleaning",
      line: "Make it easy to compare services, request a quote, and book recurring cleanings.",
      image: {
        src: heroCleaning.src,
        alt: "Cleaner finishing a bright kitchen",
      },
    },
    {
      id: "homecare",
      label: "Home care",
      line: "Families need to trust the people caring for a loved one. Make your services, team, and next steps clear.",
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
    "Electricians",
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
  body: "Most websites for service businesses are digital brochures. They list services, display a phone number, and leave customers to figure out what happens next.\n\nYour website should do more. It should help local customers find your business, make it easy to request service, and keep new inquiries moving, even when you're busy on the job.",
  items: [
    {
      tag: "Leads",
      title: "A direct line to your business",
      body: "Stop relying entirely on shared-lead marketplaces. Build a direct channel where customers can find your services, explore what you offer, and contact your business. Your website and Google Business Profile give you a digital presence you control.",
      image: {
        src: pillarLeads.src,
        alt: "Owner answering a call in the truck",
      },
      link: {
        label: "Learn more",
        href: "/services",
      },
    },
    {
      tag: "After Hours",
      title: "Your next customer doesn't keep business hours",
      body: "Make it easy to reach your business whenever the need arises. Click-to-call, online booking, and after-hours request forms give customers a clear next step. New inquiries can trigger email and text notifications so you know when someone reaches out.",
      image: {
        src: pillarNight.src,
        alt: "Porch light on at night with a phone lit up",
      },
      link: {
        label: "Learn more",
        href: "/services",
      },
    },
    {
      tag: "Hiring",
      title: "A better way to find your next hire",
      body: "Growing your business means growing your team. A dedicated careers page and structured application process collect the information you need upfront, helping you review applicants and spend less time chasing incomplete applications.",
      image: {
        src: pillarHiring.src,
        alt: "Crew photo in front of the trucks",
      },
      link: {
        label: "Learn more",
        href: "/services",
      },
    },
  ] satisfies Pillar[],
};

export const alsoIncluded =
  "Need more than a website? Add lead tracking, CRM connections, reporting, and workflow automations that help your business stay organized as it grows.";

export const leadMath = {
  eyebrow: "Do the math",
  heading: "What are shared leads costing your business?",
  body: "Enter your numbers to estimate what you're spending on purchased leads each year. Compare that with building a direct channel through your own website.",

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

  resultLabel: "Your estimated annual lead spend",

  footnote:
    "This estimates what you spend buying leads. It doesn't measure booked jobs or guarantee savings. Your own website gives customers a direct way to find and contact your business.",

  cta: "Show me what I'd own instead",
};

export const processSection = {
  eyebrow: "How it works",
  heading: "From first call to launch. No guesswork.",
  body: "A straightforward process, clear pricing, and your approval at every stage.",

  steps: [
    {
      icon: "call",
      title: "Start with a conversation",
      body: "We'll review your website, Google Business Profile, and how customers currently reach your business. You'll get an honest assessment and a clear project quote.",
      checklist: [
        "Website and mobile experience reviewed",
        "Google Business Profile reviewed",
        "Scope and fixed price agreed upfront",
      ],
    },
    {
      icon: "browser",
      title: "Built around your business",
      body: "Your website is structured around your services, service areas, and the actions customers need to take. You'll review the design and content before anything goes live.",
      checklist: [
        "Phone-first website design",
        "Service pages and customer-focused copy",
        "Clear calls to action and contact options",
      ],
    },
    {
      icon: "pin",
      title: "Launch and connect",
      body: "I launch your website, connect the relevant business tools, and test every important customer action so inquiries reach the right place.",
      checklist: [
        "Forms and booking tested",
        "Notifications connected",
        "Google Business Profile configured where included",
      ],
    },
    {
      icon: "chart",
      title: "Keep improving",
      body: "With the optional care plan, your website stays maintained and monitored. You'll receive straightforward reporting that shows what's happening and what deserves attention next.",
      checklist: [
        "Hosting, updates, and backups",
        "Website and lead performance reporting",
        "Clear recommendations for improvement",
      ],
    },
  ] satisfies ProcessStep[],
};

export const report = {
  eyebrow: "Know what's working",
  heading: "See where your opportunities come from.",
  body: "Track website calls, quote requests, bookings, and where customers found you. No jargon-heavy reports or 40-page PDFs. Just the numbers that matter, what changed, and what to improve next.",
  title: "Sample monthly report",
  badge: "Illustrative data",
  image: { src: reportBg.src, alt: "October report" },
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
  eyebrow: "Selected work",
  heading: "Built around what each business needs.",
  aside: "Strategy, design, and development.",
  featured: {
    name: "Casa de la Paz",
    industry: "Assisted living and senior housing",
    badge: "Senior care",
    highlight:
      "A clearer path for families and a streamlined hiring application",
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
      highlight:
        "Showcases the craftsmanship and makes ordering straightforward",
      href: "https://nortoncj.github.io/ButcherBlockGuy/",
      image: {
        src: ButcherBlockGroup.src,
        alt: "A craftsman cutting wood on a table saw",
      },
    },
    {
      name: "John R Clark & Co",
      industry: "Property maintenance",
      highlight:
        "Organizes services and builds trust through a professional online presence",
      href: "https://johnrclarkco.com",
      image: {
        src: JohnRClark.src,
        alt: "A man with a painted mural on a wall behind him",
      },
    },
    {
      name: "VFW Post 6827",
      industry: "Veterans post",
      highlight: "Makes membership information and directions easier to find",
      href: "https://vfwpost6827.org/",
      image: {
        src: VFW.src,
        alt: "A group of veterans standing in front of a VFW post",
      },
    },
  ] satisfies Project[],
};

export const packages = {
  eyebrow: "Straightforward pricing",
  heading: "Choose the right starting point.",
  careToggle: "Add ongoing website care",

  careLine:
    "+ Care plan: hosting, updates, backups, security monitoring, and monthly reporting. $79/mo",

  careOnNote: "Care plan selected. Cancel any time.",
  careOffNote: "One-time project pricing. The care plan is optional.",
  budgetNote:
    "Working with a smaller budget? Tell me what you've got and I'll tell you exactly what it buys. No pressure to upgrade.",
  tiers: [
    {
      name: "Launch",
      blurb:
        "A professional website that gives customers a better way to reach you.",
      price: `\$${site.priceFloor.toLocaleString("en-US")}`,
      priceNote: `one time, or $${Math.round((site.priceFloor * 1.192) / 12)}/mo for 12 months`,
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
      blurb: "A complete local presence built to turn searches into inquiries.",
      price: `$${Math.round(site.priceFloor / 0.6).toLocaleString("en-US")}`,
      priceNote: `one time, or $${Math.round((site.priceFloor * 1.1952) / 0.6 / 12)}/mo for 12 months`,
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
      blurb:
        "For businesses ready to connect their website to more of their operation.",
      // price: "$4,500",
      price: `$${Math.round(site.priceFloor / 0.6 / 0.55555).toLocaleString("en-US")}`,
      priceNote: `one time, or $${Math.round((site.priceFloor * 1.064) / 0.6 / 0.55555 / 12)}/mo for 12 months`,
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
  body: "Here are a few things business owners usually want to know.",
  items: [
    {
      q: "Who writes the content for my website?",
      a: "It depends on the package. With Launch, you provide the information and I refine it. With Grow and Run, I write the website copy around your services, customers, and service areas.",
    },
    {
      q: "What happens during the free call?",
      a: "We'll spend 15 minutes reviewing your website, Google Business Profile, and how customers currently contact you. You'll leave with an honest assessment and recommendations, whether we work together or not.",
    },
    {
      q: "Do you guarantee a certain number of leads?",
      a: "No. Results depend on factors like competition, demand, search visibility, and how quickly inquiries are handled. The goal is to build a stronger digital presence and make it easier for customers to contact your business.",
    },
    {
      q: "Is the care plan required?",
      a: "No. The care plan is optional. It covers ongoing hosting, updates, backups, security monitoring, and monthly reporting.",
    },
    {
      q: "How long does a website take to build?",
      a: "Timelines depend on the size of the project, the package you select, and how quickly we receive the required information and assets. Your timeline is agreed upon before work begins.",
    },
    {
      q: "Do you only work with one industry?",
      a: "No. I work with local service businesses including HVAC, plumbing, electric, roofing, cleaning, home care, contractors, and other businesses that serve customers at their location.",
    },
    {
      q: "Can my website connect to my existing business tools?",
      a: "Yes. Depending on the project, websites can connect to booking tools, contact forms, notification systems, CRMs, and other business applications.",
    },
  ] satisfies Faq[],
};

export const book = {
  eyebrow: "Free 15-minute call",
  heading: "Let's make it easier to win the next job.",
  body: "We'll review your website, Google listing, and how customers reach your business. You'll leave with a clearer picture of what's working, what's missing, and what could improve.",
  image: { src: ctaBg.src, alt: "electrician walking towards van" },
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
  heading: "One person from the first call to launch.",
  body: "You'll work directly with Chris, not an account manager or a revolving team of contractors. Every project is handled with a focus on the business, the customer experience, and the systems behind it.",
  primaryCta: "Book a free call",
  secondaryCta: "Try the demo application",
  name: "Chris Norton",
  role: "Founder & Lead Developer",
  bio: "With a background spanning software development, engineering, and digital marketing, Chris builds websites that do more than look good. They help businesses capture opportunities and connect their digital presence to the way they operate.",
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
