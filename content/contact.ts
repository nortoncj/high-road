// Contact form + /contact page copy. Edit words here, not in the components.

export const contactMeta = {
  title: "Contact WebTech Ninjas, Websites for Home Care Agencies",
  description:
    "Send a quick message about your home care agency's website. I reply by the next business day. Se habla español.",
  path: "/contact",
};

export const contactPage = {
  eyebrow: "Contact",
  headline: "Send me a quick message",
  intro:
    "Not ready to book a call? No problem. Tell me what's going on and I'll get back to you by the next business day.",
  sideTitle: "Rather talk?",
  sideBody: "Book a free 15 minute call, or call or text me directly.",
  sideBook: "Book a free call",
  sideCallPrefix: "Call or text",
  spanish: "Se habla español.",
};

/** The block that sits under the calendar on /book. */
export const quickMessage = {
  eyebrow: "Not ready to book?",
  headline: "Send me a quick message instead",
  intro: "Ask anything. Pricing, Spanish sites, how long it takes. I reply by the next business day.",
};

export const contactForm = {
  name: { label: "Your name", placeholder: "Maria Lopez" },
  method: {
    legend: "How should I reach you?",
    email: "Email",
    phone: "Phone or text",
  },
  email: { label: "Email", placeholder: "you@youragency.com" },
  phone: { label: "Phone", placeholder: "(941) 555-0123" },
  website: {
    label: "Agency website",
    optional: "optional",
    placeholder: "youragency.com",
    hint: "No site yet? Leave it blank.",
  },
  message: {
    label: "What's going on?",
    placeholder: "We're not getting caregiver applicants from our site...",
  },
  submit: "Send message",
  sending: "Sending...",
  privacy: "By sending this, you agree to the [Privacy policy](/privacy).",
  errors: {
    name: "Please add your name.",
    email: "That email doesn't look right.",
    phone: "Please add a phone number I can call or text.",
    message: "Tell me a little about what's going on.",
    business: "Please add your business name.",
    tooLong: "That's a bit long. Can you trim it down?",
    rateLimited: "Looks like you've sent a few already. Give it a few minutes, or call or text me.",
    server: "Something went wrong on my end. Please call or text me instead and I'll sort it out.",
  },
};
