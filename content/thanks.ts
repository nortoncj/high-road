// Copy for /thanks/message and /thanks/booked.

import { site } from "@/content/home";

export type ThanksKind = "message" | "booked";

export type Step = { title: string; body: string };
export type LinkCard = { label: string; body: string; href: string };

export type ThanksPage = {
  meta: { title: string; description: string };
  eyebrow: string;
  headline: string;
  body: string;
  icon: "mail" | "calendar";
  stepsHeading: string;
  steps: Step[];
  /** The one next move this page pushes. */
  nudge?: { heading: string; body: string; cta: string; href: string };
  aside?: { heading: string; body: string };
};

const whileYouWait: { heading: string; links: LinkCard[] } = {
  heading: "While you wait",
  links: [
    { label: "See my work", body: "Real sites for real local businesses.", href: "/work" },
    { label: "See pricing", body: "Three fixed prices, no surprise invoices.", href: "/pricing" },
    { label: "About me", body: "The person who'll answer when you call.", href: "/about" },
  ],
};

export const thanks: Record<ThanksKind, ThanksPage> & { whileYouWait: typeof whileYouWait } = {
  message: {
    meta: { title: "Message received", description: "Thanks for reaching out to WebTech Ninjas." },
    eyebrow: "Message sent",
    headline: "Got it. I'll reply within 24 hours.",
    body: "A copy of your message is on its way to your inbox now, so you have it for your records. I read every one myself.",
    icon: "mail",
    stepsHeading: "What happens next",
    steps: [
      { title: "Check your inbox", body: "The confirmation should land in a minute. Not there? Check spam or Promotions and mark it safe so my reply gets through." },
      { title: "I read it and reply", body: "You'll hear back from me, Chris, by email within 24 hours. Usually sooner." },
      { title: "We talk, if it's a fit", body: "If it sounds like I can help, I'll suggest a free 15 minute call. If not, I'll tell you who can." },
    ],
    nudge: {
      heading: "Want to skip the back-and-forth?",
      body: "Grab a free 15 minute call now and we'll go over your site together.",
      cta: "Pick a time",
      href: site.bookHref,
    },
  },
  booked: {
    meta: { title: "Call booked", description: "Your free 15 minute call with WebTech Ninjas is booked." },
    eyebrow: "You're booked",
    headline: "You're on my calendar.",
    body: "The invite and call details are in your email from Calendly. Add it to your calendar so it doesn't sneak up on you.",
    icon: "calendar",
    stepsHeading: "Get the most out of 15 minutes",
    steps: [
      { title: "Have your website handy", body: "If you don't have one yet, that's fine. Bring the name of a competitor's site you like or hate." },
      { title: "Know where leads come from", body: "Google, referrals, Facebook, lead sites. A rough guess is plenty." },
      { title: "Bring your biggest headache", body: "The one thing about your website or leads that bugs you most. We'll start there." },
    ],
    aside: {
      heading: "Need to change the time?",
      body: `Use the reschedule link in your Calendly email, or call or text me at ${site.phone}.`,
    },
  },
  whileYouWait,
};
