export const LEAD_STATUSES = ["new", "contacted", "booked", "won", "lost"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  booked: "Booked a call",
  won: "Won",
  lost: "Lost",
};

export type Lead = {
  id: string;
  created_at: string;
  name: string;
  contact_method: "email" | "phone";
  email: string | null;
  phone: string | null;
  website: string | null;
  message: string;
  source: "contact" | "book";
  status: LeadStatus;
  email_sent: boolean;
};
