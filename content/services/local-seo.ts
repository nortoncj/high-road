// Copy for /services/local-seo. Edit words here, not in components.

import { ctaBg } from "@img/home";
import { serviceLocalSeo } from "@img/services";
import { price } from "./prices";
import type { Service } from "./types";

export const localSeo: Service = {
  slug: "local-seo",
  label: "Google & Maps",
  icon: "map",
  title: "Show up when neighbors search",
  summary: "Get on the map, look trusted, and win the next town over, without paying for shared leads.",
  highlights: ["Google Business Profile set up right", "A page for every service and town", "More reviews, less awkward asking"],
  price: "Included in Grow and Run",
  image: {
    src: serviceLocalSeo,
    alt: "Homeowner with a leaky sink searching a map on her phone for a plumber",
  },
  meta: {
    title: "Local SEO and Google Business Profile setup",
    description:
      "Show up on Google Maps and local search when people nearby need what you do. Google Business Profile setup, service and town pages, and an easy way to get more reviews. No ranking promises.",
  },
  hero: {
    eyebrow: "Google Maps and local search",
    intro:
      "When a pipe bursts, nobody scrolls to page two. I get your business on the map looking open, active and trusted, so the call comes to you instead of a lead site.",
    badge: "Included in Grow and Run",
    reassurances: ["Free 15 minute call", "Fixed prices, no surprise invoices", "No ranking promises I can't keep"],
  },
  pains: {
    heading: "Great work doesn't help if nobody can find you.",
    items: [
      "Search for what I do in my own town and I'm not on the map. Three companies I've never heard of are.",
      "I pay for leads from those sites, and the same lead gets sold to four other companies.",
      "Twenty years of happy customers, and nine reviews on Google.",
    ],
  },
  features: {
    heading: "How I get you found",
    items: [
      {
        title: "Show up on the map",
        body: "When someone nearby searches for what you do, the map comes first. I set up your Google Business Profile and fill in every detail, so you show up looking open, busy and trusted.",
        points: [
          "Profile claimed, verified and filled out completely",
          "Services, hours, service area and real photos",
          "Your name, address and phone the same everywhere",
        ],
        visual: { mockup: "maps" },
      },
      {
        title: "Win the next town over",
        body: "Google shows the page that best matches the search. A page for each service and each town you cover gives you more ways to show up close to home.",
        points: [
          "A page for every service you sell",
          "A page for every town you want work in",
          "Written for people first, so they actually call",
        ],
        visual: { photo: { src: ctaBg, alt: "Technician walking up a customer's driveway past his van" } },
      },
      {
        title: "More reviews, without the awkward ask",
        body: "Reviews decide who gets the call. You get a short review link to text happy customers right after the job, so leaving one takes about ten seconds.",
        points: [
          "A review link that opens straight to the stars",
          "A short text you can send right after the job",
          "A plan for asking past customers, too",
        ],
        visual: { mockup: "reviews" },
      },
    ],
    note: "Nobody honest can promise you a #1 ranking. I promise a profile and site built the way Google and your customers expect, and the numbers to show what's working.",
  },
  tools: {
    items: [
      {
        icon: "maps",
        name: "Google Business Profile",
        what: "Your free listing on Google Maps and search. For a lot of local businesses, it's the first thing customers see, before the website.",
      },
      {
        icon: "google",
        name: "Google Search Console",
        what: "Shows which searches you show up for, and tells Google the moment you add a new page.",
      },
      {
        icon: "code",
        name: "Business details for Google",
        what: "Hidden labels on your site that spell out your hours, service area and phone number, so Google doesn't have to guess. Techies call it schema.",
      },
      {
        icon: "pin",
        name: "Name, address and phone",
        what: "Kept exactly the same on your website and your Google profile, so Google trusts they're right.",
      },
      {
        icon: "pages",
        name: "Service and town pages",
        what: "Real pages written for each service and each town, not the same page copied twenty times with the city swapped.",
      },
      {
        icon: "star",
        name: "Review link",
        what: "A short link that opens Google's review box for your business, ready to text after every job.",
      },
    ],
  },
  pricing: {
    heading: "Included in Grow and Run",
    body: "Google Business Profile setup and local search for your service areas come with the Grow and Run packages. On Launch, you can add the profile setup on its own.",
    lines: [
      { label: "Grow", price: price.grow, note: "Website, Google Business Profile setup and local search for your service areas" },
      { label: "Google Business Profile setup", price: price.googleProfile, note: "Add-on for Launch" },
      { label: "Extra service or town page", price: price.extraPage, note: "Add to any package" },
    ],
  },
  faqs: [
    {
      q: "How long until I show up on Google?",
      a: "It depends on your town and your competition. A verified profile can start showing up quickly, and new pages usually take a few months to settle in. I'll show you the numbers as they move, and I won't promise a ranking.",
    },
    {
      q: "Do I need a website to show up on Google Maps?",
      a: "Not to show up, but it helps a lot. Your profile links to your site, and Google uses your site to understand what you do and where. The two work best together.",
    },
    {
      q: "Can you guarantee a #1 ranking?",
      a: "No, and nobody honest can. What I can promise is a profile and site built the way Google and your customers expect, plus the numbers to show what's working.",
    },
    {
      q: "What about the lead sites I'm paying for now?",
      a: "Keep them while they pay off. The point is a way for customers to reach you directly, so over time you depend less on leads that get sold to four other companies.",
    },
  ],
};
