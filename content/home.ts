// Every word and image on the homepage lives here, so you can edit copy
// without touching components (and move it into Sanity later).
// Anything in [brackets] is a placeholder you still need to fill.

import {CDP , ButcherBlockGroup, JohnRClark, VFW, AboutHeadshot, Hero} from "@img/thumbnails";

export type NavLink = { label: string; href: string };

export type TrustItem = {
  icon: "heart" | "language" | "phone" | "chart" | "pin";
  label: string;
  detail: string;
};

export type ProcessStep = {
  icon: "browser" | "users" | "apply" | "calendar";
  title: string;
  body: string;
  checklist: string[];
};

export type Project = {
  name: string;
  industry: string;
  href: string;
  image: { src: string; alt: string };
};

export type FeaturedProject = Project & {
  badge: string;
  summary: string;
  quote: { text: string; name: string; title: string };
};

// Stock photos from Pexels (free to use, no attribution required).
// Swap any src for a real photo or screenshot by changing it here.
// Pexels pattern: https://images.pexels.com/photos/{id}/pexels-photo-{id}.jpeg
const pexels = (id: number, width = 1600) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;

export const site = {
  name: "WebTech Ninjas",
  monogram: "WN", // stand-in until a real logo mark exists
  tagline: "Already handled.",
  oneLiner:
    "Websites that help home care agencies hire caregivers and win families.",
  phone: "727-808-9853",
  phoneHref: "tel:+17278089853", // TODO: real number, digits only
  email: "chris@webtechninjas.com",
  emailHref: "mailto:chris@webtechninjas.com", // TODO
  city: "Orlando, FL",
  bookHref: "/book",
  demoHref: "/demo",
  priceFloor: "$1,300",
} as const;

export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Demo", href: "/demo" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
];

export const hero = {
  eyebrow: "Websites for Florida home care agencies",
  headline: "Short on caregivers? Let your website do the hiring.",
  body: "I build bilingual, phone-first websites that help home care agencies attract good caregivers, get real applications, and call them back fast. So you can get back to running your agency.",
  primaryCta: "Book a free call",
  secondaryCta: "Try the demo application",
  reassurances: ["Free 15 minute call", "No tech talk", "Built for phones"],
  // "Se habla español"
  image: {
    // Pexels 29373893, "Elderly Care at Home: Generational Connection"
    // TODO: replace with a real shoot (caregiver + client, signed releases).
    // src: pexels(29373893, 1800),
    // src: "https://images.pexels.com/photos/6248907/pexels-photo-6248907.jpeg?auto=compress&cs=tinysrgb&w=1800",
    src: Hero.src,
    alt: "A caregiver sharing a warm moment with an older woman at home",
  },
  alerts: [
    {
      title: "New application",
      meta: "Home health aide · Weekdays",
      time: "2:14 PM",
    },
    {
      title: "Auto reply sent",
      meta: "Thanks for applying. We'll call you today.",
      time: "2:14 PM",
    },
  ],
  summary: {
    title: "Applications land on your phone",
    body: "From caregivers, in English and Spanish, any hour of the day.",
  },
};

export const trustHeading = "Built for Florida home care agencies";

export const trustItems: TrustItem[] = [
  {
    icon: "heart",
    label: "Senior care focus",
    detail: "Home care and assisted living",
  },
  // {
  //   icon: "language",
  //   label: "English and Español",
  //   detail: "Every page, every form",
  // },
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

export const processSection = {
  eyebrow: "How it works",
  heading: "Four steps. You approve everything.",
  body: "One call to start. You sign off before anything goes live.",
  steps: [
    {
      icon: "browser",
      title: "I build your site.",
      body: "A modern, bilingual website I write for you, with a careers page and a page for every role you hire.",
      checklist: [
        "Mobile friendly",
        "English and Spanish",
        "You approve before launch",
      ],
    },
    {
      icon: "users",
      title: "Caregivers find you.",
      body: "Job pages built to show up when caregivers search near you, in English and Spanish.",
      checklist: [
        "A page for every role",
        "Pay and hours up front",
        "Local search basics",
      ],
    },
    {
      icon: "apply",
      title: "They apply, not just inquire.",
      body: "A three step application they finish on their phone in about three minutes.",
      checklist: [
        "Simple online application",
        "Instant text and email alerts",
        "Every application logged",
      ],
    },
    {
      icon: "calendar",
      title: "You call them back fast.",
      body: "Applications land on your phone and in one sheet, so you can call good people the same day.",
      checklist: [
        "Real people, not bots",
        "Everything in one place",
        "Update job posts yourself",
      ],
    },
  ] satisfies ProcessStep[],
};

export const demo = {
  heading: "See it in action",
  body: "Apply to a pretend agency on your own phone. It's the same hiring flow I build for clients.",
  cta: "Try the demo application",
  features: [
    "Real application form",
    // "English and Español",
    "Built for phones",
    "Text and email alerts",
  ],
};

export const recentWork = {
  eyebrow: "Recent work",
  heading: "Real sites for real local businesses, senior care included.",
  aside: "Built and written by me.",
  featured: {
    name: "Casa de la Paz",
    industry: "Assisted living and senior housing",
    badge: "Senior care",
    href: "cdpliving.com", // TODO: case study or live site
    summary:
      "Website for a bilingual assisted living and senior housing community in Sarasota, Florida. Built to attract families and caregivers, with a careers page and online application.",
    quote: {
      text: "[A real quote from Casa de la Paz, with written permission.]",
      name: "Petra",
      title: "Owner, Casa de la Paz",
    },
    image: {
      // Pexels 18429308. TODO: replace with a real screenshot of the site.
      // src: pexels(18429308, 1400),
      src: CDP.src,
      alt: "A caregiver talking with a group of seniors around a table",
    },
  } satisfies FeaturedProject,
  projects: [
    {
      name: "Butcher Block Guy",
      industry: "Woodworking",
      href: "#",
      // Pexels 5710840. TODO: real screenshot.
      image: {
        // src: pexels(5710840, 900),
        src: ButcherBlockGroup.src,
        alt: "A craftsman cutting wood on a table saw",
      },
    },
    {
      name: "John R Clark & Co",
      industry: "Property Maintenance",
      href: "#",
      // Pexels 7792772. TODO: real screenshot.
      image: {
        // src: pexels(7792772, 900),
        src: JohnRClark.src,
        alt: "A man with a painted mural on a wall behind him",
      },
      
    },
    {
      name: "VFW Post 6827",
      industry: "Veterans post",
      href: "#",
      // Pexels 935499. TODO: real screenshot.
      image: {
        // src: pexels(935499, 900),
        src: VFW.src,
        alt: "A group of veterans standing in front of a VFW post",
      },
    },
  ] satisfies Project[],
};

export const about = {
  eyebrow: "Let's talk",
  heading: "Ready to get more caregivers applying?",
  body: "Book a free 15 minute call. I'll look at your current site and show you what's getting in the way of applicants. No pressure, no tech talk.",
  primaryCta: "Book a free call",
  secondaryCta: "Try the demo application",
  name: "Chris Norton",
  role: "Owner and lead developer",
  bio: "I build every site myself and answer my own phone. Se habla español.",
  photo: {
    // Pexels 7794033 is a PLACEHOLDER of a stranger. Do not launch with it:
    // a stock face labeled as you is the fastest way to lose a trust-first buyer.
    // src: pexels(7794033, 800),
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
  ],
  legal: [
    { label: "Privacy policy", href: "/privacy" },
    { label: "Terms of service", href: "/terms" },
  ] satisfies NavLink[],
};
