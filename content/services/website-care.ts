// Copy for /services/website-care. Edit words here, not in components.
// Plan prices and what each plan covers come from content/pricing.ts.

import { pillarLeads } from "@img/home";
import { serviceCare } from "@img/services";
import { care } from "@/content/pricing";
import { price } from "./prices";
import type { Service } from "./types";

export const websiteCare: Service = {
  slug: "website-care",
  label: "Website care",
  icon: "shield",
  title: "Your website, looked after",
  summary: "Hosting, backups, updates and small edits, handled by the person who built it. Text me a change and it's done.",
  highlights: ["Hosting, SSL and daily backups", "Updates and security watched", "Small edits by text"],
  price: `From ${price.hosted}`,
  image: {
    src: serviceCare,
    alt: "Cleaning business owner smiling at her laptop at the kitchen table in the evening",
  },
  meta: {
    title: "Website hosting, maintenance and care plans",
    description: `Hosting, daily backups, updates, security monitoring and small edits for your business website, from ${price.hosted}. Cancel any time, and you keep your site.`,
  },
  hero: {
    eyebrow: "Hosting, updates and care plans",
    intro:
      "A website isn't done at launch. Software needs updates, backups need checking, and your hours change. I look after all of it, so your site keeps working while you do.",
    badge: `Care plans from ${price.hosted}`,
    reassurances: ["Cancel any time", "You own your site", "Same-day response on Growth"],
  },
  pains: {
    heading: "Websites break quietly.",
    items: [
      "My site was down for a week, and I only found out when a customer told me.",
      "I need to change a phone number, and my web guy takes two weeks to answer.",
      "I got an email saying my site was hacked, and I had no idea who to call.",
    ],
  },
  features: {
    heading: "What a care plan covers",
    items: [
      {
        title: "Fast, secure and backed up",
        body: "Your site lives on secure hosting I set up and watch, with a fresh backup every day. If something breaks, I fix it, and if it's bad, I roll it back.",
        points: ["Hosting, SSL padlock and daily backups", "Updates and security monitoring", "Fixed fast when something goes wrong"],
        visual: { mockup: "care" },
      },
      {
        title: "Text me a change. It's done.",
        body: "New phone number? Holiday hours? A new service? Send me a text and I'll make the change, so your site never goes stale.",
        points: ["Small edits every month", "Same-day response on the Growth plan", "No tickets or portals, just me"],
        visual: { photo: { src: pillarLeads, alt: "Business owner on a call from the driver's seat of his truck" } },
      },
      {
        title: "A monthly report you can read",
        body: "On the Growth plan, you get a short report each month: how many people visited, called and filled out a form, and what I'd fix next.",
        points: ["Visits, calls and leads, month over month", "What changed, in plain English", "What I'd fix next"],
        visual: { mockup: "report" },
      },
    ],
  },
  tools: {
    items: [
      {
        icon: "cloud",
        name: "Secure cloud hosting",
        what: "Your site runs on modern cloud servers that I set up and keep an eye on. I'm an AWS Certified Cloud Practitioner, if you're curious.",
      },
      {
        icon: "backup",
        name: "Daily backups",
        what: "A fresh copy of your site every day, so a bad update or a mistake is never permanent.",
      },
      {
        icon: "lock",
        name: "SSL padlock",
        what: "Kept up to date, so browsers never warn your customers away.",
      },
      {
        icon: "shield",
        name: "Updates and security checks",
        what: "Software and plugin updates installed and checked, so old code doesn't become an open door. Security plus certified updates.",
      },
      {
        // TODO: confirm these are the two email providers you set up.
        icon: "mail",
        name: "Business email",
        what: "you@yourbusiness.com on Google Workspace or Microsoft 365, set up so your emails don't land in spam.",
      },
      {
        icon: "speed",
        name: "Speed fixes",
        what: "Big images and extra plugins are the usual reasons a site feels slow. I find them and fix them.",
      },
    ],
  },
  pricing: {
    heading: "Three care plans, cancel any time",
    body: "Care plans are optional, and your site keeps running either way. They just mean you never have to think about it.",
    lines: [
      { label: "Hosted", price: price.hosted, note: "Hosting, SSL and daily backups" },
      { label: "Handled", price: price.handled, note: "Adds updates, security monitoring and 30 minutes of edits a month" },
      { label: "Growth", price: price.growth, note: "Adds up to 2 hours of edits a month, a monthly report and same-day response" },
      { label: "Speed fix for an existing site", price: price.speedFix, note: "One time" },
      { label: "Business email setup", price: price.email, note: "One time" },
    ],
    note: care.fine,
  },
  faqs: [
    {
      q: "Do I need a care plan?",
      a: "No. Care plans are optional, and your site keeps running either way. They just mean you never have to think about hosting, updates or backups.",
    },
    {
      // TODO: confirm you take on care for sites you didn't build, or reword.
      q: "Can you look after a site you didn't build?",
      a: "Often, yes. I'll take a look first and tell you honestly what shape it's in. Sometimes a speed fix is all it needs.",
    },
    {
      q: "What counts as a small edit?",
      a: "Things like a new phone number, holiday hours, a price change, a new photo or a short new section. Bigger jobs, like new pages, are priced up front.",
    },
    {
      q: "What happens if I cancel?",
      a: "Cancel any time. I'll hand over your files or move the site wherever you want. It's your site.",
    },
  ],
};
