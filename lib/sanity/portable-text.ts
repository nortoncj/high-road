import type { PortableTextBlock } from "@portabletext/react";
import type { ChecklistBlock, PostBodyBlock } from "./types";

type Span = { _type?: string; text?: string };

/** Plain text of a block, or "" for anything that isn't a text block. */
export function blockText(block: PostBodyBlock | PortableTextBlock): string {
  if (block._type !== "block" || !("children" in block) || !Array.isArray(block.children)) return "";
  return (block.children as Span[]).map((c) => c.text ?? "").join("");
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "section";

export type TocItem = { id: string; label: string };

const isChecklist = (b: PostBodyBlock): b is ChecklistBlock => b._type === "checklist";

/**
 * Anchors for the "On this page" list: every H1/H2 (H1s render as H2, the page title is the only H1)
 * plus checklist blocks. Returns the ids by block _key so the renderer uses the same ones.
 */
export function buildToc(body: PostBodyBlock[] | null | undefined, checklistFallback: string) {
  const items: TocItem[] = [];
  const ids = new Map<string, string>();
  const used = new Set<string>();

  const add = (key: string, label: string) => {
    let id = slugify(label);
    for (let n = 2; used.has(id); n++) id = `${slugify(label)}-${n}`;
    used.add(id);
    ids.set(key, id);
    items.push({ id, label });
  };

  for (const block of body ?? []) {
    if (block._type === "block" && "style" in block && (block.style === "h2" || block.style === "h1")) {
      const label = blockText(block).trim();
      if (label) add(block._key ?? label, label);
    } else if (isChecklist(block)) {
      add(block._key, block.heading?.trim() || checklistFallback);
    }
  }
  return { items, ids };
}

/** Rough reading time from every string in the value. Used where GROQ can't count it for us. */
export function readMinutes(...values: unknown[]): number {
  let chars = 0;
  const walk = (v: unknown) => {
    if (typeof v === "string") chars += v.length;
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") {
      for (const [k, x] of Object.entries(v)) if (!k.startsWith("_") && k !== "asset" && k !== "lqip") walk(x);
    }
  };
  values.forEach(walk);
  return Math.max(1, Math.round(chars / 5 / 220));
}
