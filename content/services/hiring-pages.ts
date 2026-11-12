// Copy for /services/hiring-pages. Edit words here, not in components.

import { pillarHiring } from "@img/home";
import { serviceHiring } from "@img/services";
import { price } from "./prices";
import type { Service } from "./types";

export const hiringPages: Service = {
  slug: "hiring-pages",
  label: "Hiring pages",
  icon: "users",
  title: "Hire from your own website",
  summary: "A careers page that sells the job and a short application people finish on their phone, so good help finds you first.",
  highlights: ["Pay and hours up front", "An application built for phones", "A text when someone applies"],
  price: "Add to any package",
  image: {
    src: serviceHiring,
    alt: "Business owner shaking hands with a new technician outside his shop",
  },
  meta: {
    title: "Careers pages and job applications for service businesses",
    description:
      "A careers page and a short, phone-friendly job application on your own website, with an alert every time someone applies. Hire without living on job boards.",
  },
  hero: {
    eyebrow: "Careers pages and job applications",
    intro:
      "Good techs job hunt on their phones, on a lunch break. I build a careers page that sells the job and an application they can finish in a few minutes, then text you the moment they apply.",
    badge: "Apply from a phone in minutes",
    reassurances: ["Free 15 minute call", "Built into your website", "Every applicant in one list"],
  },
  pains: {
    heading: "You can't grow if you can't hire.",
    items: [
      "I could take on more work tomorrow if I had the crew.",
      "I post on Indeed, get a pile of applications, a few show up, and one actually starts.",
      "Good people apply from their phones. My application only works on a computer.",
    ],
  },
  features: {
    heading: "What I build for hiring",
    items: [
      {
        title: "A careers page that sells the job",
        body: "Good people are choosing between you and three other shops. Pay, hours and real photos of your crew up front get the right people to apply, and help the wrong ones skip it.",
        points: ["Pay, hours and benefits up front", "A page for each role you hire", "Real photos of your crew and trucks"],
        visual: { photo: { src: pillarHiring, alt: "Service crew standing in front of their trucks" } },
      },
      {
        title: "An application they'll finish on a phone",
        body: "A short, step-by-step application asks what you need to know up front: licenses, experience and when they can start. No laptop needed, no hour-long form.",
        points: [
          "Short steps that work on any phone",
          "The questions you care about, asked up front",
          "Résumé optional, because good hands don't always have one",
        ],
        visual: { mockup: "application" },
      },
      {
        title: "Every applicant in one place",
        body: "No more applications buried in your inbox. You get a text when someone applies, they get a reply right away, and everyone lands in one list you can call through.",
        points: ["A text and email for every new applicant", "An auto reply so they know you got it", "One list, so nobody slips through"],
        visual: { mockup: "applicants" },
      },
    ],
  },
  tools: {
    items: [
      {
        icon: "briefcase",
        name: "Careers page",
        what: "Pay, hours and what the job is really like, on your own site instead of buried in a job board.",
      },
      {
        icon: "mobile",
        name: "Phone-friendly application",
        what: "Short steps and big buttons. Done in a few minutes from a phone.",
      },
      {
        // TODO: confirm you add job posting markup to careers pages, or drop this one.
        icon: "google",
        name: "Google job search",
        what: "Job posts labeled so Google can show them when people search for work near you.",
      },
      {
        icon: "bell",
        name: "Applicant alerts",
        what: "A text and email the moment someone applies, plus an automatic reply so they know you got it.",
      },
      {
        icon: "list",
        name: "Applicant list",
        what: "Every application in one list, a simple dashboard or a Google Sheet, so nobody gets lost in your inbox.",
      },
      {
        icon: "database",
        name: "MySQL",
        what: "A secure database that stores every application, so none of them live only in an email.",
      },
    ],
  },
  pricing: {
    heading: "Built into your website",
    body: "A careers page is one of the pages in any package. Each extra role page is an add-on, and the application with alerts is priced on your free call, based on how many roles you hire for.",
    lines: [
      { label: "Careers page", price: "Included", note: "Counts as one of the pages in any package" },
      { label: "Extra role page", price: price.extraPage, note: "One page for each job you hire for" },
      // TODO: set a list price for the application with alerts, then show it here.
      { label: "Application with alerts", price: "Quoted on a call", note: "Depends on how many roles and questions you need" },
    ],
  },
  faqs: [
    {
      q: "Will this replace Indeed?",
      a: "It doesn't have to. Keep posting where it works, and link those posts to your own careers page. Applicants see the real job, apply in a few minutes, and land in your list instead of a job board's inbox.",
    },
    {
      q: "What questions can the application ask?",
      a: "Whatever matters for your work: licenses, years of experience, whether they have their own tools, when they can start. We'll keep it short, because every extra question costs you applicants.",
    },
    {
      q: "Can I update job posts myself?",
      a: "Yes. You can edit them yourself, or if you're on a care plan, text me the change and I'll make it.",
    },
  ],
};
