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
  { label: "Projects", href: "/admin/projects", icon: "projects" },
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
      overdue: {
        label: "Installment overdue",
        hint: "Past due. Nudge them, or mark it paid if it came in.",
      },
      installment: {
        label: "Installment due",
        hint: "Send the Stripe invoice, or mark it paid when it lands.",
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
    due: "Launch date",
    save: "Add",
    due_label: (d: string) => `Due ${d}`,
  },
  payments: {
    title: "Payments",
    empty: "No payments on file yet.",
    receipt: "Receipt",
  },
  paymentPlans: {
    title: "Project payments",
    description: "Fixed-price work paid in installments. Not a subscription.",
    empty: "No payment plans. Add one when they say yes to a quote.",
    add: "New payment plan",
    paidOf: (paid: string, total: string) => `${paid} of ${total} paid`,
    paidOff: "Paid off",
    cancelled: "Cancelled",
    started: (d: string) => `Started ${d}`,
    next: (label: string, amount: string) => `Next: ${label}, ${amount}`,
    due: (d: string) => `Due ${d}`,
    overdue: (d: string) => `Overdue, was due ${d}`,
    noDate: "No due date",
    invoiced: "Invoice sent",
    paid: (d: string, method: string) => `Paid ${d} · ${method}`,
    sendInvoice: "Send invoice",
    sending: "Sending...",
    markPaid: "Mark paid",
    copyLink: "Copy pay link",
    copied: "Pay link copied",
    undo: "Undo",
    undoing: "Undoing...",
    method: "Paid with",
    paidOn: "Paid on",
    save: "Save",
    cancel: "Cancel",
    remove: "Remove plan",
    removing: "Removing...",
    removeConfirm:
      "Remove this payment plan? Open Stripe invoices get voided. If anything's been paid, the plan is cancelled instead and those payments stay on record.",
    connectStripe: "Connect Stripe above to email invoices. You can still mark payments by hand.",
    closed: (n: number) => `Paid off and cancelled (${n})`,
    form: {
      title: "What it's for",
      titlePlaceholder: "Website build",
      project: "Project",
      noProject: "No project",
      total: "Total $",
      totalPlaceholder: "2000",
      count: "Payments",
      deposit: "Deposit $",
      depositPlaceholder: "Optional",
      firstDue: "First due",
      every: "Then",
      schedule: "Schedule",
      scheduleHint: "Edit any row. Changing the fields above rebuilds it.",
      label: "Label",
      amount: "Amount",
      dueOn: "Due",
      sum: (sum: string, total: string) => `Adds up to ${sum} of ${total}`,
      matches: (total: string) => `Adds up to ${total}`,
      save: "Create plan",
      saving: "Creating...",
    },
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

/* Projects */

export type TemplatePhase = {
  phase: string;
  /** Where this phase's items land between start and due date (0 = kickoff day, 1 = launch day). */
  at: number;
  items: string[];
  /** The phase that counts as "the launch checklist": moving to Done with these open gets a warning. */
  launch?: boolean;
};

/**
 * Every new project starts with this checklist. Your order: sitemap, branding, logo, copy, then
 * pages. Assets come first on purpose: waiting on client files is what slips most builds, so
 * that item gets a due date 3 days in and goes red fast.
 * Edit freely. Changes only affect projects created after.
 */
export const projectTemplate: TemplatePhase[] = [
  {
    phase: "Kickoff",
    at: 0.05,
    items: [
      "Kickoff call",
      "Client drops assets in the Drive folder",
      "Domain, hosting and Google Business Profile access",
    ],
  },
  { phase: "Sitemap", at: 0.15, items: ["Sitemap and page list approved"] },
  {
    phase: "Brand",
    at: 0.3,
    items: ["Branding: colors, fonts, photo style", "Logo final (SVG + PNG)"],
  },
  {
    phase: "Copy",
    at: 0.5,
    items: ["Homepage copy", "Service pages copy", "Client approves copy"],
  },
  {
    phase: "Build",
    at: 0.8,
    items: [
      "Landing page / homepage",
      "Service and inner pages",
      "Contact and booking forms wired to leads",
      "Mobile pass",
    ],
  },
  {
    phase: "Launch checklist",
    at: 0.95,
    launch: true,
    items: [
      "Every form tested end to end (lead lands, email sends)",
      "Click-to-call and click-to-text work on a real phone",
      "Titles, meta descriptions and social images",
      "LocalBusiness schema, NAP matches Google Business Profile",
      "Analytics + lead conversion events firing",
      "Lighthouse: performance and accessibility 90+",
      "301 redirects from the old site",
      "DNS, SSL and www redirect",
      "Sitemap submitted to Search Console",
      "Client sign-off",
    ],
  },
  {
    phase: "After launch",
    at: 1,
    items: [
      "Launch announcement to client",
      "Handoff: logins and how-to",
      "2 week check-in",
    ],
  },
];

export const projectsPage = {
  meta: { title: "Projects" },
  title: "Projects",
  description: "Every build from kickoff to launch.",
  add: "New project",
  searchLabel: "Search projects",
  searchPlaceholder: "Project or client",
  columns: {
    planning: "Planning",
    in_progress: "In progress",
    review: "Review",
    done: "Done",
    on_hold: "On hold",
  },
  emptyColumn: "Nothing here",
  dropHere: "Drop here",
  doneOlder: (n: number) => `+${n} launched earlier`,
  move: "Move to",
  dragHint:
    "Drag cards between columns, or use the ⋯ menu. On a phone, press and hold to drag.",
  slipping: {
    late: (n: number) =>
      n === 1 ? "1 project is past due" : `${n} projects are past due`,
    behind: (n: number) =>
      n === 1
        ? "1 has checklist items behind schedule"
        : `${n} have checklist items behind schedule`,
    soon: (n: number) =>
      n === 1 ? "1 is due this week" : `${n} are due this week`,
  },
  next: (t: string) => `Next: ${t}`,
  allDone: "Checklist done",
  movedTo: (label: string) => `Moved to ${label}`,
  openLaunch: (n: number) =>
    `Moved to Done with ${n} launch item${n === 1 ? "" : "s"} still open. Worth a look.`,
  moveFailed: "Couldn't move that project",
  empty: "No projects yet. Start one here or from a client's page.",
} as const;

export const projectPage = {
  back: "Projects",
  edit: "Edit",
  status: "Status",
  late: (days: number) =>
    `${days} day${days === 1 ? "" : "s"} past due. Push the date or chase whatever's blocking it.`,
  behind: (n: number) =>
    `${n} checklist item${n === 1 ? " is" : "s are"} behind schedule.`,
  checklist: "Checklist",
  progress: (done: number, total: number) => `${done} of ${total} done`,
  addItem: "Add item",
  addPlaceholder: "New item",
  setDate: "Set date",
  details: {
    title: "Details",
    client: "Client",
    service: "Service",
    start: "Started",
    due: "Launch date",
    launched: "Launched",
    none: "No client",
  },
  drive: {
    title: "Asset folder",
    open: "Open in Google Drive",
    empty: "No folder yet. Paste the Drive link you share with the client.",
    placeholder: "https://drive.google.com/drive/folders/...",
    save: "Save link",
    change: "Change",
    notDrive: "That's not a Google Drive link, but it's saved.",
    saved: "Folder saved",
  },
  notes: { title: "Notes", empty: "No notes. Add them from Edit." },
} as const;

export const projectForm = {
  newTitle: "New project",
  editTitle: (name: string) => `Edit ${name}`,
  fields: {
    name: { label: "Project name", placeholder: "New website" },
    client_id: { label: "Client", none: "No client yet" },
    service: { label: "Service", placeholder: "Website design" },
    status: { label: "Status" },
    start_date: { label: "Start date" },
    due_date: { label: "Launch date" },
    drive_url: {
      label: "Google Drive folder",
      placeholder: "https://drive.google.com/drive/folders/...",
    },
    notes: {
      label: "Notes",
      placeholder:
        "Scope, the client's must-haves, anything you'll forget by week 3",
    },
  },
  template: "Start with the launch checklist",
  templateHint:
    "Adds your standard steps. With a start and launch date, each step gets a due date spread across the timeline.",
  shift: "Shift unfinished checklist dates along with the launch date",
  save: "Save project",
  saving: "Saving...",
  cancel: "Cancel",
} as const;
