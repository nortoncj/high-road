import { defineArrayMember, defineField, defineType } from "sanity";

/** One industry: its card on /industries and its own page at /industries/<slug>. */
export default defineType({
  name: "industry",
  title: "Industry",
  type: "document",
  icon: () => "🧰",
  groups: [
    { name: "card", title: "Card", default: true },
    { name: "page", title: "Page" },
    { name: "proof", title: "Proof" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    /* ---------- Card on /industries ---------- */
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      group: "card",
      description: "e.g. 'Contractors and remodelers'",
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "card",
      options: { source: "name", maxLength: 60 },
      description: "The page lives at /industries/<slug>.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "line",
      title: "One line",
      type: "text",
      rows: 2,
      group: "card",
      description: "What the site does for this kind of business. One sentence. Also the page intro if that's blank.",
      validation: (rule) => rule.max(160),
    }),
    defineField({
      name: "group",
      title: "Group",
      type: "string",
      group: "card",
      description: "Which filter chip it sits under.",
      options: {
        list: [
          { title: "Home services", value: "home" },
          { title: "Builders and makers", value: "makers" },
          { title: "Food and retail", value: "food" },
          { title: "Care and services", value: "care" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      group: "card",
      options: { hotspot: true },
      description: "Square-ish works best. Shown 4:3 on the card and beside the page headline.",
    }),
    defineField({
      name: "clientWork",
      title: "I've built for this industry",
      type: "boolean",
      group: "card",
      description: "Adds the “Client work” badge and puts it under the Client work filter.",
      initialValue: false,
    }),
    defineField({
      name: "sortOrder",
      title: "Order",
      type: "number",
      group: "card",
      description: "Lower numbers show first.",
    }),

    /* ---------- The page ---------- */
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      group: "page",
      description: "Small label over the headline. Blank shows “Websites for <name>”.",
      validation: (rule) => rule.max(70),
    }),
    defineField({
      name: "headline",
      title: "Headline",
      type: "string",
      group: "page",
      description: "Say what they want, in their words. e.g. “Book the emergency call before they try the next company”",
      validation: (rule) => rule.max(110),
    }),
    defineField({
      name: "intro",
      title: "Intro",
      type: "text",
      rows: 3,
      group: "page",
      description: "Two or three sentences under the headline.",
      validation: (rule) => rule.max(320),
    }),
    defineField({
      name: "stats",
      title: "Numbers they care about",
      type: "array",
      group: "page",
      description: "Two to four numbers this kind of owner cares about. Always cite where a number came from.",
      of: [
        defineArrayMember({
          type: "object",
          name: "industryStat",
          fields: [
            defineField({ name: "value", title: "Number", type: "string", description: "e.g. 76% or 7×", validation: (rule) => rule.required().max(12) }),
            defineField({ name: "label", title: "What it means", type: "string", validation: (rule) => rule.required().max(140) }),
            defineField({
              name: "source",
              title: "Source",
              type: "string",
              description: "e.g. Harvard Business Review, 2011",
              validation: (rule) => rule.warning("Add a source so owners can trust the number."),
            }),
            defineField({ name: "sourceUrl", title: "Source link", type: "url" }),
          ],
          preview: { select: { title: "value", subtitle: "label" } },
        }),
      ],
      validation: (rule) => rule.max(4),
    }),
    defineField({
      name: "problemsHeading",
      title: "Problems heading",
      type: "string",
      group: "page",
      description: "Blank shows “Sound familiar?”",
    }),
    defineField({
      name: "problems",
      title: "Problems",
      type: "array",
      group: "page",
      description: "What keeps them up at night, said the way they'd say it. Three works best.",
      of: [
        defineArrayMember({
          type: "object",
          name: "industryProblem",
          fields: [
            defineField({ name: "title", title: "Problem", type: "string", validation: (rule) => rule.required().max(90) }),
            defineField({ name: "body", title: "Detail", type: "text", rows: 3, validation: (rule) => rule.max(280) }),
          ],
          preview: { select: { title: "title", subtitle: "body" } },
        }),
      ],
      validation: (rule) => rule.max(6),
    }),
    defineField({
      name: "solutionsHeading",
      title: "Solutions heading",
      type: "string",
      group: "page",
      description: "Blank shows “What I build for <name>”.",
    }),
    defineField({
      name: "solutions",
      title: "Solutions",
      type: "array",
      group: "page",
      description: "What you build, and what it means for their day.",
      of: [
        defineArrayMember({
          type: "object",
          name: "industrySolution",
          fields: [
            defineField({ name: "title", title: "What you build", type: "string", validation: (rule) => rule.required().max(90) }),
            defineField({ name: "body", title: "What it means for them", type: "text", rows: 3, validation: (rule) => rule.max(280) }),
            defineField({
              name: "points",
              title: "Included",
              type: "array",
              of: [defineArrayMember({ type: "string" })],
              description: "Optional short list, e.g. “Text alert for every new lead”.",
              validation: (rule) => rule.max(4),
            }),
          ],
          preview: { select: { title: "title", subtitle: "body" } },
        }),
      ],
      validation: (rule) => rule.max(6),
    }),
    defineField({
      name: "faqs",
      title: "Questions",
      type: "array",
      group: "page",
      description: "Questions this kind of owner asks before hiring you. Also shown to Google.",
      of: [
        defineArrayMember({
          type: "object",
          name: "industryFaq",
          fields: [
            defineField({ name: "question", title: "Question", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "answer", title: "Answer", type: "text", rows: 4, validation: (rule) => rule.required() }),
          ],
          preview: { select: { title: "question", subtitle: "answer" } },
        }),
      ],
    }),
    defineField({
      name: "cta",
      title: "Call to action",
      type: "object",
      group: "page",
      description: "The band at the bottom. Blank fields use the site default.",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: "heading", title: "Heading", type: "string" }),
        defineField({ name: "body", title: "Text", type: "text", rows: 2 }),
        defineField({ name: "secondaryLabel", title: "Second button label", type: "string", description: "Blank shows “See pricing”." }),
        defineField({ name: "secondaryHref", title: "Second button link", type: "string", description: "A page on this site, e.g. /services" }),
      ],
    }),

    /* ---------- Proof ---------- */
    defineField({
      name: "caseStudies",
      title: "Case studies",
      type: "array",
      group: "proof",
      of: [defineArrayMember({ type: "reference", to: [{ type: "caseStudy" }] })],
      description:
        "Shown as proof on the page, in this order. Also sets the breadcrumb on each case study. With none, the page shows recent work from other industries.",
    }),

    /* ---------- SEO ---------- */
    defineField({
      name: "seo",
      title: "SEO",
      type: "object",
      group: "seo",
      fields: [
        defineField({
          name: "title",
          title: "Title",
          type: "string",
          description: "Blank shows “<Name> website design”.",
          validation: (rule) => rule.max(70),
        }),
        defineField({
          name: "description",
          title: "Description",
          type: "text",
          rows: 3,
          description: "Blank uses the intro.",
          validation: (rule) => rule.max(170),
        }),
      ],
    }),
  ],
  orderings: [{ title: "Order", name: "sortOrderAsc", by: [{ field: "sortOrder", direction: "asc" }] }],
  preview: {
    select: { title: "name", subtitle: "headline", line: "line", media: "image", client: "clientWork" },
    prepare({ title, subtitle, line, media, client }) {
      return { title: client ? `${title} ✓` : title, subtitle: subtitle || line, media };
    },
  },
});
