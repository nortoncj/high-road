/**
 * Admin copy and navigation. Same rule as the marketing site: words live here, components stay dumb.
 * Icons are picked in the components by `icon` key so this file stays plain data.
 */

export type NavIcon = "overview" | "leads" | "clients" | "projects" | "tasks" | "reports" | "settings";

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
  { label: "Tasks", href: "/admin/tasks", icon: "tasks" },
  { label: "Reports", href: "/admin/reports", icon: "reports" },
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
    body: (email: string) => `If ${email} has admin access, a code and a sign-in link are on the way.`,
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
    clients: { label: "Active clients", note: (n: number) => (n === 1 ? "1 new this period" : `${n} new this period`) },
    projects: { label: "Open projects", note: (n: number) => (n === 0 ? "Nothing due this week" : `${n} due this week`) },
    revenue: { label: "Revenue", hint: "Paid invoices" },
  },
  noPrev: "Nothing last period",
  leadsCard: {
    title: "Latest leads",
    description: (n: number) => (n === 1 ? "1 lead in this range" : `${n} leads in this range`),
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
  columns: { lead: "Lead", service: "Service", source: "Source", status: "Status", date: "Date" },
  convert: "Make them a client",
  viewClient: (name: string) => `View client: ${name}`,
  convertHint: "Closed and onboarded? This carries their details over and marks the lead Won.",
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
  empty: "No clients here yet. Turn a won lead into one from the Leads page, or add one by hand.",
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
  columns: { client: "Client", plan: "Plan", monthly: "Monthly", status: "Status", next: "Next up", since: "Since" },
  noPlan: "No plan",
  renewals: {
    title: "Renewals",
    description: "Next 30 days. Problems first.",
    empty: "Nothing due in the next 30 days.",
    kinds: {
      failed: { label: "Payment failed", hint: "Card bounced. Stripe retries, but call them." },
      ending: { label: "Payment plan ends", hint: "Month 12. Move them to a care plan or the site's on its own." },
      canceling: { label: "Canceling", hint: "Turned off renewal. Worth a call before it lapses." },
      manual: { label: "Bill them", hint: "Not in Stripe. Send the invoice yourself." },
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
    linkBody: "Paste their Stripe customer id or email. Plans and payments pull in right away, and the webhook keeps them current.",
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
  payments: { title: "Payments", empty: "No payments on file yet.", receipt: "Receipt" },
  notes: { title: "Notes", empty: "Nothing yet. Add notes from Edit." },
} as const;

export const clientForm = {
  newTitle: "Add client",
  newFromLead: (name: string) => `Add client from ${name}'s lead`,
  editTitle: (name: string) => `Edit ${name}`,
  fromLeadNote: "Contact details came over from the lead. Add the business name and you're set.",
  sections: { business: "Business", billing: "Billing outside Stripe", notes: "Notes" },
  billingHint: "Only for clients you don't bill through Stripe. Stripe plans fill in on their own.",
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
    notes: { label: "Notes", placeholder: "Gate code, favorite colors, who signs off..." },
  },
  save: "Save client",
  saving: "Saving...",
  cancel: "Cancel",
} as const;

/** Placeholder pages for nav items marked `soon`. Honest about what isn't built yet. */
export const comingSoon: Record<string, { title: string; body: string; planned: string[] }> = {
  settings: {
    title: "Settings",
    body: "Admins, notifications and connections.",
    planned: ["Invite another admin", "Email alerts for new leads", "Calendly and Brevo connection status"],
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
    items: ["Kickoff call", "Client drops assets in the Drive folder", "Domain, hosting and Google Business Profile access"],
  },
  { phase: "Sitemap", at: 0.15, items: ["Sitemap and page list approved"] },
  { phase: "Brand", at: 0.3, items: ["Branding: colors, fonts, photo style", "Logo final (SVG + PNG)"] },
  { phase: "Copy", at: 0.5, items: ["Homepage copy", "Service pages copy", "Client approves copy"] },
  {
    phase: "Build",
    at: 0.8,
    items: ["Landing page / homepage", "Service and inner pages", "Contact and booking forms wired to leads", "Mobile pass"],
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
  { phase: "After launch", at: 1, items: ["Launch announcement to client", "Handoff: logins and how-to", "2 week check-in"] },
];

export const projectsPage = {
  meta: { title: "Projects" },
  title: "Projects",
  description: "Every build from kickoff to launch.",
  add: "New project",
  searchLabel: "Search projects",
  searchPlaceholder: "Project or client",
  columns: { planning: "Planning", in_progress: "In progress", review: "Review", done: "Done", on_hold: "On hold" },
  emptyColumn: "Nothing here",
  dropHere: "Drop here",
  doneOlder: (n: number) => `+${n} launched earlier`,
  move: "Move to",
  dragHint: "Drag cards between columns, or use the ⋯ menu. On a phone, press and hold to drag.",
  slipping: {
    late: (n: number) => (n === 1 ? "1 project is past due" : `${n} projects are past due`),
    behind: (n: number) => (n === 1 ? "1 has checklist items behind schedule" : `${n} have checklist items behind schedule`),
    soon: (n: number) => (n === 1 ? "1 is due this week" : `${n} are due this week`),
  },
  next: (t: string) => `Next: ${t}`,
  allDone: "Checklist done",
  movedTo: (label: string) => `Moved to ${label}`,
  openLaunch: (n: number) => `Moved to Done with ${n} launch item${n === 1 ? "" : "s"} still open. Worth a look.`,
  moveFailed: "Couldn't move that project",
  empty: "No projects yet. Start one here or from a client's page.",
} as const;

export const projectPage = {
  back: "Projects",
  edit: "Edit",
  status: "Status",
  late: (days: number) => `${days} day${days === 1 ? "" : "s"} past due. Push the date or chase whatever's blocking it.`,
  behind: (n: number) => `${n} checklist item${n === 1 ? " is" : "s are"} behind schedule.`,
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
    drive_url: { label: "Google Drive folder", placeholder: "https://drive.google.com/drive/folders/..." },
    notes: { label: "Notes", placeholder: "Scope, the client's must-haves, anything you'll forget by week 3" },
  },
  template: "Start with the launch checklist",
  templateHint: "Adds your standard steps. With a start and launch date, each step gets a due date spread across the timeline.",
  shift: "Shift unfinished checklist dates along with the launch date",
  save: "Save project",
  saving: "Saving...",
  cancel: "Cancel",
} as const;

/* Tasks */

export const tasksPage = {
  meta: { title: "Tasks" },
  title: "Tasks",
  description: "The small stuff that keeps falling through the cracks.",
  tabs: { today: "Today", upcoming: "Upcoming", someday: "No date", done: "Done" },
  sections: { overdue: "Overdue", today: "Today", later: "Later" },
  empty: {
    today: "Nothing due today. Go build something.",
    upcoming: "Nothing scheduled ahead.",
    someday: "No undated tasks. Inbox zero, look at you.",
    done: "Nothing finished in the last 7 days yet.",
  },
  quickAdd: {
    label: "Add a task",
    placeholder: "Call Dana tomorrow #ruiz",
    hint: "Dates like today, fri, next week, 11/3 or in 3 days. #name links a client or project.",
    add: "Add",
    added: "Task added",
    shortcut: "N",
  },
  checklistTag: "Checklist",
  done: (title: string) => `Done: ${title}`,
  undo: "Undo",
  reschedule: {
    label: "Reschedule",
    today: "Today",
    tomorrow: "Tomorrow",
    nextWeek: "Next Monday",
    none: "No date",
    pick: "Pick a date",
    moved: (when: string) => `Moved to ${when}`,
  },
  edit: {
    title: "Edit task",
    titleLabel: "Task",
    notes: "Notes",
    notesPlaceholder: "Links, phone numbers, the thing you'll forget",
    due: "Due",
    client: "Client",
    project: "Project",
    none: "None",
    save: "Save",
    saving: "Saving...",
    delete: "Delete task",
    deleted: "Task deleted",
    openProject: "Checklist items live on their project. Open it to edit.",
  },
  overviewCard: {
    title: "Upcoming tasks",
    description: (n: number, overdue: number) =>
      overdue > 0
        ? `${overdue} overdue. Knock those out or push them.`
        : n === 0
          ? "Late, today and the next 7 days"
          : `${n} due in the next 7 days`,
    fallback: "Late, today and the next 7 days",
    empty: "Nothing due this week. Add tasks from the Tasks page.",
    all: "All tasks",
    more: (n: number) => `+${n} more on the Tasks page`,
  },
  clientCard: { title: "Tasks", empty: "No open tasks for this client.", all: "All tasks" },
} as const;

/* Reports */

/**
 * Honesty rules for anything a client reads: "call taps" are taps on the phone number, not
 * answered calls. Say so. Don't round up, don't guess why a number moved.
 */
export const reportsPage = {
  meta: { title: "Reports" },
  title: "Reports",
  description: (month: string) => `${month}. What each client's site did, ready to send.`,
  stats: {
    calls: { label: "Call taps", hint: "Taps on a phone number" },
    forms: { label: "Form fills", hint: "Forms sent from the site" },
    visits: { label: "Visits", hint: "Each visitor once a day" },
  },
  allClients: "All tracked clients",
  columns: { client: "Client", calls: "Call taps", forms: "Form fills", visits: "Visits", sent: "Report" },
  sent: (d: string) => `Sent ${d}`,
  notSent: "Not sent",
  empty: "No client sites are tracked yet. Open a client and add their site to get a snippet.",
  untracked: {
    title: "Not tracking yet",
    body: "Active clients with no site set up. Add their domain on the client page and paste the snippet.",
    setup: "Set up",
  },
  status: {
    live: "Live",
    quiet: "Went quiet",
    waiting: "Waiting for first visit",
    paused: "Paused",
  },
  statusHint: {
    quiet: "No hits in a week. The snippet may have been removed in an update.",
    waiting: "Snippet not seen yet. Check it's on the live site.",
  },
} as const;

export const reportPage = {
  back: "Reports",
  summaryTitle: "What they'll read",
  trendLabel: "Last 12 months",
  pages: {
    title: "Top pages",
    description: "Where visitors landed, and which pages made the phone ring.",
    page: "Page",
    views: "Views",
    calls: "Calls",
    forms: "Forms",
    empty: "No page views this month.",
  },
  sources: {
    title: "Where visitors came from",
    description: "Where each visit started.",
    empty: "No visits this month.",
    gbpTip: "Tip: add ?utm_source=gbp to the website link on their Google Business Profile so it shows up here on its own instead of as Google search.",
  },
  sends: { title: "Sent", empty: "Not sent yet.", line: (month: string, to: string) => `${month} to ${to}` },
  noSites: "This client has no site set up yet, so there's nothing to report.",
  setupLink: "Set up tracking",
  actions: {
    preview: "Preview",
    download: "Download PDF",
    email: "Email to client",
  },
  emailSheet: {
    title: "Email this report",
    description: (month: string) => `${month} report goes out as a PDF from your Brevo account.`,
    to: "Send to",
    toHint: "Their email on file, or whoever got the last one.",
    note: "Personal note (optional)",
    notePlaceholder: "Nice jump in calls this month. Want to add a page for water heaters?",
    send: "Send report",
    sending: "Sending...",
    already: (d: string) => `This month already went out ${d}. Sending again is fine; it'll be logged twice.`,
    notConfigured: "Email isn't set up yet. Add BREVO_API_KEY and REPORT_FROM_EMAIL to your env.",
  },
  /** The email itself. {name} is the contact's first name. */
  email: {
    subject: (business: string, month: string) => `${business}: your website report for ${month}`,
    greeting: (name: string | null) => (name ? `Hi ${name},` : "Hi,"),
    intro: (business: string, month: string) => `Here's how ${business}'s website did in ${month}.`,
    attached: "The full report is attached as a PDF.",
    signoff: "Questions? Just reply to this email.",
  },
} as const;

/** The PDF. Kept here so wording changes don't mean digging through drawing code. */
export const reportPdf = {
  eyebrow: "WEBSITE REPORT",
  stats: { calls: "Call taps", forms: "Form fills", visits: "Visits" },
  trend: "Last 12 months",
  history: { title: "Month by month", leads: "Leads", visits: "Visits" },
  pages: { title: "Top pages", page: "Page", views: "Views", calls: "Calls", forms: "Forms", empty: "No page views this month." },
  sources: { title: "Where visitors came from", empty: "No visits this month." },
  howWeCount:
    "How we count: call taps are taps on your phone number from the website. Form fills are forms sent from the site. Visits count each visitor once per day. No cookies, no personal data.",
  footer: "Prepared by WebTech Ninjas  ·  webtechninjas.com",
} as const;

export const trackingCard = {
  title: "Website tracking",
  description: "Calls, form fills and visits for their monthly report.",
  addLabel: "Site domain",
  addPlaceholder: "acmehvac.com",
  add: "Add site",
  adding: "Adding...",
  copy: "Copy snippet",
  copied: "Copied",
  pause: "Pause",
  resume: "Resume",
  lastSeen: (ago: string) => `Last hit ${ago}`,
  install: [
    "WordPress: paste it into WPCode (Header & Footer) or the theme footer.",
    "Custom sites: put it right before </body>.",
    "Then open their site once with ?wtn_ignore=1 so your own visits don't count.",
  ],
  viewReport: "View report",
} as const;
