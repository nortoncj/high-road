// Copy for /services/website-design. Edit words here, not in components.
// The overview card on /services reads label, title, summary, highlights, price and image.

import { serviceWebsites } from "@img/services";
import { price } from "./prices";
import type { Service } from "./types";

export const websiteDesign: Service = {
  slug: "website-design",
  label: "Websites",
  icon: "website",
  title: "A website that makes your phone ring",
  summary: "A fast, good-looking site built for phones and written to get calls, not just compliments.",
  highlights: ["Built for phones first", "Click-to-call on every page", "You approve every word"],
  price: `From ${price.launch}`,
  image: {
    src: serviceWebsites,
    alt: "Landscaping business owner smiling at a tablet on the tailgate of his truck",
  },
  meta: {
    title: "Website design for local businesses",
    description: `Fast, phone-first websites for local businesses that live on calls, bookings and form leads. Click-to-call on every page, copy written for you, fixed prices from ${price.launch}.`,
  },
  hero: {
    eyebrow: "Website design for local businesses",
    intro:
      "If you make money when someone calls, books or fills out a form, I build the site that gets them to do it, then texts you the second they do.",
    badge: `Fixed price from ${price.launch}`,
    reassurances: ["Free 15 minute call", "Fixed prices, no surprise invoices", "No tech talk"],
  },
  pains: {
    heading: "Most small business websites lose customers in the same three places.",
    items: [
      "My website looks like I built it in 2014, because I did. People assume I'm the cheap option.",
      "Someone filled out my contact form on Friday. I saw it Tuesday. They'd already hired the other guy.",
      "I'm paying for a website and I have no idea if anyone has ever called because of it.",
    ],
  },
  features: {
    heading: "What I build in",
    items: [
      {
        title: "Look like the business you actually are",
        body: "Most people look you up before they call. A clean, modern site tells them you're the real deal, not the cheap option.",
        points: [
          "A modern design built for phones first",
          // TODO: only promise a load time if you check every launch in PageSpeed Insights.
          "Fast pages that don't make people wait",
          "Plain English copy: what you do, where, and why you",
          "Real reviews and real photos up front",
        ],
        visual: { mockup: "makeover" },
      },
      {
        title: "One tap to call, from any page",
        body: "Most of your customers find you on a phone. Every page keeps your number under their thumb, and forms are short enough to finish standing in a driveway.",
        points: [
          "Click-to-call and click-to-text on every page",
          "Short forms people actually finish",
          "Big buttons and easy-to-read text",
          "A page for each service and town you cover",
        ],
        visual: { mockup: "phone" },
      },
      {
        title: "Every lead lands on your phone",
        body: "With Grow and Run, a new lead texts you the second it comes in, and the customer gets an instant reply so they stop calling around.",
        points: [
          "A text and email the moment a lead comes in",
          "An auto reply that says when you'll call",
          "Every lead saved, even if an email fails",
        ],
        visual: { mockup: "alerts" },
        link: { label: "More on lead alerts", href: "/services/lead-alerts-and-booking" },
      },
    ],
  },
  work: true,
  tools: {
    items: [
      {
        icon: "wordpress",
        name: "WordPress",
        what: "For sites you want to edit yourself. It's the most popular website builder there is, so you're never stuck waiting on me to fix a typo.",
      },
      {
        icon: "code",
        name: "Custom code",
        what: "For everything else. Pages are built ahead of time, so they open fast, even on a weak phone signal.",
      },
      {
        icon: "speed",
        name: "Google PageSpeed",
        what: "Google's own test for speed and ease of use. I run it on every site before launch and aim for 90 or better.",
      },
      {
        icon: "lock",
        name: "SSL padlock",
        what: "The lock next to your web address. Without it, browsers warn customers that your site isn't safe.",
      },
      {
        icon: "google",
        name: "Google Search Console",
        what: "Tells Google your site exists, and shows which searches are bringing people to it.",
      },
      {
        icon: "chart",
        name: "Call and form tracking",
        what: "Every call and form is counted from day one, so you're never guessing whether the site works.",
      },
    ],
  },
  pricing: {
    heading: "Three fixed prices",
    body: "You know the price before I start, you see every page before it goes live, and you own the site when we're done.",
    lines: [
      { label: "Launch", price: price.launch, note: "Up to 5 pages, click-to-call and a contact form that lands in your inbox" },
      { label: "Grow", price: price.grow, note: "Up to 10 pages, copy written for you, booking with text alerts, Google set up" },
      { label: "Run", price: price.run, note: "Up to 15 pages, a lead dashboard and 2 custom automations" },
    ],
    note: "Or pay monthly over 12 months, with no money down.",
  },
  faqs: [
    {
      q: "How long does a website take?",
      a: "About 2 weeks for Launch, 3 to 4 weeks for Grow and 5 to 6 weeks for Run, as long as photos and approvals come back on time.",
    },
    {
      q: "Who writes the words?",
      a: "On Grow and Run, I write your copy. On Launch, you send the words and I tighten them. Either way, you approve every word before it goes live.",
    },
    {
      q: "Can I update the site myself?",
      a: "Yes, if you want to. I'll build it so you can change text, photos and prices yourself. If you'd rather not, a care plan covers small edits and you just text me.",
    },
    {
      q: "Do I own my website?",
      a: "Yes. Your domain, your content and your photos are yours. If you ever leave, I'll hand over your files or move the site wherever you want.",
    },
  ],
};
