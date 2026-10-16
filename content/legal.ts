// Shared shapes for legal pages (privacy now, terms later).

export type LegalBlock =
  | { type: "p"; text: string }
  | { type: "callout"; text: string }
  | { type: "list"; lead?: string; items: string[]; ordered?: boolean }
  | { type: "table"; caption: string; columns: string[]; rows: string[][] }
  /** Renders the contact card passed to LegalPage. */
  | { type: "contact" };

export type LegalSection = {
  id: string;
  title: string;
  /** Dev-only notes: lawyer checks and things to confirm. Never shown in production. */
  review?: string[];
  blocks: LegalBlock[];
};
