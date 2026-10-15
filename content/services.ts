// Every word and image on /services lives here.
// Images are Pexels stock placeholders. Per your request, each alt text is the
// PHOTO SUGGESTION for that spot. When you swap in a real photo, rewrite the alt
// to describe what the real photo actually shows (screen readers and Google read it).

import { pexels } from "./pexels";

export type Img = { src: string; alt: string };

export type PainPoint = {
  id: string;
  number: string;
  title: string;
  quote: string;
  body: string;
  bullets: string[];
  image: Img;
  note?: string;
};

export type IncludedItem = {
  icon: "pencil" | "phone" | "eye" | "call" | "careers" | "chart" | "search" | "people";
  title: string;
  body: string;
};

export type Package = {
  name: string;
  price: string;
  bestFor: string;
  includes: string[];
  featured?: boolean;
};

export type FaqItem = { question: string; answer: string };

export const servicesMeta = {
  title: "Home Care Website Design in Sarasota and Orlando, FL",
  description:
    "Websites for home care agencies that hire caregivers, catch after-hours calls, and bring families straight to you. Bilingual, built for phones. Free call.",
  path: "/services",
};

export const servicesHero = {
  eyebrow: "Home care website design for Sarasota and Orlando",
  headline: "Websites that hire caregivers, catch every call, and bring families to you",
  body:
    "Most home care sites are a brochure. Yours should work the night shift. I build bilingual, phone-first websites that bring in caregiver applications, catch the 9pm call from a worried daughter, and send families straight to you instead of through a lead site.",
  primaryCta: "Book a free call",
  secondaryCta: "Try the demo application",
  reassurances: ["Free 15 minute call", "No pressure, no tech talk", "Se habla español"],
  image: {
    // Pexels 18459198
    src: pexels(18459198, 1600),
    alt: "Photo suggestion: a real caregiver from a client agency helping an older client at home, warm window light, both faces visible, shot with a signed release",
  },
  jumpHeading: "What I fix",
};

export const painIntro = {
  eyebrow: "What I fix",
  heading: "Three problems cost home care agencies the most. Your website can fix all three.",
};

export const painPoints: PainPoint[] = [
  {
    id: "hiring",
    number: "01",
    title: "Hire caregivers without living on Indeed",
    quote:
      "I could take on more clients tomorrow if I had the staff. I post on Indeed, get a pile of applications, a few show up, and one actually starts.",
    body:
      "Good caregivers are looking for work on their phones, on their break, often in Spanish. If your site makes them hunt for a careers page or fill out a desktop form, they apply somewhere else. I turn your website into the place caregivers apply first.",
    bullets: [
      "A careers page that leads with pay, hours, and benefits, so the right people apply",
      "A page for every role you hire (HHA, CNA, companion caregiver), built to show up when caregivers search near you",
      "A three step application they finish on a phone in about three minutes, in English or Spanish",
      "An instant text and email to you when someone applies, plus an auto reply so they know you got it",
      "Every application logged in one sheet, so nobody gets lost in your inbox",
      "Job posts you can update yourself, or text me and I'll do it",
    ],
    image: {
      // Pexels 6097957
      src: pexels(6097957, 1200),
      alt: "Photo suggestion: a caregiver in scrubs on a break, coffee in one hand, applying on her phone with the other",
    },
  },
  {
    id: "after-hours",
    number: "02",
    title: "Never miss the 9pm call",
    quote:
      "Dad gets discharged tomorrow. His daughter is panicking at night, she calls three agencies, and whoever picks up first wins. If I'm asleep, I lose.",
    body:
      "Families don't search for home care on your schedule. They search at night, after a hospital visit, often from another state. Your site should catch them when you can't.",
    bullets: [
      "A click to call button on every page, so families on a phone reach you in one tap",
      "An after hours callback form that asks only what you need: name, phone, best time, and city",
      "An instant text and email to you or your on-call person when a request comes in",
      "A clear what happens next message, so the family knows when you'll call and stops dialing your competitors",
    ],
    image: {
      // Pexels 18227764
      src: pexels(18227764, 1200),
      alt: "Photo suggestion: an adult daughter at her kitchen table at night, phone to her ear, lit by a single lamp",
    },
  },
  {
    id: "families",
    number: "03",
    title: "Bring families straight to you, not through a lead site",
    quote:
      "I'm paying a fortune per referral, and the same family gets sent to four other agencies. By the time I call back, someone already got them. I'm renting my customers.",
    body:
      "Shared lead services can fill gaps, but every lead is one you pay for and compete for. A website that shows up when families search for home care in your city brings you inquiries you own: no per-lead fee, no race against four other agencies.",
    bullets: [
      "Pages for the services families search for: companion care, personal care, respite care, 24 hour care",
      "Pages for the towns you serve, so you show up close to home",
      "A trust page with your license, how you screen caregivers, real team photos, and real reviews",
      "A payment options page (private pay, long term care insurance, VA benefits) that cuts calls that go nowhere",
      "Call and form tracking, so you can see how many families came from your site each month",
    ],
    image: {
      // Pexels 3831156
      src: pexels(3831156, 1200),
      alt: "Photo suggestion: an adult daughter and her older father on the couch at home, looking at care options together on a laptop",
    },
    note:
      "Search results take time and nobody can promise you a ranking. What I can promise is a site built the way search engines and families both expect, with the numbers to show you what's working.",
  },
];

export const included = {
  eyebrow: "Included in every site",
  heading: "Every site comes with the basics done right",
  items: [
    { icon: "pencil", title: "Written for you", body: "I write the words. You review and approve before anything goes live." },
    { icon: "phone", title: "Built for phones first", body: "Big buttons, readable text, fast pages. That's where families and caregivers find you." },
    { icon: "eye", title: "Easy to read at any age", body: "Large type, strong contrast, and plain language for the dad and the daughter helping him." },
    { icon: "call", title: "Click to call everywhere", body: "One tap to reach you from every page, day or night." },
    { icon: "careers", title: "Careers page and application", body: "Even the starter package hires. Caregivers apply from their phone." },
    { icon: "chart", title: "Call and form tracking", body: "A plain English look at how many calls, inquiries, and applications came in." },
    { icon: "search", title: "Search basics", body: "Clean titles, descriptions, and structure, so Google knows what you do and where." },
    { icon: "people", title: "Real people, not stock", body: "Your team's real faces wherever you can share them. Families trust people they can see." },
  ] satisfies IncludedItem[],
};

export const packages = {
  eyebrow: "Packages",
  heading: "Three ways to start. Every price stated up front.",
  items: [
    {
      name: "Front Porch",
      price: "$1,300",
      bestFor: "New or small agencies that need to look legit and start collecting applications",
      includes: ["Up to 5 pages, written for you", "Careers page with a mobile application", "Click to call on every page", "Call and form tracking"],
    },
    {
      name: "Hiring Ready",
      price: "$1,800",
      bestFor: "Established agencies that are short on caregivers",
      featured: true,
      includes: [
        "Everything in Front Porch, up to 8 pages",
        "A page for every role you hire",
        "Application alerts and auto replies",
        "Every application logged in one sheet",
        "Payment options and trust pages",
        "A site you can edit yourself",
      ],
    },
    {
      name: "Fully Staffed",
      price: "$2,500",
      bestFor: "Growing agencies covering several towns",
      includes: [
        "Everything in Hiring Ready, up to 12 pages",
        "A page for each town you serve",
        "Blog setup with 2 articles",
        "Google Business Profile cleanup",
        "Logo refresh and a walkthrough call",
      ],
    },
  ] satisfies Package[],
  carePlan: {
    title: "Care Plan",
    price: "$129 a month",
    body: "Hosting, backups, security updates, up to 2 hours of changes, job post updates whenever you're hiring, and a plain English monthly report of calls, inquiries, and applications.",
  },
  spanish: {
    title: "Spanish version",
    price: "$500 add-on",
    body: "A full Spanish site and caregiver application, written for the reader, not run through a translation tool.",
  },
  cta: "See full pricing",
  ctaHref: "/pricing",
};

export const fit = {
  eyebrow: "Who this is for",
  heading: "Built for independent home care agencies",
  good: [
    "You own an independent home care or senior care agency in Sarasota, Venice, North Port, Lakewood Ranch, or Orlando",
    "You could take on more clients if you had more caregivers",
    "You pay for shared leads and want families who come to you first",
    "Your website is out of date, hard to update, or missing",
    "You serve Spanish speaking families or hire Spanish speaking caregivers",
  ],
  notFit: [
    "You run a franchise location. Your corporate office controls your website.",
    "You want guaranteed rankings. Nobody honest can promise that.",
  ],
};

export const faq = {
  eyebrow: "FAQ",
  heading: "Questions home care owners ask",
  items: [
    {
      question: "How much does a website for a home care agency cost?",
      answer:
        "My home care websites cost $1,300 to $2,500 to build, depending on how many pages and hiring tools you need. Hosting, updates, and a monthly report are $129 a month on the Care Plan. Every price is listed on the pricing page, with no surprise fees.",
    },
    {
      question: "How long does it take to build a home care website?",
      answer:
        "Most sites take 2 to 6 weeks. A starter site takes about 2 weeks, and the largest package takes 5 to 6. The biggest factor is how quickly you can send photos and approve the copy.",
    },
    {
      question: "Can a website really help me recruit caregivers?",
      answer:
        "Yes, if it's built for it. Caregivers search for jobs on their phones, so a careers page with pay up front, a page for each role, and a short mobile application gets you more finished applications than a generic contact form. You also get an alert the moment someone applies, so you can call while they're still interested.",
    },
    {
      question: "How do I get home care clients without paying for referral services?",
      answer:
        "You need a website that shows up when families search for care in your town and gives them a reason to call you. That means pages for each service and town you cover, a trust page with your license and screening process, and real reviews. Those inquiries are yours alone, with no per-lead fee and no other agencies getting the same family.",
    },
    {
      question: "What happens when a family contacts us after hours?",
      answer:
        "They can tap to call or fill out a short callback form. You or your on-call person get a text and an email right away, and the family sees a message telling them when you'll call back. Nobody falls through the cracks overnight.",
    },
    {
      question: "Is the website HIPAA compliant?",
      answer:
        "The forms are built to keep you out of HIPAA territory. They ask only for contact details and the best time to call, never health conditions or medical history, and they include a note asking families not to share medical details. Your intake process still needs its own HIPAA review. I'm a web developer, not a lawyer.",
    },
    {
      question: "Do you build websites in Spanish?",
      answer:
        "Yes. I'm bilingual, and I can build a full Spanish version of your site and your caregiver application. It's written for Spanish speaking families and caregivers, not run through a translation tool.",
    },
    {
      question: "Can I update job posts and photos myself?",
      answer:
        "Yes. The Hiring Ready and Fully Staffed sites let you edit pages and job posts yourself. If you'd rather not, Care Plan clients can text me changes and I'll handle them.",
    },
    {
      question: "Will my site show up on Google?",
      answer:
        "Every site is built with the search basics done right: clear titles, service pages, town pages, and fast loading on phones. Nobody can honestly guarantee a ranking, and anyone who does is selling something. What I can show you is a monthly report of the calls, inquiries, and applications your site brings in.",
    },
    {
      question: "Do I own my website?",
      // TODO: finish once you decide what happens to hosting and files if a client cancels the Care Plan.
      answer: "Yes. Your domain, your content, and your photos belong to you. [Finish this answer with your hosting and file policy.]",
    },
    {
      question: "What areas do you serve?",
      answer:
        "I work with home care agencies in Sarasota, Venice, North Port, Lakewood Ranch, and Orlando. Calls and reviews happen over the phone or video, so you don't need to be local to work with me.",
    },
    {
      question: "Do you work with franchise home care agencies?",
      answer:
        "No. Franchise locations usually have their website controlled by the corporate office. I work with independent agencies who can make their own decisions.",
    },
  ] satisfies FaqItem[],
};

export const servicesCta = {
  heading: "Find out what your site is costing you",
  body:
    "On a free 15 minute call, I'll look at your current site the way a caregiver and a worried daughter would. You'll leave knowing where applicants drop off, where after-hours calls get lost, and what to fix first, whether you hire me or not.",
  primaryCta: "Book a free call",
  secondaryCta: "Try the demo application",
  fine: "Packages start at $1,300. Se habla español.",
};
