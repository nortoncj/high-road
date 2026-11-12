// Shapes for the service pages. Each service is one file in this folder; content/services.ts lists
// them in order and holds the copy for /services itself.

import type { StaticImageData } from "next/image";

export type Photo = { src: StaticImageData; alt: string };

export type ServiceIcon = "website" | "map" | "bell" | "users" | "chart" | "shield";

/** Pictures drawn in code (components/services/Mockups.tsx). Decorative: the copy beside each one says the same thing. */
export type MockupName =
  | "makeover"
  | "phone"
  | "alerts"
  | "timeline"
  | "booking"
  | "maps"
  | "reviews"
  | "application"
  | "leads"
  | "applicants"
  | "automation"
  | "care"
  | "report";

/** Beside each feature: a photo, or one of the mockups. */
export type Visual = { photo: Photo } | { mockup: MockupName };

export type Feature = {
  title: string;
  body: string;
  points: string[];
  visual: Visual;
  link?: { label: string; href: string };
};

export type ToolIcon =
  | "wordpress"
  | "nextjs"
  | "speed"
  | "lock"
  | "google"
  | "maps"
  | "chart"
  | "code"
  | "pin"
  | "pages"
  | "star"
  | "phone"
  | "database"
  | "mail"
  | "message"
  | "calendar"
  | "reply"
  | "briefcase"
  | "mobile"
  | "bell"
  | "list"
  | "report"
  | "automation"
  | "plug"
  | "analytics"
  | "cloud"
  | "backup"
  | "shield";

/** One tool or technology, explained in a sentence a business owner would use. */
export type Tool = { icon: ToolIcon; name: string; what: string };

export type PriceLine = { label: string; price: string; note?: string };

export type Faq = { q: string; a: string };

export type Service = {
  /** The page lives at /services/<slug>. */
  slug: string;
  /** Short name for tags, breadcrumbs and links, e.g. "Websites". */
  label: string;
  icon: ServiceIcon;
  /** What the owner gets, in their words. The card title and the page headline. */
  title: string;
  /** One or two sentences on the card. */
  summary: string;
  /** Three short points on the card. */
  highlights: string[];
  /** Short price line on the card, e.g. "From $600". */
  price: string;
  image: Photo;
  meta: { title: string; description: string };
  hero: {
    eyebrow: string;
    intro: string;
    /** Chip on the hero photo. Keep it short and true. */
    badge: string;
    reassurances: string[];
  };
  /** "Sound familiar?" Composite lines from owners, not testimonials: never put a name on one. */
  pains: { heading: string; items: string[] };
  features: { heading: string; items: Feature[]; note?: string };
  tools: { items: Tool[] };
  pricing: { heading: string; body: string; lines: PriceLine[]; note?: string };
  faqs: Faq[];
  /** Show the strip of real client sites under the hero. */
  work?: boolean;
  /** The closing band. Blank uses the default in content/services.ts. */
  cta?: { heading: string; body: string };
};
