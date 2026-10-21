/**
 * The one place that knows your Supabase table and column names.
 *
 * Your leads table came from the Calendly webhook, so if a column is named differently
 * (say `full_name` instead of `name`), change it here and nothing else. Queries use
 * PostgREST aliases (`name:full_name`) so the rest of the code always sees the same keys.
 * The migration adds status, service, source, phone, website and message if they're missing.
 */

export const TIME_ZONE = "America/New_York";

export const tables = {
  leads: {
    table: "leads",
    columns: {
      id: "id",
      name: "name",
      email: "email",
      phone: "phone",
      website: "website",
      service: "service",
      source: "source",
      status: "status",
      message: "message",
      createdAt: "created_at",
    },
  },
  leadEvents: {
    table: "lead_events",
    columns: { id: "id", leadId: "lead_id", fromStatus: "from_status", toStatus: "to_status", createdAt: "created_at" },
  },
  clients: {
    table: "clients",
    columns: {
      id: "id",
      name: "name",
      contactName: "contact_name",
      email: "email",
      phone: "phone",
      website: "website",
      notes: "notes",
      status: "status",
      leadId: "lead_id",
      stripeCustomerId: "stripe_customer_id",
      onboardedOn: "onboarded_on",
      manualPlan: "care_plan",
      manualMonthlyCents: "manual_monthly_cents",
      manualRenewsOn: "manual_renews_on",
      createdAt: "created_at",
    },
    activeStatus: "active",
  },
  subscriptions: {
    table: "client_subscriptions",
    columns: {
      id: "id",
      clientId: "client_id",
      stripeCustomerId: "stripe_customer_id",
      status: "status",
      planName: "plan_name",
      kind: "kind",
      amountCents: "amount_cents",
      monthlyCents: "monthly_cents",
      interval: "billing_interval",
      currentPeriodEnd: "current_period_end",
      cancelAtPeriodEnd: "cancel_at_period_end",
      endsAt: "ends_at",
      startedAt: "started_at",
      canceledAt: "canceled_at",
    },
  },
  projects: {
    table: "projects",
    columns: {
      id: "id",
      clientId: "client_id",
      name: "name",
      service: "service",
      status: "status",
      dueDate: "due_date",
      startDate: "start_date",
      driveUrl: "drive_url",
      notes: "notes",
      completedAt: "completed_at",
      createdAt: "created_at",
    },
    closedStatuses: ["done", "cancelled"],
  },
  invoices: {
    table: "invoices",
    // Activity pulls the client's name through the client_id foreign key: `client:clients(name)`.
    columns: {
      id: "id",
      amountCents: "amount_cents",
      status: "status",
      paidAt: "paid_at",
      clientId: "client_id",
      projectId: "project_id",
      stripeInvoiceId: "stripe_invoice_id",
      number: "number",
      description: "description",
      hostedUrl: "hosted_invoice_url",
      issuedAt: "issued_at",
    },
    paidStatus: "paid",
  },
  paymentPlans: {
    table: "payment_plans",
    columns: {
      id: "id",
      clientId: "client_id",
      projectId: "project_id",
      title: "title",
      totalCents: "total_cents",
      status: "status",
      notes: "notes",
      createdAt: "created_at",
    },
  },
  installments: {
    table: "plan_installments",
    columns: {
      id: "id",
      planId: "plan_id",
      position: "position",
      label: "label",
      amountCents: "amount_cents",
      dueOn: "due_on",
      status: "status",
      paidAt: "paid_at",
      method: "method",
      stripeInvoiceId: "stripe_invoice_id",
      invoiceUrl: "invoice_url",
      invoiceId: "invoice_id",
    },
  },
  projectTasks: {
    table: "project_tasks",
    columns: {
      id: "id",
      projectId: "project_id",
      phase: "phase",
      title: "title",
      done: "done",
      doneAt: "done_at",
      dueDate: "due_date",
      position: "position",
    },
  },
  tasks: {
    table: "tasks",
    columns: {
      id: "id",
      title: "title",
      notes: "notes",
      dueDate: "due_date",
      done: "done",
      doneAt: "done_at",
      clientId: "client_id",
      projectId: "project_id",
      createdAt: "created_at",
    },
  },
  admins: {
    table: "admin_users",
    columns: { userId: "user_id", fullName: "full_name", role: "role" },
  },
} as const;

/** Builds a PostgREST select string with aliases, so `{ name: "full_name" }` becomes `name:full_name`. */
export function selectAs<T extends Record<string, string>>(columns: T, pick?: (keyof T)[]): string {
  const keys = (pick ?? (Object.keys(columns) as (keyof T)[])) as string[];
  return keys.map((k) => (columns[k] === k ? k : `${k}:${columns[k]}`)).join(", ");
}

/* Lead statuses. Order here is the order of the filter tabs and the status menu. */

export const leadStatuses = ["new", "contacted", "qualified", "in_progress", "won", "lost"] as const;
export type LeadStatus = (typeof leadStatuses)[number];

/** `className` styles the badge (its dot uses currentColor). `dot` is for menus and legends on plain backgrounds. */
export const leadStatusMeta: Record<LeadStatus, { label: string; className: string; dot: string }> = {
  // Brass for "new": it's the one that needs you. Teal family as it moves forward. Coral only for lost.
  new: { label: "New", className: "bg-brass-soft text-brass-ink", dot: "bg-brass" },
  contacted: { label: "Contacted", className: "bg-secondary text-secondary-foreground", dot: "bg-muted-foreground" },
  qualified: { label: "Qualified", className: "bg-sea-foam text-primary", dot: "bg-sea-glass" },
  in_progress: { label: "In progress", className: "bg-primary text-primary-foreground", dot: "bg-primary" },
  won: { label: "Won", className: "bg-positive-soft text-positive", dot: "bg-positive" },
  lost: { label: "Lost", className: "bg-negative-soft text-negative", dot: "bg-coral" },
};

export function isLeadStatus(v: unknown): v is LeadStatus {
  return typeof v === "string" && (leadStatuses as readonly string[]).includes(v);
}

/** Unknown statuses (old rows, typos) display as New rather than crashing. */
export function toLeadStatus(v: unknown): LeadStatus {
  if (isLeadStatus(v)) return v;
  if (typeof v === "string") {
    const k = v.trim().toLowerCase().replace(/[\s-]+/g, "_");
    if (isLeadStatus(k)) return k;
  }
  return "new";
}

export type LeadSource = "calendly" | "contact_form" | "other";

export function toLeadSource(v: unknown): LeadSource {
  const s = typeof v === "string" ? v.toLowerCase() : "";
  // "book" and "contact" are the site's message forms (the /book one sits under the calendar), not bookings.
  if (s === "book" || s === "contact") return "contact_form";
  if (s.includes("calendly") || s.includes("book")) return "calendly";
  if (s.includes("contact") || s.includes("form") || s.includes("message")) return "contact_form";
  return "other";
}

export const leadSourceLabel: Record<LeadSource, string> = {
  calendly: "Booked call",
  contact_form: "Message",
  other: "Other",
};

/* Clients */

export const clientStatuses = ["active", "paused", "churned"] as const;
export type ClientStatus = (typeof clientStatuses)[number];

export const clientStatusMeta: Record<ClientStatus, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-positive-soft text-positive" },
  paused: { label: "Paused", className: "bg-secondary text-secondary-foreground" },
  churned: { label: "Churned", className: "bg-muted text-muted-foreground" },
};

export function toClientStatus(v: unknown): ClientStatus {
  return typeof v === "string" && (clientStatuses as readonly string[]).includes(v) ? (v as ClientStatus) : "active";
}

/** Care plans are month to month. Build plans are the 12 month "pay monthly" packages. */
export type PlanKind = "care" | "build" | "other";
export const planKindLabel: Record<PlanKind, string> = { care: "Care plan", build: "Payment plan", other: "Plan" };

/** Stripe statuses that still mean "this client is on a plan". */
export const liveSubscriptionStatuses = ["active", "trialing", "past_due", "unpaid", "paused"] as const;
/** Statuses that still bring money in (or are owed). Feeds monthly value. */
export const billingSubscriptionStatuses = ["active", "trialing", "past_due"] as const;

export const projectStatuses = ["planning", "in_progress", "review", "done", "on_hold", "cancelled"] as const;
export type ProjectStatus = (typeof projectStatuses)[number];
export const projectStatusMeta: Record<ProjectStatus, { label: string; className: string }> = {
  planning: { label: "Planning", className: "bg-secondary text-secondary-foreground" },
  in_progress: { label: "In progress", className: "bg-primary text-primary-foreground" },
  review: { label: "In review", className: "bg-brass-soft text-brass-ink" },
  done: { label: "Launched", className: "bg-positive-soft text-positive" },
  on_hold: { label: "On hold", className: "bg-warning-soft text-warning" },
  cancelled: { label: "Cancelled", className: "bg-muted text-muted-foreground" },
};
export function toProjectStatus(v: unknown): ProjectStatus {
  return typeof v === "string" && (projectStatuses as readonly string[]).includes(v) ? (v as ProjectStatus) : "planning";
}

/** The four board columns, in order. on_hold gets its own lane only when something's in it; cancelled stays off the board. */
export const boardStatuses = ["planning", "in_progress", "review", "done"] as const;
export type BoardStatus = (typeof boardStatuses)[number];

/* Payment plans (one-off work paid in installments) */

export const installmentStatuses = ["pending", "invoiced", "paid", "void"] as const;
export type InstallmentStatus = (typeof installmentStatuses)[number];
export function toInstallmentStatus(v: unknown): InstallmentStatus {
  return typeof v === "string" && (installmentStatuses as readonly string[]).includes(v) ? (v as InstallmentStatus) : "pending";
}

/** How a hand-marked payment came in. "stripe" is set by the webhook, not picked by hand. */
export const paymentMethods = ["zelle", "cash", "check", "venmo", "other"] as const;
export type PaymentMethod = (typeof paymentMethods)[number] | "stripe";
export const paymentMethodLabel: Record<PaymentMethod, string> = {
  stripe: "Stripe",
  zelle: "Zelle",
  cash: "Cash",
  check: "Check",
  venmo: "Venmo",
  other: "Other",
};
