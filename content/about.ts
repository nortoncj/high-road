// Every word and image on /about lives here.
// Anything in [brackets] is yours to fill in. Don't invent the personal story.
// When you swap in a real photo, rewrite its alt to describe the real photo.

import type { StaticImageData } from "next/image";
import { Founder, Professional } from "@img/founder";
import { site } from "@/content/home";

// Accepts a static import (gets a free blur placeholder) or a plain URL.
export type Img = { src: StaticImageData | string; alt: string };

export type TimelineStep = {
  icon: "school" | "hvac" | "megaphone" | "rocket" | "bolt";
  label: string;
  body: string;
};

export const aboutMeta = {
  title: "About Chris Norton, Web Designer and Developer in Orlando, FL",
  description:
    "I'm Chris Norton, an engineer turned web designer who builds fast websites that help local businesses get more calls, bookings and leads.",
  path: "/about",
};

export const aboutHero = {
  eyebrow: "About me",
  headline: "I build websites that make local businesses' phones ring",
  intro:
    "Hi, I'm Chris Norton. I'm an engineer, a web designer, and the only person you'll deal with at WebTech Ninjas. I build websites for local businesses that make money when someone calls, books, or fills out a form, and I build them to do exactly that.",
  secondLine: "When you call, I pick up. When you need a change, you text me.",
  cta: { label: "Book a free call", href: site.bookHref },
  caption: { name: "Chris Norton", role: "Owner and developer, WebTech Ninjas" },
  badge: "Answers his own phone",
  photo: {
    src: Founder, // TODO: must be YOU before launch
    alt: "Chris Norton, chest up, natural window light, looking at the camera",
  } satisfies Img,
};

export const whyLocal = {
  eyebrow: "Why local businesses",
  heading: "Why I build for local businesses",
  // TODO: your real reason in a sentence or two, or leave null to hide this block.
  personalReason: null as string | null,
  paragraphs: [
    "For a local business, the website isn't decoration. It's where a stranger decides whether to call you or the next name on Google. Most small business sites lose that decision without the owner ever knowing it happened.",
    "Big companies have marketing teams to fix that. The plumber, the contractor and the woodworker usually have a site someone's nephew built in 2016 and an inbox they check when they get a minute.",
    "That's who I build for. Owners who are great at what they do and just need their website to pull its weight: show up, look legit, and get the phone ringing.",
  ],
};
/** Old name, kept so any existing import doesn't break. */
export const whyHomeCare = whyLocal;

export const background = {
  eyebrow: "Background",
  heading: "An engineer who learned marketing the hard way",
  timeline: [
    {
      icon: "school",
      label: "Engineering",
      body: "I studied Electrical Engineering at Florida International University in Miami. Engineers are trained to build things that work under pressure, and that's how I build websites: forms that actually send, alerts that actually arrive, pages that load fast on an old phone.",
    },
    {
      icon: "hvac",
      label: "Carrier Enterprise",
      // TODO: confirm this line matches what you did at Carrier Enterprise.
      body: "I worked at Carrier Enterprise, one of the big HVAC equipment distributors, where I built out enterprise resources platforms. It was my first look at how marketing and sales work in the real world, and how a website can make or break a business.",
    },
    {
      icon: "megaphone",
      label: "Marketing",
      body: "Then I moved into marketing. At a content agency I produced YouTube videos, Instagram reels, and blogs, and helped grow one Instagram account from about 200 followers to over 2,000. I also managed a Meta ad budget of $500 a week for a client.",
    },
    {
      icon: "rocket",
      label: "WebTech Ninjas",
      body: "Since then I've built and launched websites for local businesses on my own, from a custom woodworker to a contractor to a sushi pop-up to an assisted living provider. I found every one of those clients myself, mostly by phone and word of mouth.",
    },
    {
      icon: "bolt",
      label: "Off the clock",
      body: "Off the clock, I build hardware and cloud projects, like an energy monitoring system that tracks power use in real time. It keeps my engineering sharp.",
    },
  ] satisfies TimelineStep[],
  photo: {
    src: Professional, // TODO: a real photo of you working
    alt: "Chris at his laptop in his workspace, mid-task",
  } satisfies Img,
  meansHeading: "What that means for you",
  means: [
    { icon: "works", title: "It works.", body: "I test the forms, the alerts, and the phone buttons before you ever see them." },
    { icon: "sells", title: "It sells.", body: "I know what makes a busy customer tap call instead of the back button." },
    { icon: "real", title: "It's real.", body: "I've done this for real local businesses, not just practice projects." },
  ] as const,
};

export const howIWork = {
  eyebrow: "How I work",
  heading: "What you can hold me to",
  promises: [
    { title: "You talk to me.", body: "No sales rep, no account manager, no offshore team. The person on the call is the person building your site." },
    { title: "Words that sell.", body: "On Grow and Run, I write your copy. On Launch, you send the words and I tighten them. Either way, you approve every word before it goes live." },
    { title: "Plain English.", body: "No jargon, no tech talk. If I can't explain something simply, that's my problem, not yours." },
    { title: "Prices up front.", body: "Every package price is on the site. No surprise invoices.", link: { label: "See pricing", href: "/pricing" } },
    { title: "Real numbers.", body: "Growth care plan clients get a monthly report of visits, calls, and leads, in words, not charts you need a decoder ring for." },
    // TODO: set a reply time you can actually keep.
    { title: "Fast replies.", body: "I answer within 24 hours." },
    { title: "No promises I can't keep.", body: "I won't guarantee you a Google ranking. Anyone who does is selling something." },
  ] as { title: string; body: string; link?: { label: string; href: string } }[],
  signoff: "Chris",
};

export const quickFacts = {
  eyebrow: "Quick facts",
  heading: "The short version",
  facts: [
    { icon: "pin", label: "Based in", value: "Orlando, Florida" },
    { icon: "world", label: "Serving", value: "Local businesses anywhere in the US, by phone and video" },
    { icon: "school", label: "Education", value: "B.S. in Electrical Engineering, Florida International University" },
    { icon: "cert", label: "Certifications", value: "AWS Certified Cloud Practitioner, HubSpot Email Marketing" },
    { icon: "code", label: "Builds with", value: "WordPress for sites you edit yourself, custom code for everything else" },
  ] as const,
  portfolio: {
    heading: "Want to see the engineering side?",
    body: "My personal portfolio covers the cloud, automation, and hardware projects I build outside of client work. It's more technical than this site, but it shows how I think.",
    linkText: "See my portfolio at chrisnortonjr.com",
    href: "https://chrisnortonjr.com",
  },
};

export const aboutCta = {
  heading: "Let's talk about your business",
  body: "Fifteen minutes, no pitch deck. Tell me what your business does and what your site looks like today, and I'll tell you honestly what I'd change first. If I'm not the right fit, I'll say so.",
  primaryCta: { label: "Book a free call", href: site.bookHref },
  secondaryCta: { label: "See my work", href: "/work" },
};

// Used by the Person schema to help Google and AI search tell you apart from the other Chris Norton.
export const person = {
  name: "Chris Norton",
  jobTitle: "Web designer and developer",
  worksFor: "WebTech Ninjas",
  url: "https://webtechninjas.com/about",
  image: "https://webtechninjas.com/images/chris-norton.jpg", // TODO: your real photo's public URL
  sameAs: [
    "https://chrisnortonjr.com",
    "https://www.linkedin.com/in/chrisnortonjr", // TODO
  ],
  knowsLanguage: ["English"],
  alumniOf: "Florida International University",
};
