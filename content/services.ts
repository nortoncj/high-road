// Copy for /services and the frame around every /services/<slug> page. Edit words here, not in components.
// Each service's own copy lives in content/services/<slug>.ts. Add one there, then list it below.

import { about, recentWork, site } from "@/content/home";
import { mockupPhoneSite } from "@img/services";
import { hiringPages } from "./services/hiring-pages";
import { leadAlerts } from "./services/lead-alerts-and-booking";
import { localSeo } from "./services/local-seo";
import { price } from "./services/prices";
import { trackingAndAutomation } from "./services/tracking-and-automation";
import type { Service } from "./services/types";
import { websiteCare } from "./services/website-care";
import { websiteDesign } from "./services/website-design";

/** In the order they show on /services: the site, getting found, getting the call, then everything around it. */
export const services: Service[] = [websiteDesign, localSeo, leadAlerts, hiringPages, trackingAndAutomation, websiteCare];

export const serviceHref = (slug: string) => `/services/${slug}`;
export const getService = (slug: string) => services.find((s) => s.slug === slug);

export const servicesMeta = {
  title: "Services for local service businesses",
  description:
    "Websites, Google Maps, lead alerts and booking, hiring pages, lead tracking and website care for local businesses that run on calls. Plain English, prices up front.",
  path: "/services",
};

export const servicesHero = {
  eyebrow: "Services",
  headline: "Everything between a Google search and a booked job",
  body: "I build your website, get you on the map, text you every new lead, and show you what's working. Pick the one thing you need, or let me set up the whole system. Plain English, prices up front.",
  primaryCta: { label: "Book a free call", href: site.bookHref },
  secondaryCta: { label: "Not sure where to start?", href: "#where-to-start" },
  menuLabel: "What I do",
};

export const serviceGrid = {
  eyebrow: "What I do",
  heading: "Six services, explained in plain English",
  more: "See how it works",
};

export const serviceGuide = {
  eyebrow: "Where to start",
  heading: "Start with what's bugging you",
  body: "Pick the line that sounds like you. Each one goes to the service that fixes it.",
  items: [
    { quote: "I don't have a website, or I'm embarrassed by mine.", service: websiteDesign },
    { quote: "People can't find me on Google Maps.", service: localSeo },
    { quote: "I miss calls while I'm on a job.", service: leadAlerts },
    { quote: "I can't find good help.", service: hiringPages },
    { quote: "I can't tell what marketing channels actually work.", service: trackingAndAutomation },
    { quote: "I have a website and my website works, but it needs updates.", service: websiteCare },
  ],
};

export const fit = {
  eyebrow: "Who it's for",
  heading: "Built for local businesses that live on leads.",
  good: {
    title: "A good fit if",
    items: [
      "Your business makes money when someone calls, books or fills out a form",
      "Your website is out of date, slow, hard to update, or missing",
      "You've had leads slip through the cracks and want that to stop",
      "You'd rather work with one person who answers the phone than a big agency",
    ],
  },
  bad: {
    title: "Not a fit if",
    items: [
      "You need a large online store with hundreds of products",
      "You want guaranteed rankings. Nobody honest can promise that.",
    ],
  },
};

export const servicesFaq = {
  eyebrow: "Questions",
  heading: "What owners ask before they pick",
  items: [
    {
      q: "Do I have to buy everything?",
      a: "No. Most owners start with a website and add the rest when they're ready. Several of these come bundled in the Grow and Run packages, so you don't pay for them twice.",
    },
    {
      // TODO: confirm which services you take on for sites you didn't build.
      q: "I already have a website. Can you still help?",
      a: "Often, yes. I can set up your Google Business Profile, speed up a slow site, or look after hosting and updates. If your current site is fighting you, I'll tell you honestly whether a fix or a rebuild costs less.",
    },
    {
      q: "Do I need to understand any of the tech?",
      a: "No. You'll get texts, a simple lead list and a plain English report. I handle the rest, and I'm happy to explain anything you're curious about without the jargon.",
    },
    {
      q: "Who will I actually be working with?",
      a: "Me, Chris. I build every site myself and answer my own phone. No account managers, no handoffs.",
    },
    {
      q: "How much does it cost?",
      a: `Website packages start at ${price.launch}, care plans start at ${price.hosted}, and every price is on the pricing page. You'll know the exact price before I start.`,
    },
  ],
};

/** The closing band on /services and every service page. A service can swap the heading and text. */
export const servicesCta = {
  eyebrow: "Free 15 minute call",
  heading: "Not sure which one you need?",
  body: "Tell me how customers find you today. I'll look at your site and your Google listing the way a customer would and tell you what I'd fix first, whether you hire me or not.",
  person: { name: about.name, line: "Answers his own phone", photo: about.photo },
  primaryCta: { label: "Book a free call", href: site.bookHref },
  secondaryCta: { label: "See pricing", href: "/pricing" },
  fine: `Website packages start at ${price.launch}.`,
};

/** Labels for the frame around every /services/<slug> page. Anything a service fills in wins. */
export const servicePage = {
  crumbs: { home: { label: "Services", href: "/services" } },
  primaryCta: { label: "Book a free call", href: site.bookHref },
  pricingLink: { label: "See what it costs", href: "#pricing" },
  pains: { eyebrow: "Sound familiar?" },
  features: { eyebrow: "What you get" },
  tools: {
    eyebrow: "Under the hood",
    heading: "What it's built with",
    body: "You don't need to know any of this to work with me. But if you're curious, here's what's doing the work, in plain English.",
  },
  pricing: { eyebrow: "What it costs", link: { label: "See full pricing", href: "/pricing" } },
  faqs: { eyebrow: "Questions", heading: "What owners ask me first" },
  others: { eyebrow: "More ways I help", heading: "Other services", all: "All services" },
  cta: {
    heading: "Find out what your website is costing you.",
    body: "I'll look at your site and your Google listing the way a customer would and show you where leads slip away. Hire me or not, you'll know what to fix first.",
  },
  // Real client sites, pulled from the homepage so the two never drift apart.
  work: {
    eyebrow: "Recent work",
    heading: "Real sites for real local businesses.",
    link: { label: "See all my work", href: "/work" },
    projects: [recentWork.featured, ...recentWork.projects],
  },
};

/** Words inside the pictures drawn in code. Each picture says "Example" on screen. */
export const mockups = {
  example: "Example",
  business: "Ruiz Heating & Air",
  timeline: {
    label: "What happens when a lead comes in",
    events: [
      { time: "2:14:06 PM", title: "New form lead", meta: "Water heater install · Kitchen leak" },
      { time: "2:14:08 PM", title: "Text sent to you", meta: "Dana R. · (555) 555-0142 · Tap to call" },
      { time: "2:14:08 PM", title: "Auto reply sent to Dana", meta: "Thanks! I'll call you within the hour." },
      { time: "2:14:08 PM", title: "Lead saved, source logged", meta: "Google Maps · Mobile" },
    ],
  },
  alerts: {
    clock: "2:14",
    date: "Friday, October 17",
    now: "now",
    notifications: [
      { app: "Text", title: "New lead: Dana R.", body: "Water heater install · Tap to call" },
      { app: "Website", title: "Auto reply sent", body: "“Thanks! I'll call you within the hour.”" },
    ],
    call: "Tap to call",
  },
  makeover: {
    before: {
      label: "Typical DIY site",
      nav: ["HOME", "ABOUT US", "SERVICES", "CONTACT"],
      title: "Welcome to our website!",
      body: "Click here for more info about our services",
    },
    after: { label: "A site I built", project: recentWork.projects[1] },
  },
  phone: { image: mockupPhoneSite, call: "Tap to call" },
  report: {
    title: "Where your leads came from",
    total: "42 leads this month",
    sources: [
      { name: "Google search", value: 18 },
      { name: "Google Maps", value: 14 },
      { name: "Referrals", value: 7 },
      { name: "Facebook", value: 3 },
    ],
  },
  maps: {
    search: "ac repair near me",
    rating: "4.9",
    reviews: "87 reviews",
    category: "Air conditioning contractor",
    hours: "Open · Closes 6 PM",
    actions: ["Call", "Directions", "Website"],
  },
  reviews: {
    message: "Thanks for choosing Ruiz Heating & Air! Mind leaving a quick review? It really helps a small business.",
    link: "g.page/r/review",
    reply: "Done! Thanks for coming out so fast.",
    review: {
      name: "Dana R.",
      when: "Just now",
      text: "Showed up the same day and had the AC running in an hour. Fair price, great guy.",
    },
  },
  booking: {
    title: "Book a visit",
    service: "AC tune-up · 1 hour",
    days: [
      { day: "Mon", date: "13" },
      { day: "Tue", date: "14" },
      { day: "Wed", date: "15" },
      { day: "Thu", date: "16" },
      { day: "Fri", date: "17" },
    ],
    times: ["8:00 AM", "10:00 AM", "12:30 PM", "3:00 PM"],
    pickedDay: 1,
    pickedTime: 1,
    button: "Book Tue, 10:00 AM",
    confirm: "Booked. It's on your calendar.",
  },
  application: {
    title: "Join our crew",
    role: "HVAC technician",
    meta: "Full time · $24 to $32 an hour",
    step: "Step 2 of 3",
    fields: [
      { label: "Years in the trade", value: "2 to 5 years" },
      { label: "EPA 608 certified?", value: "Yes" },
      { label: "When can you start?", value: "Within 2 weeks" },
    ],
    button: "Next",
    alert: { app: "Text", title: "New applicant: Marcus T.", body: "HVAC technician · Can start in 2 weeks" },
  },
  // tone picks the status color: "new" teal, "open" brass, "done" green.
  leads: {
    title: "This week's leads",
    rows: [
      { name: "Dana R.", detail: "Water heater install · Google Maps", status: "New", tone: "new" },
      { name: "Mike S.", detail: "AC not cooling · Google search", status: "Called", tone: "open" },
      { name: "Lisa P.", detail: "Duct cleaning quote · Referral", status: "Booked", tone: "open" },
      { name: "Tom W.", detail: "New thermostat · Facebook", status: "Won", tone: "done" },
    ],
  },
  applicants: {
    title: "Applicants",
    rows: [
      { name: "Marcus T.", detail: "HVAC technician · 2 to 5 years", status: "New", tone: "new" },
      { name: "Jess L.", detail: "Install helper · Can start now", status: "Called", tone: "open" },
      { name: "Andre K.", detail: "HVAC technician · EPA certified", status: "Interview", tone: "open" },
      { name: "Ray M.", detail: "Service tech · 10+ years", status: "Hired", tone: "done" },
    ],
  },
  automation: {
    label: "Runs on its own",
    steps: [
      { title: "Job marked done", body: "In your calendar or job app" },
      { title: "Review request texted", body: "Two hours later, with your Google link" },
      { title: "New 5-star review", body: "On your Google listing" },
    ],
  },
  care: {
    title: "Site health",
    site: "yourbusiness.com",
    status: "All good",
    rows: [
      { label: "Online", value: "100% this month" },
      { label: "Backup saved", value: "Today, 3:00 AM" },
      { label: "Updates", value: "Installed Tuesday" },
      { label: "Padlock (SSL)", value: "Renews on its own" },
    ],
    uptime: "Last 30 days",
  },
};
