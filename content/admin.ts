/**
 * Admin copy and navigation. Same rule as the marketing site: words live here, components stay dumb.
 * Icons are picked in the components by `icon` key so this file stays plain data.
 */

export type NavIcon =
  | "overview"
  | "leads"
  | "clients"
  | "projects"
  | "tasks"
  | "reports"
  | "settings";

export type NavItem = {
  label: string;
  href: string;
  icon: NavIcon;
  /** Not built yet: shows a "Soon" tag and a placeholder page instead of hiding the link. */
  soon?: boolean;
};

export const adminNav: NavItem[] = [
  { label: "Overview", href: "/admin", icon: "overview" },
  { label: "Leads", href: "/admin/leads", icon: "leads" },
  { label: "Clients", href: "/admin/clients", icon: "clients" },
  { label: "Projects", href: "/admin/projects", icon: "projects", soon: true },
  { label: "Tasks", href: "/admin/tasks", icon: "tasks", soon: true },
  { label: "Reports", href: "/admin/reports", icon: "reports", soon: true },
  { label: "Settings", href: "/admin/settings", icon: "settings", soon: true },
];

export const adminBrand = {
  name: "WebTech Ninjas",
  product: "Admin",
  logo: { onLight: "/brand/mask-dark.png", onDark: "/brand/mask-light.png" },
  siteHref: "/",
} as const;

export const login = {
  meta: { title: "Sign in" },
  /** Match Supabase: Authentication > Providers > Email > Email OTP Length. */
  codeLength: 6,
  eyebrow: "Admin",
  email: {
    heading: "Sign in",
    body: "Enter your email. You'll get a sign-in link and a 6 digit code. Use whichever is handy.",
    label: "Email",
    placeholder: "you@webtechninjas.com",
    submit: "Email me a code",
    sending: "Sending...",
  },
  code: {
    heading: "Check your email",
    body: (email: string) =>
      `If ${email} has admin access, a code and a sign-in link are on the way.`,
    label: "6 digit code",
    submit: "Sign in",
    verifying: "Checking...",
    resend: "Send a new code",
    resendIn: (s: number) => `New code in ${s}s`,
    switchEmail: "Use a different email",
    tip: "Reading email on your phone? Type the code here instead of tapping the link.",
  },
  confirm: {
    heading: "Finish signing in",
    body: "One tap and you're in. (This extra step stops email scanners from using up your link before you do.)",
    submit: "Sign me in",
    working: "Signing in...",
  },
  errors: {
    email: "That doesn't look like an email address.",
    code: "Enter all 6 digits.",
    badCode: "That code didn't work. It may have expired, so grab a new one.",
    rateLimited: "Slow down a sec. Wait a minute, then ask for a new code.",
    send: "Couldn't send the email. Check the Brevo SMTP settings in Supabase.",
    link: "That sign-in link expired or was already used. Ask for a new code below.",
    notAdmin: "You're signed in, but that account isn't on the admin list.",
  },
  footer: "Only admins get an email. Nobody else gets anything, by design.",
} as const;

export const overview = {
  meta: { title: "Overview" },
  greeting: (part: "morning" | "afternoon" | "evening", name: string) =>
    `${part === "morning" ? "Morning" : part === "afternoon" ? "Afternoon" : "Evening"}, ${name}.`,
  subhead: (range: string) => `Here's how ${range.toLowerCase()} went.`,
  kpis: {
    leads: { label: "New leads" },
    clients: {
      label: "Active clients",
      note: (n: number) =>
        n === 1 ? "1 new this period" : `${n} new this period`,
    },
    projects: {
      label: "Open projects",
      note: (n: number) =>
        n === 0 ? "Nothing due this week" : `${n} due this week`,
    },
    revenue: { label: "Revenue", hint: "Paid invoices" },
  },
  noPrev: "Nothing last period",
  leadsCard: {
    title: "Latest leads",
    description: (n: number) =>
      n === 1 ? "1 lead in this range" : `${n} leads in this range`,
    viewAll: "View all leads",
    empty: "No leads in this range yet. Try a wider date range.",
  },
  services: {
    title: "Services breakdown",
    description: "What new leads asked about",
    untagged: "Not tagged",
    empty: "No leads to break down yet.",
  },
  activity: {
    title: "Recent activity",
    empty: "Quiet stretch. Nothing happened in this range.",
  },
} as const;

export const leadsPage = {
  meta: { title: "Leads" },
  title: "Leads",
  description: "Everyone who booked a call or sent a message.",
  searchLabel: "Search leads",
  searchPlaceholder: "Name or email",
  all: "All",
  empty: "No leads match that. Clear the filters to see everyone.",
  page: (n: number, total: number) => `Page ${n} of ${total}`,
  prev: "Previous",
  next: "Next",
  sheet: {
    statusLabel: "Status",
    email: "Email",
    call: "Call",
    message: "Their message",
    noMessage: "No message. Most likely a Calendly booking.",
    details: "Details",
    saved: (label: string) => `Marked as ${label}`,
    failed: "Couldn't update that lead",
  },
  columns: {
    lead: "Lead",
    service: "Service",
    source: "Source",
    status: "Status",
    date: "Date",
  },
  convert: "Make them a client",
  viewClient: (name: string) => `View client: ${name}`,
  convertHint:
    "Closed and onboarded? This carries their details over and marks the lead Won.",
} as const;

export const clientsPage = {
  meta: { title: "Clients" },
  title: "Clients",
  description: "Who's paying, for what, and what's coming up.",
  add: "Add client",
  sync: "Sync Stripe",
  syncing: "Syncing...",
  searchLabel: "Search clients",
  searchPlaceholder: "Business, contact or email",
  tabs: { active: "Active", paused: "Paused", churned: "Churned", all: "All" },
  empty:
    "No clients here yet. Turn a won lead into one from the Leads page, or add one by hand.",
  unlinked: (n: number) =>
    `${n} Stripe subscription${n === 1 ? " isn't" : "s aren't"} linked to a client yet. Link the customer on the client's page, or hit Sync Stripe to match by email.`,
  stats: {
    active: "Active clients",
    mrr: "Monthly recurring",
    mrrHint: "Care plans + payment plans",
    avg: "Avg per paying client",
    attention: "Needs attention",
    attentionNone: "All good",
    attentionSome: "Failed, canceling or ending",
  },
  columns: {
    client: "Client",
    plan: "Plan",
    monthly: "Monthly",
    status: "Status",
    next: "Next up",
    since: "Since",
  },
  noPlan: "No plan",
  renewals: {
    title: "Renewals",
    description: "Next 30 days. Problems first.",
    empty: "Nothing due in the next 30 days.",
    kinds: {
      failed: {
        label: "Payment failed",
        hint: "Card bounced. Stripe retries, but call them.",
      },
      ending: {
        label: "Payment plan ends",
        hint: "Month 12. Move them to a care plan or the site's on its own.",
      },
      canceling: {
        label: "Canceling",
        hint: "Turned off renewal. Worth a call before it lapses.",
      },
      manual: {
        label: "Bill them",
        hint: "Not in Stripe. Send the invoice yourself.",
      },
      renews: { label: "Renews", hint: "" },
    },
  },
} as const;

export const clientPage = {
  edit: "Edit",
  email: "Email",
  call: "Call",
  openStripe: "Open in Stripe",
  contact: "Contact",
  origin: {
    title: "Came from",
    lead: (name: string) => `Lead: ${name}`,
    manual: "Added by hand. No lead on file.",
    view: "Open the lead",
  },
  billing: {
    title: "Plan and billing",
    noPlan: "No plan yet.",
    monthly: "Monthly value",
    nextCharge: "Next charge",
    ends: "Ends",
    month: (n: number, of: number) => `Payment ${n} of ${of}`,
    manualNote: "Billed outside Stripe",
    linkTitle: "Connect Stripe",
    linkBody:
      "Paste their Stripe customer id or email. Plans and payments pull in right away, and the webhook keeps them current.",
    linkPlaceholder: "cus_... or billing email",
    link: "Link",
    create: "Create in Stripe",
    linked: "Stripe customer",
    syncNow: "Sync now",
    history: "Past plans",
    noStripe: "Stripe isn't connected yet (STRIPE_SECRET_KEY).",
  },
  projects: {
    title: "Projects",
    empty: "No projects yet.",
    add: "Add project",
    name: "Project name",
    namePlaceholder: "New website",
    service: "Service",
    servicePlaceholder: "Website design",
    due: "Due",
    save: "Add",
    due_label: (d: string) => `Due ${d}`,
  },
  payments: {
    title: "Payments",
    empty: "No payments on file yet.",
    receipt: "Receipt",
  },
  notes: { title: "Notes", empty: "Nothing yet. Add notes from Edit." },
} as const;

export const clientForm = {
  newTitle: "Add client",
  newFromLead: (name: string) => `Add client from ${name}'s lead`,
  editTitle: (name: string) => `Edit ${name}`,
  fromLeadNote:
    "Contact details came over from the lead. Add the business name and you're set.",
  sections: {
    business: "Business",
    billing: "Billing outside Stripe",
    notes: "Notes",
  },
  billingHint:
    "Only for clients you don't bill through Stripe. Stripe plans fill in on their own.",
  fields: {
    name: { label: "Business name", placeholder: "Ruiz Heating & Air" },
    contact_name: { label: "Contact", placeholder: "Dana Ruiz" },
    email: { label: "Email", placeholder: "dana@ruizheating.com" },
    phone: { label: "Phone", placeholder: "(407) 555-0142" },
    website: { label: "Website", placeholder: "ruizheating.com" },
    status: { label: "Status" },
    onboarded_on: { label: "Onboarded" },
    manual_plan: { label: "Plan", placeholder: "Handled (family rate)" },
    manual_monthly: { label: "Monthly $", placeholder: "79" },
    manual_renews_on: { label: "Next bill date" },
    notes: {
      label: "Notes",
      placeholder: "Gate code, favorite colors, who signs off...",
    },
  },
  save: "Save client",
  saving: "Saving...",
  cancel: "Cancel",
} as const;

/** Placeholder pages for nav items marked `soon`. Honest about what isn't built yet. */
export const comingSoon: Record<
  string,
  { title: string; body: string; planned: string[] }
> = {
  projects: {
    title: "Projects",
    body: "Every build from kickoff to launch.",
    planned: [
      "Status board: planning, in progress, review, done",
      "Due dates with a heads up when one slips",
      "Launch checklist per site",
    ],
  },
  tasks: {
    title: "Tasks",
    body: "The small stuff that keeps falling through the cracks.",
    planned: [
      "Tasks tied to a client or project",
      "Due today and overdue views",
      "Quick add from your phone",
    ],
  },
  reports: {
    title: "Reports",
    body: "The monthly reports Growth care plan clients get.",
    planned: [
      "Calls, form fills and top pages per client",
      "One click PDF to send",
      "Month over month trends",
    ],
  },
  settings: {
    title: "Settings",
    body: "Admins, notifications and connections.",
    planned: [
      "Invite another admin",
      "Email alerts for new leads",
      "Calendly and Brevo connection status",
    ],
  },
};

export const comingSoonCopy = {
  badge: "Not built yet",
  plannedHeading: "What goes here",
  back: "Back to overview",
} as const;
