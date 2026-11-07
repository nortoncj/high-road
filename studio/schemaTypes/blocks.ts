import { defineArrayMember, defineField, defineType } from "sanity";

/** A linked card inside a post body. Renders as components/blog/Callout.tsx. */
export const calloutCard = defineType({
  name: "calloutCard",
  title: "Callout card",
  type: "object",
  icon: () => "🔗",
  fields: [
    defineField({
      name: "target",
      title: "Link to",
      type: "reference",
      to: [{ type: "caseStudy" }, { type: "post" }],
      description: "Pick a case study or post. Its title, summary and image fill anything you leave blank below.",
    }),
    defineField({
      name: "href",
      title: "Or a link",
      type: "string",
      description: "Only when nothing is picked above. A page on this site (/work#own-system) or a full https:// URL.",
      hidden: ({ parent }) => Boolean((parent as { target?: unknown } | undefined)?.target),
    }),
    defineField({ name: "kicker", title: "Label", type: "string", initialValue: "Case study" }),
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({ name: "text", title: "Summary", type: "text", rows: 3 }),
    defineField({
      name: "linkLabel",
      title: "Link text",
      type: "string",
      description: "Defaults to “Read the case study” or “Read the post”.",
    }),
    defineField({ name: "image", title: "Image", type: "image", options: { hotspot: true } }),
  ],
  validation: (rule) =>
    rule.custom((value: { target?: unknown; href?: string } | undefined) =>
      value?.target || value?.href?.trim() ? true : "Pick a case study or post, or add a link.",
    ),
  preview: {
    select: { title: "title", targetTitle: "target.title", kicker: "kicker", media: "image" },
    prepare({ title, targetTitle, kicker, media }) {
      return { title: title || targetTitle || "Callout card", subtitle: kicker || "Case study", media };
    },
  },
});

/** "Tick these off this week." Renders as components/blog/Checklist.tsx, ticks saved in the reader's browser. */
export const checklist = defineType({
  name: "checklist",
  title: "Checklist",
  type: "object",
  icon: () => "✅",
  fields: [
    defineField({ name: "eyebrow", title: "Label", type: "string", initialValue: "Your to-do list" }),
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      initialValue: "Tick these off this week",
      description: "Also shows in the post's “On this page” list.",
    }),
    defineField({
      name: "items",
      title: "Items",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      validation: (rule) => rule.required().min(1).max(12),
    }),
    defineField({ name: "doneMessage", title: "Message when everything is ticked", type: "string" }),
  ],
  preview: {
    select: { title: "heading", items: "items" },
    prepare({ title, items }) {
      const n = Array.isArray(items) ? items.length : 0;
      return { title: title || "Checklist", subtitle: `${n} item${n === 1 ? "" : "s"}` };
    },
  },
});
