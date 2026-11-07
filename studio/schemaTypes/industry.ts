import { defineArrayMember, defineField, defineType } from "sanity";

/** One card on /industries. */
export default defineType({
  name: "industry",
  title: "Industry",
  type: "document",
  icon: () => "🧰",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      description: "e.g. 'Contractors and remodelers'",
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 60 },
      description: "Used as the card's anchor: /industries#slug",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "line",
      title: "One line",
      type: "text",
      rows: 2,
      description: "What the site does for this kind of business. One sentence.",
      validation: (rule) => rule.max(160),
    }),
    defineField({
      name: "group",
      title: "Group",
      type: "string",
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
      options: { hotspot: true },
      description: "Square-ish works best. Shown 4:3 on the card.",
    }),
    defineField({
      name: "clientWork",
      title: "I've built for this industry",
      type: "boolean",
      description: "Adds the “Client work” badge and puts it under the Client work filter.",
      initialValue: false,
    }),
    defineField({
      name: "caseStudies",
      title: "Case studies",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "caseStudy" }] })],
      description: "The first one is where the card links. Also sets the breadcrumb on the case study page.",
    }),
    defineField({
      name: "href",
      title: "Link (when there's no case study)",
      type: "string",
      description: "A page on this site, e.g. /work#high-tyde. Leave blank to link to /services.",
    }),
    defineField({
      name: "sortOrder",
      title: "Order",
      type: "number",
      description: "Lower numbers show first.",
    }),
  ],
  orderings: [{ title: "Order", name: "sortOrderAsc", by: [{ field: "sortOrder", direction: "asc" }] }],
  preview: {
    select: { title: "name", subtitle: "line", media: "image", client: "clientWork" },
    prepare({ title, subtitle, media, client }) {
      return { title: client ? `${title} ✓` : title, subtitle, media };
    },
  },
});
