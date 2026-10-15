// Every word and image on /demo lives here.
// [Brackets] are yours to fill. Every number needs its source and date range.
// Images are Pexels stock placeholders; each alt says what the REAL screenshot should be.
// Swap in real screenshots and rewrite the alt to describe them before launch.

import { pexels } from "./pexels";

export type Img = { src: string; alt: string };

export type CaseStudy = {
  id: string;
  name: string;
  badges: string[];
  oneLine: string;
  needed: string;
  built: string[];
  /** Each result needs its source and date range in the text. Leave empty to hide the block. */
  results: string[];
  quote?: { text: string; by: string };
  /** null hides the "Visit the site" link (e.g. while a site is offline). */
  href: string | null;
  image: Img;
  featured?: boolean;
};

export type SmallProject = {
  name: string;
  oneLine: string;
  badge: string;
  image: Img;
  href?: string;
};

export type Sample = {
  name: string;
  packageName: string;
  oneLine: string;
  lookAt: string[];
  siteHref: string;
  packageHref: string;
  image: Img;
};

export const demoMeta = {
  title: "Home Care Website Examples and Demo, WebTech Ninjas",
  description:
    "Try a real caregiver application on your phone, then see websites I've built for senior care and local service businesses in Florida.",
  path: "/demo",
};

export const demoHero = {
  eyebrow: "Demo and work",
  headline: "See it working before you spend a dollar",
  intro:
    "Start with the site you're on. It runs the same caregiver application and alerts I build for clients, so you can try it on your phone right now. Below that are sample agency sites and real projects for local businesses, including senior care.",
  primaryCta: "Try the application",
  secondaryCta: "See client work",
  jumps: [
    { label: "This site", href: "#this-site" },
    { label: "Sample projects", href: "#samples" },
    { label: "Client work", href: "#work" },
  ],
};

export const featuredSite = {
  eyebrow: "Project 01",
  heading: "WebTech Ninjas: the site you're on",
  badges: ["Built by me", "Live", "English and Español"],
  intro:
    "I built this site the same way I'd build yours, so it doubles as a working sample. Everything a home care agency needs is running here, not just described.",
  features: [
    {
      icon: "apply",
      title: "A caregiver application you can try.",
      body: "Three steps, about three minutes, on any phone, in English or Spanish.",
    },
    {
      icon: "bell",
      title: "Alerts the moment someone applies.",
      body: "On a client site, that's a text and an email to the owner, plus an auto reply to the applicant.",
    },
    {
      icon: "phone",
      title: "Phone-first everything.",
      body: "Big buttons, a sticky call bar on mobile, and text sized for older eyes.",
    },
    {
      icon: "eye",
      title: "Made for every reader.",
      body: "Fonts chosen for low-vision readers, strong contrast, and pages that work with a keyboard or screen reader.",
    },
    {
      icon: "edit",
      title: "Easy to update.",
      body: "Pages and posts are edited in a simple content editor, so changes don't need a developer.",
    },
    {
      icon: "chart",
      title: "Tracking built in.",
      body: "Calls, form fills, and applications are counted, so results are numbers, not guesses.",
    },
  ] as const,
  builtWith: "Built with Next.js, Sanity, and a custom design system",
};

export const applySection = {
  eyebrow: "Live demo",
  heading: "Apply to a pretend agency",
  body: "This is the same application your caregivers would use. Fill it out on your phone. Nothing is sent to a real agency.",
  demoLabel: "Demo only. Not a real job posting.",
  doneNote:
    "That's what your applicants see. On your site, you'd get a text and an email right now.",
  doneCta: "Want this on your site? Book a free call.",
};

/** Application copy in both languages. The demo never sends or stores anything. */
export const applyCopy = {
  en: {
    step: (n: number, total: number) => `Step ${n} of ${total}`,
    q1: "Which role are you applying for?",
    roles: [
      "Companion caregiver",
      "Home health aide (HHA)",
      "Certified nursing assistant (CNA)",
    ],
    q2: "When can you work?",
    q2Hint: "Pick all that apply.",
    times: ["Weekday days", "Evenings", "Overnights", "Weekends"],
    q3: "How do we reach you?",
    name: "Your name",
    phone: "Your phone number",
    phoneHint: "We'll text you. We never share it.",
    next: "Next",
    back: "Back",
    send: "Send application",
    needRole: "Pick a role to continue.",
    needTime: "Pick at least one time to continue.",
    needName: "Add your name.",
    needPhone: "Add a 10 digit phone number.",
    doneTitle: "Application sent",
    doneBody: "Thanks. Expect a text from our office within one business day.",
    again: "Start over",
  },
  es: {
    step: (n: number, total: number) => `Paso ${n} de ${total}`,
    q1: "¿Para qué puesto aplica?",
    roles: [
      "Cuidador(a) de compañía",
      "Asistente de salud en el hogar (HHA)",
      "Asistente de enfermería certificado (CNA)",
    ],
    q2: "¿Cuándo puede trabajar?",
    q2Hint: "Elija todas las que apliquen.",
    times: ["Días entre semana", "Tardes", "Noches", "Fines de semana"],
    q3: "¿Cómo le contactamos?",
    name: "Su nombre",
    phone: "Su número de teléfono",
    phoneHint: "Le enviaremos un texto. No lo compartimos.",
    next: "Siguiente",
    back: "Atrás",
    send: "Enviar solicitud",
    needRole: "Elija un puesto para continuar.",
    needTime: "Elija al menos un horario para continuar.",
    needName: "Escriba su nombre.",
    needPhone: "Escriba un teléfono de 10 dígitos.",
    doneTitle: "Solicitud enviada",
    doneBody: "Gracias. Le enviaremos un texto en un día hábil.",
    again: "Empezar de nuevo",
  },
};

export type ApplyLang = keyof typeof applyCopy;

export const samples = {
  eyebrow: "Sample projects",
  heading: "What your agency's site could look like",
  intro:
    "These are full sample sites for made-up agencies, built to show exactly what each package includes. Every one is clearly labeled as a sample.",
  label: "Sample project. Not a real agency.",
  // Add a Sample object here when the first one is live; until then the placeholder card shows.
  items: [] as Sample[],
  placeholder: {
    heading: "First sample site in progress",
    body: "A full sample home care site is being built now. Until it's ready, the application above is the best preview of how your careers page will work.",
    cta: "Book a free call",
  },
};

export const caseStudies = {
  eyebrow: "Client work",
  heading: "Real sites for real local businesses",
  intro:
    "Every project below was found, built, and written by me. Numbers come from Google Search Console and Google Business Profile, with the dates they cover.",
  items: [
    {
      id: "casa-de-la-paz",
      name: "Casa de la Paz",
      featured: true,
      badges: ["Senior care", "Assisted living and senior housing"],
      oneLine:
        "A website for an assisted living and senior housing provider, built for the families who read every page before they call.",
      needed:
        "[One or two sentences: what their site was missing or what they asked you for.]",
      built: [
        "[Pages you built, e.g. home, services, about, contact]",
        "[Any trust pieces: photos, licensing, tour request form]",
        "[Anything mobile or bilingual]",
      ],
      results: [], // TODO: only numbers you can show, with source and dates
      quote: {
        text: "[A real quote from Casa de la Paz, with written permission.]",
        by: "[Name], [Title]",
      },
      href: "#", // TODO
      image: {
        // Pexels 18429308
        src: pexels(18429308, 1400),
        alt: "Screenshot suggestion: the Casa de la Paz homepage on a desktop, in a clean browser frame",
      },
    },
    {
      id: "butcher-block-group",
      name: "Butcher Block Group",
      badges: ["Woodworking", "Custom WordPress theme"],
      oneLine:
        "A gallery-first website for a custom woodworker, so customers see the quality of the work in seconds.",
      needed:
        "A site that shows finished pieces fast, with very little reading, and that the owner can update himself without calling a developer.",
      built: [
        "A custom WordPress theme, no page builder, so the site stays fast",
        "A filterable gallery: customers sort by product (tables, countertops, cutting boards, and more) and by wood species",
        "Full-size photo viewing with a lightbox",
        "A reviews page with spots for Google and Facebook reviews",
        "A simple admin so the owner adds new projects to the gallery himself",
      ],
      results: [
        "800+ Google Search impressions ([date range], Google Search Console)",
        "Google Business Profile shows 20+ reviews, averaging close to 5 stars",
      ],
      quote: {
        text: "[A real quote from the owner, with permission.]",
        by: "[Name], Owner",
      },
      href: null, // site is offline for a couple of months; set the URL when it's back
      image: {
        // Pexels 5710840
        src: pexels(5710840, 1200),
        alt: "Screenshot suggestion: the Butcher Block Group gallery page, filtered by product and wood species",
      },
    },
    {
      id: "john-r-clark",
      name: "John R Clark & Co",
      badges: ["Contractor", "30+ years in business"],
      oneLine:
        "A website and Google presence for a contractor who does wallpaper, painting, tile, flooring, carpentry, and yacht interiors.",
      needed:
        "A professional home online that matches his straight-talking style, shows real projects, and turns visitors into estimate requests.",
      built: [
        "A custom WordPress site: home page, services hub, project gallery, about page, blog, and an estimate request form",
        "A project gallery with a lightbox that also works by keyboard",
        "A contact form that actually delivers: his host was blocking the site's emails, so I fixed it with a verified mail service",
        "A Google Business Profile, set up and filled out, with review requests sent to past customers",
        "A regular Facebook posting schedule",
      ],
      results: [], // TODO: add his best current numbers with dates
      quote: {
        text: "[A real quote from John, with permission.]",
        by: "John Clark, Owner",
      },
      href: "https://johnclarkco.com",
      image: {
        // Pexels 5691471
        src: pexels(5691471, 1200),
        alt: "Screenshot suggestion: the John R Clark & Co homepage on a desktop, showing a finished wallpaper project",
      },
    },
    {
      id: "vfw-6827",
      name: "VFW Post 6827",
      badges: ["Veterans post", "Website and hosting"],
      oneLine:
        "A website for a local veterans post. [Finish the line: what the site helps members or the community do.]",
      needed: "[One or two sentences.]",
      built: ["[Page or feature]", "[Page or feature]"],
      results: [
        "1,400+ Google Search impressions ([date range], Google Search Console)",
        "Google Business Profile rating close to 5 stars",
      ],
      quote: {
        text: "[A real quote from a post officer, with permission.]",
        by: "[Name], [Title]",
      },
      href: "#", // TODO
      image: {
        // Pexels 935499
        src: pexels(935499, 1200),
        alt: "Screenshot suggestion: the VFW Post 6827 homepage on a desktop",
      },
    },
  ] satisfies CaseStudy[],
};

export const moreWork = {
  heading: "More projects",
  items: [
    {
      name: "Lachelle Travels",
      oneLine:
        "A WordPress site and a search growth plan for a travel agency, which grew its Facebook page from zero to over 100 followers.",
      badge: "Travel",
      image: {
        // Pexels 12858513
        src: pexels(12858513, 900),
        alt: "Screenshot suggestion: the Lachelle Travels homepage on a desktop",
      },
    },
    {
      name: "OptimalDTG",
      oneLine:
        "[Confirm scope] A landing page for a veteran-owned federal contractor.",
      badge: "Government services",
      image: {
        // Pexels 17507798
        src: pexels(17507798, 900),
        alt: "Screenshot suggestion: the OptimalDTG landing page on a desktop",
      },
    },
    {
      name: "High Tyde Sushi",
      oneLine:
        "A homepage rebuild and online ordering plan for a coastal sushi pop-up.",
      badge: "In progress",
      image: {
        // Pexels 248444
        src: pexels(248444, 900),
        alt: "Screenshot suggestion: the High Tyde Sushi homepage hero on a phone",
      },
    },
  ] satisfies SmallProject[],
  footnote:
    "Want to see something specific? Ask on the call and I'll walk you through it.",
};

export const demoCta = {
  heading: "Want this working for your agency?",
  body: "You've seen the application and the work. On a free 15 minute call, I'll show you what your version would look like and what it would take to get there.",
  primaryCta: "Book a free call",
  secondaryCta: "See packages and pricing",
  secondaryHref: "/pricing",
  fine: "Packages start at $1,300. Se habla español.",
};
