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
  { label: "Clients", href: "/admin/clients", icon: "clients", soon: true },
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
    placeholder: "admin@youremail.com",
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
} as const;

/** Placeholder pages for nav items marked `soon`. Honest about what isn't built yet. */
export const comingSoon: Record<string, { title: string; body: string; planned: string[] }> = {
  clients: {
    title: "Clients",
    body: "Signed clients, their care plan and what they pay each month.",
    planned: ["Client list with plan and monthly value", "Link back to the lead they came from", "Care plan renewals"],
  },
  projects: {
    title: "Projects",
    body: "Every build from kickoff to launch.",
    planned: ["Status board: planning, in progress, review, done", "Due dates with a heads up when one slips", "Launch checklist per site"],
  },
  tasks: {
    title: "Tasks",
    body: "The small stuff that keeps falling through the cracks.",
    planned: ["Tasks tied to a client or project", "Due today and overdue views", "Quick add from your phone"],
  },
  reports: {
    title: "Reports",
    body: "The monthly reports Growth care plan clients get.",
    planned: ["Calls, form fills and top pages per client", "One click PDF to send", "Month over month trends"],
  },
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
