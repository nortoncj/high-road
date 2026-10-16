// Thank-you pages. One after a booking, one after the contact form.
// Edit words here, not in the components.

export type ThanksVariant = "booked" | "message";

export const thanksMeta: Record<ThanksVariant, { title: string; description: string; path: string }> = {
  booked: {
    title: "You're Booked, WebTech Ninjas",
    description: "Your free 15 minute call is booked. Here's what to have ready.",
    path: "/thanks/booked",
  },
  message: {
    title: "Message Received, WebTech Ninjas",
    description: "Thanks for reaching out. Here's what happens next.",
    path: "/thanks/message",
  },
};

/** The one link on both pages. Casa de la Paz is the closest match to a home care owner. */
export const thanksLink = {
  lead: "While you wait, here's a site I built for a senior living business:",
  label: "See the Casa de la Paz project",
  href: "/demo#casa-de-la-paz", // TODO: swap for [YOUR BEST CASE STUDY OR PAGE] if a better one comes along
};

type ReadyItem = { strong: string; rest: string };

type ThanksCopy = {
  headline: string;
  intro: string;
  /** Booking page only. The phone number from content/home.ts is added after it as a link. */
  help?: string;
  readyLead: string;
  ready: ReadyItem[];
  signoff: string;
};

const biggestProblem: ReadyItem = {
  strong: "Your biggest problem right now,",
  rest: "like not enough caregiver applicants or families not calling",
};

export const thanks: Record<ThanksVariant, ThanksCopy> = {
  booked: {
    headline: "You're booked. Talk soon.",
    intro: "Thanks for grabbing a time. A confirmation email with your call details is on its way.",
    help: "Didn't get it? Check spam, or call or text me at",
    readyLead: "Before the call, have two things ready:",
    ready: [
      { strong: "Your website address,", rest: "so I can pull it up while we talk" },
      biggestProblem,
    ],
    signoff: "That's it. No slides, no tech talk, just a real conversation with me, Chris. Se habla español.",
  },
  message: {
    headline: "Got it. I'll be in touch soon.",
    // This is a promise. If you can't keep it on side-hustle hours, change it to "within two business days".
    intro:
      "Thanks for reaching out. I read every message myself, and I'll get back to you by the next business day, by phone or email, whichever you picked.",
    readyLead: "To make our first conversation quick and useful, have two things ready:",
    ready: [
      { strong: "Your website address,", rest: "or just tell me if you don't have one yet" },
      biggestProblem,
    ],
    signoff: "No sales script, no tech talk. Se habla español.",
  },
};
