// Every word and image on /about lives here.
// Anything in [brackets] is yours to fill in. Don't invent the personal story.
// Images are Pexels stock placeholders; each alt is the PHOTO SUGGESTION for that spot.
// When you swap in your real photo, rewrite the alt to describe the real photo.

import { pexels } from "./pexels";
import { Founder, Professional } from "@img/founder"
export type Img = { src: string; alt: string };

export const aboutMeta = {
  title: "About Chris Norton, Home Care Website Designer in Florida",
  description:
    "I'm Chris Norton, an engineer and bilingual web designer who builds websites that help Florida home care agencies hire caregivers and win families.",
  path: "/about",
};

export const aboutHero = {
  eyebrow: "About me",
  headline:
    "I build websites for the people who care for everyone else's parents",
  intro:
    "Hi, I'm Chris Norton. I'm an engineer, a web designer, and the only person you'll deal with at WebTech Ninjas. I build websites for home care agencies in Sarasota and Orlando that help them hire caregivers, catch every call, and win families' trust.",
  secondLine:
    "When you call, I pick up. When you need a change, you text me. Hablo español.",
  cta: "Book a free call",
  caption: "Chris Norton, owner and developer, WebTech Ninjas",
  photo: {
    // Pexels 5425043. PLACEHOLDER of a stranger. Replace with your own portrait before launch.
    // src: pexels(5425043, 1200),
    src: Founder,
    alt: "Photo suggestion: Chris Norton, chest up, natural window light, real smile, looking at the camera, plain wall or a recognizable Sarasota or Orlando spot",
  } satisfies Img,
};

export const whyHomeCare = {
  eyebrow: "Why home care",
  heading: "Why I build for home care",
  // TODO: replace with your real reason, or set to null to hide this block.
  personalReason:
    "When my uncle got sick with dementia, I saw how hard it is for families to choose a caregiver. I worked with my family to find the best care options." as
      | string
      | null,
  paragraphs: [
    "Home care is the most personal business there is. A family is deciding whether to let a stranger into their home to care for someone they love. Most of the time, your website is where that decision starts.",
    "The same is true on the other side. Good caregivers are hard to find, and they decide in about a minute whether your agency looks like a place worth working. A website that makes applying easy can do more for your staffing than another month of job board ads.",
    // TODO: confirm this matches what you saw and that Casa de la Paz is OK being named.
    "I saw this up close building a site for Casa de la Paz, an assisted living and senior housing provider. Families read every page. They look for faces, licenses, and proof that real people answer the phone. That's what I build for.",
    "And a lot of the families and caregivers in Florida speak Spanish first. I'm bilingual, so your Spanish pages are written by someone who speaks the language, not run through a translation tool.",
  ],
};

export const background = {
  eyebrow: "Background",
  heading: "An engineer who learned marketing the hard way",
  paragraphs: [
    "I studied Electrical Engineering at Florida International University in Miami. Engineers are trained to build things that work under pressure, and that's how I build websites: forms that actually send, alerts that actually arrive, pages that load fast on an old phone.",
    // TODO: your role at Carrier Enterprise in one short line.
    "I worked at Carrier Enterprise, one of the big HVAC equipment distributors, where I built out interal data systems. It was my first look at how service businesses run on phone calls, follow-ups, and trust.",
    "Then I moved into marketing. At a content agency I produced YouTube videos, Instagram reels, and blogs, and helped grow one Instagram account from about 200 followers to over 2,000. I also managed a Meta ad budget of $500 a week for a client.",
    "Since then I've built and launched websites for local businesses on my own, from a woodworker to a veterans post to an assisted living provider. I found every one of those clients myself, mostly by phone and word of mouth.",
    "Off the clock, I build hardware and cloud projects, like an energy monitoring system that tracks power use in real time. It keeps my engineering sharp.",
  ],
  photo: {
    // Pexels 7794033. PLACEHOLDER. Replace with a real photo of you working.
    // src: pexels(7794033, 1200),
    src: Professional,
    alt: "Photo suggestion: Chris at his laptop in his real workspace, mid-task, not posing",
  } satisfies Img,
  meansHeading: "What that means for you",
  means: [
    {
      icon: "works",
      title: "It works.",
      body: "I test the forms, the alerts, and the phone buttons before you ever see them.",
    },
    {
      icon: "sells",
      title: "It sells.",
      body: "I know what makes a stressed visitor tap call instead of the back button.",
    },
    {
      icon: "real",
      title: "It's real.",
      body: "I've done this for real local businesses, not just practice projects.",
    },
  ] as const,
};

export const howIWork = {
  eyebrow: "How I work",
  heading: "What you can hold me to",
  promises: [
    {
      title: "You talk to me.",
      body: "No sales rep, no account manager, no offshore team. The person on the call is the person building your site.",
    },
    {
      title: "I write the words.",
      body: "You don't need to send me a pile of copy. You review it and approve it before anything goes live.",
    },
    {
      title: "Plain English.",
      body: "No jargon, no tech talk. If I can't explain something simply, that's my problem, not yours.",
    },
    {
      title: "Prices up front.",
      body: "Every package price is on the site. No surprise invoices.",
    },
    {
      title: "Real numbers.",
      body: "Care Plan clients get a monthly report of calls, inquiries, and applications, in words, not charts you need a decoder ring for.",
    },
    // TODO: set a reply time you can actually keep.
    { title: "Fast replies.", body: "I answer within 24 hours." },
    {
      title: "No promises I can't keep.",
      body: "I won't guarantee you a Google ranking. Anyone who does is selling something.",
    },
  ],
};

export const quickFacts = {
  eyebrow: "Quick facts",
  heading: "The short version",
  facts: [
    { icon: "pin", label: "Based in", value: "Orlando, Florida" },
    {
      icon: "world",
      label: "Serving",
      value: "Sarasota, Venice, North Port, Lakewood Ranch, and Orlando",
    },
    { icon: "language", label: "Languages", value: "English and Spanish" },
    {
      icon: "school",
      label: "Education",
      value: "B.S. in Electrical Engineering, Florida International University",
    },
    {
      icon: "cert",
      label: "Certifications",
      value: "AWS Certified Cloud Practitioner, HubSpot Email Marketing",
    },
    {
      icon: "code",
      label: "Builds with",
      value:
        "WordPress for sites you edit yourself, custom code for everything else",
    },
  ] as const,
  portfolio: {
    heading: "Want to see the engineering side?",
    body: "My personal portfolio covers the cloud, automation, and hardware projects I build outside of client work. It's more technical than this site, but it shows how I think.",
    linkText: "See my portfolio at chrisnortonjr.com",
    href: "https://chrisnortonjr.com",
  },
};

export const aboutCta = {
  heading: "Let's talk about your agency",
  body: "Fifteen minutes, no pitch deck. Tell me who you're trying to hire and what your site looks like today, and I'll tell you honestly what I'd change first. If I'm not the right fit, I'll say so.",
  primaryCta: "Book a free call",
  secondaryCta: "See what I build",
  secondaryHref: "/services",
};

// Used by PersonSchema to help Google and AI search tell you apart from the other Chris Norton.
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
  knowsLanguage: ["English", "Spanish"],
  alumniOf: "Florida International University",
};
