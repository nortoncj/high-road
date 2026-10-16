import { site } from "@/content/home";
import type { LegalSection } from "@/content/legal";

/*
  Privacy policy content. Edit words here, not in the components.

  Inline formatting in any text string:
    **bold**   [link text](https://url or /path)   `code`
  Anything else in [square brackets] is a blank to fill. In dev it shows highlighted so you can't miss it.
  `review` notes (lawyer checks and confirms) only show in dev. They never appear on the live site.
*/

// ---------------------------------------------------------------------------
// Switches. Change these and the policy text follows.
// ---------------------------------------------------------------------------

/** Set to false if the Meta Pixel isn't on the site. Every Meta line drops out. */
export const USES_META_PIXEL = true;

const schedulers = {
  calendly: { name: "Calendly", privacyUrl: "https://calendly.com/privacy" },
  calcom: { name: "Cal.com", privacyUrl: "https://cal.com/privacy" },
};
/** Pick the one you actually embed on /book. */
const scheduler = schedulers.calendly;

const business = {
  // "Chris Norton Jr., doing business as WebTech Ninjas" or "WebTech Ninjas LLC". Use the exact legal name.
  legalName: "Webtech Systems LLC, doing business as WebTech Ninjas",
  city: "Orlando",
  mailingAddress:
    "WebTech Ninjas, [Mailing address or PO box], [City], FL [ZIP]",
  emailProvider: "[Your email provider]",
  /** Only promise a deadline you'll keep. */
  responseDays: 30,
  clientRecordYears: "2",
};

export const privacyMeta = {
  title: "Privacy Policy, WebTech Ninjas",
  description:
    "What webtechninjas.com collects, why, who it's shared with, and how to have your information deleted. Plain English, no fine print games.",
  path: "/privacy",
  effectiveDate: "October 1, 2023",
};

const LAWYER = "Check with a lawyer:";
const ifMeta = <T>(item: T): T[] => (USES_META_PIXEL ? [item] : []);
const trackers = USES_META_PIXEL
  ? "Google Analytics and the Meta Pixel"
  : "Google Analytics";

// ---------------------------------------------------------------------------
// Page copy
// ---------------------------------------------------------------------------

export const privacy = {
  eyebrow: "Legal",
  headline: "Privacy policy",
  intro: [
    'WebTech Ninjas ("I," "me") builds websites for home care agencies. This policy explains what webtechninjas.com collects, why, who else touches it, and how you can have it deleted. I\'m one person, not a big company, so I\'ve kept it short and plain.',
    `WebTech Ninjas is run by Chris Norton Jr. in ${business.city}, Florida, USA. Legal name: ${business.legalName}.`,
  ],
  shortVersionTitle: "The short version",
  shortVersion: [
    "I collect what you type into my contact form or scheduler, plus basic data about how people use the site.",
    "I use it to reply to you, run our call, and see which pages work.",
    "I don't sell your information for money.",
    `I use ${trackers}, which use cookies. You can block them.`,
    "Email me and I'll delete your information.",
  ],
  tocLabel: "On this page",

  sections: [
    {
      id: "what-i-collect",
      title: "What I collect",
      review: [
        "Contact form row matches the form in components/contact (name, email or phone, website, message).",
      ],
      blocks: [
        {
          type: "p",
          text: "I collect two kinds of information: what you choose to give me, and basic data about how you use the site.",
        },
        {
          type: "table",
          caption: "Information collected, by source",
          columns: ["Where it comes from", "What I get"],
          rows: [
            [
              "Contact form",
              "Your name, your email or phone number (you pick which), your agency's website if you share it, and your message.",
            ],
            [
              `Booking a call (${scheduler.name})`,
              "Your name, email, phone number, the time you picked, your time zone and your answers to the booking questions.",
            ],
            [
              "Google Analytics 4",
              "Pages you visit, how you found the site, your device and browser type, rough location (city level), and actions like booking a call or sending the form.",
            ],
            ...ifMeta([
              "Meta Pixel",
              "Pages you visit, actions like booking a call, and browser details. If you're logged into Facebook or Instagram, Meta may connect this to your account.",
            ]),
            [
              "My web host's server logs",
              "Your IP address, browser type, the page you asked for and the time. Every website host keeps these.",
            ],
            [
              "Calls, texts and emails",
              "Whatever you tell me or send me directly, plus any notes I take during our call.",
            ],
          ],
        },
        {
          type: "callout",
          text: "**Please don't send me health information about your clients or patients** through the form, scheduler or email. I don't need it to talk about your website.",
        },
      ],
    },
    {
      id: "why",
      title: "Why I use it",
      blocks: [
        {
          type: "list",
          lead: "I use your information to:",
          items: [
            "Reply to your message and set up our call",
            "Prepare for the call by looking at your current website",
            "Send you a proposal or follow up if you asked for one",
            "See which pages people read and which ones they leave, so I can improve the site",
            ...ifMeta(
              "Measure whether my ads bring in real inquiries, and show my ads to people who already visited the site",
            ),
            "Keep the site secure and working",
          ],
        },
        {
          type: "p",
          text: "I won't add you to a newsletter or marketing email list unless you ask to join one.",
        },
      ],
    },
    {
      id: "sharing",
      title: "Who I share it with",
      // review: [
      //   ...ifMeta(
      //     `${LAWYER} whether letting the Meta Pixel collect data counts as "sharing" or a "sale" under any state law that covers you.`,
      //   ),
      //   "Confirm: Supabase and Brevo rows match your setup.",
      // ],
      blocks: [
        {
          type: "p",
          text: "I share your information only with the services that run this site and my business. Each one has its own privacy policy.",
        },
        {
          type: "table",
          caption: "Services that receive your information",
          columns: ["Service", "What it does with your information"],
          rows: [
            [
              `[${scheduler.name}](${scheduler.privacyUrl})`,
              "Runs my booking calendar and sends your confirmation email",
            ],
            [
              "[Google](https://policies.google.com/privacy)",
              "Google Analytics measures site visits",
            ],
            [
              "[Supabase](https://supabase.com/privacy)",
              "Stores contact form messages in a secure database",
            ],
            [
              "[Brevo](https://www.brevo.com/legal/privacypolicy/)",
              "Sends me an email alert when you send the contact form",
            ],
            ...ifMeta([
              "[Meta](https://www.facebook.com/privacy/policy)",
              "The Meta Pixel measures ad results and helps show my ads on Facebook and Instagram",
            ]),
            [
              "[Hostinger](https://www.hostinger.com/privacy-policy)",
              "Hosts the website and keeps server logs",
            ],
            [
              business.emailProvider,
              "Delivers and stores the emails we send each other",
            ],
          ],
        },
        {
          type: "p",
          text: USES_META_PIXEL
            ? '**I don\'t sell your information for money.** Some state privacy laws treat letting ad tools like the Meta Pixel collect data as "sharing" or even a "sale," even when no money changes hands.'
            : "**I don't sell or share your information for advertising.**",
        },
        {
          type: "p",
          text: "I may also share information if the law requires it, to protect my rights or someone's safety, or if WebTech Ninjas is ever sold or merged. In that last case, the new owner would have to follow this policy.",
        },
      ],
    },
    {
      id: "cookies",
      title: "Cookies and tracking",
      // review: [
      //   `${LAWYER} whether you need to honor Global Privacy Control signals.`,
      // ],
      blocks: [
        {
          type: "p",
          text: `Cookies are small files your browser saves. This site uses them for analytics${USES_META_PIXEL ? " and ads" : ""}, not to log you in or store anything you type.`,
        },
        {
          type: "table",
          caption: "Cookies set on this site",
          columns: ["Tool", "Cookies it sets", "Why"],
          rows: [
            [
              "Google Analytics 4",
              "`_ga` and `_ga_<ID>`",
              "Counts visits and tells new visitors from returning ones",
            ],
            ...ifMeta([
              "Meta Pixel",
              "`_fbp`",
              "Measures ad results and builds ad audiences of past visitors",
            ]),
            [
              scheduler.name,
              "Its own cookies inside the booking calendar",
              "Runs the calendar and remembers your time zone",
            ],
          ],
        },
        {
          type: "p",
          text: USES_META_PIXEL
            ? "**Google and Meta can collect information about your activity on this site over time and across other websites.** That's how their analytics and ad tools work."
            : "**Google can collect information about your activity on this site over time and across other websites.** That's how its analytics tools work.",
        },
        {
          type: "list",
          lead: "**How to block or limit tracking:**",
          items: [
            "Block or delete cookies in your browser settings",
            "Install Google's [Analytics opt-out add-on](https://tools.google.com/dlpage/gaoptout)",
            ...ifMeta(
              "Change your Facebook and Instagram [ad preferences](https://www.facebook.com/adpreferences)",
            ),
            ...ifMeta(
              "Opt out of interest-based ads from many companies at [YourAdChoices](https://optout.aboutads.info)",
            ),
          ],
        },
        {
          type: "p",
          text: '**Do Not Track:** some browsers send a "Do Not Track" signal. This site doesn\'t currently change what it does when it gets one. California law requires me to tell you that.',
        },
        {
          type: "p",
          text: "**Global Privacy Control:** this site doesn't currently respond to Global Privacy Control signals either. Some states require businesses to honor them.",
        },
      ],
    },
    {
      id: "retention",
      title: "How long I keep it",
      // review: [
      //   `${LAWYER} how many years to keep client contracts and invoices, then replace [X].`,
      //   "Confirm: Google Analytics data retention is set to 14 months (it defaults to 2).",
      //   "Confirm: Hostinger's server log retention.",
      // ],
      blocks: [
        {
          type: "p",
          text: "If we talk but never work together, I delete your information 2 years after we last spoke.",
        },
        {
          type: "table",
          caption: "How long each kind of information is kept",
          columns: ["Information", "How long I keep it"],
          rows: [
            [
              "Form messages, bookings and call notes from people who don't become clients",
              "2 years after our last contact, then deleted",
            ],
            [
              "Client contracts, invoices and project records",
              `As long as tax and business laws require, usually ${business.clientRecordYears} years`,
            ],
            [
              "Google Analytics data",
              "14 months, then Google deletes it automatically",
            ],
            ...ifMeta([
              "Meta Pixel data",
              "Kept by Meta under [its own policy](https://www.facebook.com/privacy/policy)",
            ]),
            ["Server logs", "Kept by Hostinger on its own schedule"],
          ],
        },
        {
          type: "p",
          text: "If you ask me to delete your information sooner, I will, unless the law requires me to keep part of it.",
        },
      ],
    },
    {
      id: "your-choices",
      title: "Your choices and how to request deletion",
      // review: [
      //   `${LAWYER} which state privacy laws, if any, apply to a business your size.`,
      // ],
      blocks: [
        {
          type: "p",
          text: "Email me and I'll delete your information, show you what I have, or fix anything that's wrong.",
        },
        {
          type: "list",
          lead: "**You can ask me to:**",
          items: [
            "Send you a copy of the information I have about you",
            "Correct anything that's wrong",
            "Delete your information",
            "Stop contacting you",
          ],
        },
        {
          type: "list",
          lead: "**How to ask:**",
          ordered: true,
          items: [
            `Email ${site.email} with "Privacy request" in the subject line. Say what you want me to do.`,
            "I'll confirm it's really you, usually by replying to the email address or phone number you gave me.",
            `I'll handle it within ${business.responseDays} days and tell you when it's done.`,
          ],
        },
        {
          type: "p",
          text: USES_META_PIXEL
            ? "After I delete your information, I also remove it from my scheduler and my contact form database. I can't delete data Google or Meta already hold, but the opt-out links above let you limit it."
            : "After I delete your information, I also remove it from my scheduler and my contact form database. I can't delete data Google already holds, but the opt-out link above lets you limit it.",
        },
        {
          type: "p",
          text: "**Extra rights in some states.** California, Virginia, Colorado and a growing list of other states give residents extra privacy rights. Most of these laws only cover businesses above certain size or revenue limits, and a one-person agency like mine likely falls below them. I'll honor the requests above no matter which state you live in, and I won't treat you differently for making one.",
        },
      ],
    },
    {
      id: "security",
      title: "Security",
      // review: [
      //   `${LAWYER} your breach notice duties under Florida law.`,
      //   "Confirm: two-factor login is on for Google, Meta, Hostinger and your scheduler. This section says it is.",
      // ],
      blocks: [
        {
          type: "p",
          text: "I protect your information with password-protected accounts, two-factor login where the service offers it, and an encrypted (HTTPS) connection on this site. No website is 100% secure, so I can't promise nothing will ever go wrong. If a breach exposes your personal information, I'll tell you as Florida law requires.",
        },
      ],
    },
    {
      id: "call-recordings",
      title: "Call recordings",
      // review: [
      //   "Confirm: Florida requires everyone's consent to record a call. Keep this section only if it's how you work.",
      // ],
      blocks: [
        {
          type: "p",
          text: "I don't record our calls unless everyone on the call agrees first.",
        },
      ],
    },
    {
      id: "children",
      title: "Children",
      blocks: [
        {
          type: "p",
          text: "This site is for business owners. It isn't meant for children under 13, and I don't knowingly collect their information. If you think a child sent me information, email me and I'll delete it.",
        },
      ],
    },
    {
      id: "changes",
      title: "Changes to this policy",
      blocks: [
        {
          type: "p",
          text: "If I change this policy, I'll update the effective date at the top. If the change is big, like adding a new tracking tool, I'll also note it on the site.",
        },
      ],
    },
    {
      id: "law",
      title: "Which law applies",
      // review: [`${LAWYER} the governing law line.`],
      blocks: [
        {
          type: "p",
          text: "This policy is governed by the laws of Florida and the United States.",
        },
      ],
    },
    {
      id: "contact",
      title: "How to contact me",
      blocks: [
        {
          type: "p",
          text: "Questions about this policy or your information? Reach me, Chris, directly:",
        },
        { type: "contact" },
      ],
    },
  ] satisfies LegalSection[],

  contact: {
    emailLabel: "Email",
    phoneLabel: "Phone or text",
    mailLabel: "Mail",
    mailingAddress: business.mailingAddress,
    spanish: "Se habla español.",
  },

  /** Dev-only banners. Never shown on the live site. */
  // draftNotice:
  //   "Draft for review. Not legal advice. Highlighted [brackets] are blanks to fill, and yellow notes are checks to clear before launch.",
  // draftReminder:
  //   "Reminder: this is a draft, not legal advice. Privacy laws change often and differ by state, so have a Florida attorney review it before you publish.",
};
