import { defineArrayMember, defineField, defineType } from "sanity";
import { TagsInput } from "../components/TagsInput";

export default defineType({
  name: "caseStudy",
  title: "Case Study",
    type: "document",
  icon: () => "📁",
  groups: [
    { name: "page", title: "Page sections" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    // ─── Core Info ───────────────────────────────────────────────
    defineField({
      name: "title",
      title: "Project Title",
      type: "string",
      description: "e.g. 'Lead System Overhaul for Tampa Roofing Co.'",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
    }),

    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      description: "Pin this to the top of the portfolio page.",
      initialValue: false,
    }),

    // ─── Client Info ─────────────────────────────────────────────
    defineField({
      name: "clientName",
      title: "Client Name",
      type: "string",
      description: "Business or individual name shown publicly.",
    }),

    defineField({
      name: "industry",
      title: "Industry / Niche",
      type: "string",
      description: "e.g. 'Roofing', 'E-commerce', 'Life Coaching'",
    }),

    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      description: "Main visual — mockup, screenshot, or workspace photo.",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt Text",
          type: "string",
        }),
      ],
    }),

    // ─── Summary ─────────────────────────────────────────────────
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      description:
        "Short summary shown on the portfolio grid. One sentence on the problem, one on the result.",
      validation: (Rule) => Rule.max(200),
    }),

    // ─── Case study page: hero ───────────────────────────────────
    defineField({
      name: "businessName",
      title: "Business name",
      type: "string",
      group: "page",
      description: "Shown on cards and above the headline, e.g. 'John R Clark & CO'.",
    }),
    defineField({ name: "location", title: "Location", type: "string", group: "page", description: "e.g. 'Tarpon Springs, FL'" }),
    defineField({
      name: "liveUrl",
      title: "Live website link",
      type: "url",
      group: "page",
      description:
        "Paste the full address of the finished site, e.g. 'https://johnrclark.com'. Adds a 'Visit the site' button at the top of the page. Leave blank if the site isn't live yet.",
      validation: (Rule) => Rule.uri({ scheme: ["http", "https"] }),
    }),
    defineField({
      name: "headline",
      title: "Headline",
      type: "string",
      group: "page",
      description: "The big line at the top. The story in one sentence, e.g. 'His estimate requests were vanishing. Now every one lands in his inbox.'",
      validation: (Rule) => Rule.max(120),
    }),
    defineField({
      name: "facts",
      title: "Quick facts",
      type: "array",
      group: "page",
      description: "Up to three, e.g. Location / Tarpon Springs, FL.",
      of: [
        defineArrayMember({
          type: "object",
          name: "fact",
          fields: [
            defineField({ name: "label", title: "Label", type: "string", validation: (Rule) => Rule.required() }),
            defineField({ name: "value", title: "Value", type: "string", validation: (Rule) => Rule.required() }),
          ],
          preview: { select: { title: "value", subtitle: "label" } },
        }),
      ],
      validation: (Rule) => Rule.max(3),
    }),
    defineField({
      name: "summary",
      title: "The 30-second version",
      type: "object",
      group: "page",
      fields: [
        defineField({ name: "problem", title: "Problem", type: "text", rows: 2 }),
        defineField({ name: "plan", title: "Plan", type: "text", rows: 2 }),
        defineField({ name: "result", title: "Result", type: "text", rows: 2 }),
      ],
    }),

    // ─── Service Used ────────────────────────────────────────────
    defineField({
      name: "service",
      title: "Service Delivered",
      type: "string",
      options: {
        list: [
          { title: "Starter Site", value: "starter_site" },
          { title: "Growth System", value: "growth_system" },
          { title: "Automation Setup", value: "automation_setup" },
          { title: "Lead Capture System", value: "lead_capture_system" },
          { title: "Custom Build", value: "custom_build" },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),

    // ─── References ──────────────────────────────────────────────
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "category" }] })],
    }),

    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "tag" }] })],
      components: { input: TagsInput },
    }),

    // ─── The Meat: Case Study Sections ───────────────────────────
    defineField({
      name: "problem",
      title: "The Problem",
      type: "array",
      description:
        "What was broken, missing, slow, or unclear before you stepped in? Shown when “Before and after” is empty.",
      of: [
        defineArrayMember({
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H3", value: "h3" },
            { title: "H4", value: "h4" },
          ],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
            ],
          },
        }),
      ],
    }),

    defineField({
      name: "solution",
      title: "The Solution",
      type: "array",
      description: "What strategy and approach did you implement? Shown when “Action plan” is empty.",
      of: [
        defineArrayMember({
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H3", value: "h3" },
            { title: "H4", value: "h4" },
          ],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
            ],
          },
        }),
      ],
    }),

    defineField({
      name: "systemBuilt",
      title: "System Built",
      type: "array",
      description:
        "What was actually constructed: stack, automation, integrations, tools. Shown when “Under the hood” is empty.",
      of: [
        defineArrayMember({
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H3", value: "h3" },
            { title: "H4", value: "h4" },
          ],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
            ],
          },
        }),
        defineArrayMember({ type: "image", options: { hotspot: true } }),
      ],
    }),

    // ─── Tech Stack ──────────────────────────────────────────────
    defineField({
      name: "techStack",
      title: "Tech Stack",
      type: "array",
      description: "Tools, platforms, and tech used. e.g. Next.js, n8n, Sanity, Stripe.",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
    }),

    // ─── Outcomes ─────────────────────────────────────────────────
    defineField({
      name: "outcomes",
      title: "Outcomes",
      type: "array",
      description:
        "Concrete results. Use real metrics when you have them, estimated impact when you don't.",
      of: [
        defineArrayMember({
          type: "object",
          name: "outcome",
          fields: [
            defineField({
              name: "metric",
              title: "Metric Label",
              type: "string",
              description: "e.g. 'Page Load Time', 'Lead Conversion Rate', 'Admin Hours Saved'",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "before",
              title: "Before",
              type: "string",
              description: "e.g. '6.2s', '1.4%', '12 hrs/week'",
            }),
            defineField({
              name: "after",
              title: "After",
              type: "string",
              description: "e.g. '1.1s', '4.8%', '2 hrs/week'",
            }),
            defineField({
              name: "delta",
              title: "Change / Impact",
              type: "string",
              description: "e.g. '82% faster', '3x more leads', 'Saved 10 hrs/week'",
            }),
            defineField({
              name: "isEstimated",
              title: "Estimated Result?",
              type: "boolean",
              description: "Flag if this is an estimate vs a tracked metric.",
              initialValue: false,
            }),
          ],
          preview: {
            select: {
              title: "metric",
              subtitle: "delta",
            },
          },
        }),
      ],
    }),

    // ─── Testimonial ─────────────────────────────────────────────
    defineField({
      name: "testimonial",
      title: "Client Testimonial",
      type: "object",
      description: "Optional. Real quote, real name, real business.",
      fields: [
        defineField({
          name: "quote",
          title: "Quote",
          type: "text",
          rows: 4,
        }),
        defineField({
          name: "authorName",
          title: "Author Name",
          type: "string",
        }),
        defineField({
          name: "authorBusiness",
          title: "Business Name",
          type: "string",
        }),
        defineField({
          name: "authorPhoto",
          title: "Author Photo",
          type: "image",
          options: { hotspot: true },
        }),
      ],
    }),

    // ─── Gallery ─────────────────────────────────────────────────
    defineField({
      name: "gallery",
      title: "Project Gallery",
      type: "array",
      description: "Screenshots, mockups, before/after — keep it relevant.",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alt Text",
              type: "string",
            }),
            defineField({
              name: "caption",
              title: "Caption",
              type: "string",
            }),
          ],
        }),
      ],
    }),

    // ─── Case study page: problem ────────────────────────────────
    // When these are empty the page shows the rich text fields above instead.
    defineField({
      name: "problemHeading",
      title: "Problem heading",
      type: "string",
      group: "page",
      description: "e.g. 'Great work, invisible website'",
    }),
    defineField({
      name: "beforeAfter",
      title: "Before and after",
      type: "array",
      group: "page",
      description: "Same things, broken then fixed. Visitors flip between the two. Replaces “The Problem” text on the page.",
      of: [
        defineArrayMember({
          type: "object",
          name: "beforeAfterRow",
          fields: [
            defineField({ name: "label", title: "What", type: "string", description: "e.g. 'Estimate form'", validation: (Rule) => Rule.required() }),
            defineField({ name: "before", title: "Before", type: "string" }),
            defineField({ name: "after", title: "After", type: "string" }),
          ],
          preview: { select: { title: "label", subtitle: "after" } },
        }),
      ],
    }),
    defineField({
      name: "beforeImage",
      title: "Before screenshot",
      type: "image",
      group: "page",
      description: "A phone screenshot of the old site.",
      fields: [defineField({ name: "alt", title: "Alt Text", type: "string" })],
    }),
    defineField({
      name: "afterImage",
      title: "After screenshot",
      type: "image",
      group: "page",
      description: "A phone screenshot of the new site.",
      fields: [defineField({ name: "alt", title: "Alt Text", type: "string" })],
    }),

    // ─── Case study page: plan ───────────────────────────────────
    defineField({
      name: "steps",
      title: "Action plan",
      type: "array",
      group: "page",
      description: "The moves, in order. Replaces “The Solution” text on the page.",
      of: [
        defineArrayMember({
          type: "object",
          name: "planStep",
          fields: [
            defineField({ name: "title", title: "Step", type: "string", validation: (Rule) => Rule.required() }),
            defineField({ name: "short", title: "One-line summary", type: "string" }),
            defineField({ name: "did", title: "What I did", type: "text", rows: 3 }),
            defineField({ name: "why", title: "Why it matters to them", type: "text", rows: 3 }),
          ],
          preview: { select: { title: "title", subtitle: "short" } },
        }),
      ],
    }),

    // ─── Case study page: results ────────────────────────────────
    defineField({
      name: "results",
      title: "Result tiles",
      type: "array",
      group: "page",
      description: "Big numbers. Real ones only: leave a tile out rather than guess.",
      of: [
        defineArrayMember({
          type: "object",
          name: "resultTile",
          fields: [
            defineField({ name: "label", title: "Label", type: "string", validation: (Rule) => Rule.required() }),
            defineField({ name: "value", title: "Value", type: "string", description: "e.g. '23' or 'Fixed'", validation: (Rule) => Rule.required() }),
            defineField({ name: "note", title: "Note", type: "string" }),
            defineField({ name: "highlight", title: "Highlight (teal tile)", type: "boolean", initialValue: false }),
          ],
          preview: { select: { title: "value", subtitle: "label" } },
        }),
      ],
    }),
    defineField({
      name: "resultsChart",
      title: "Results chart",
      type: "object",
      group: "page",
      description: "Optional bar chart, e.g. estimate requests a month, before and after.",
      fields: [
        defineField({ name: "title", title: "Title", type: "string" }),
        defineField({ name: "note", title: "Note", type: "string", description: "e.g. 'From Google Analytics'" }),
        defineField({
          name: "points",
          title: "Bars",
          type: "array",
          of: [
            defineArrayMember({
              type: "object",
              name: "chartPoint",
              fields: [
                defineField({ name: "label", title: "Label", type: "string", description: "e.g. 'Mar'", validation: (Rule) => Rule.required() }),
                defineField({ name: "value", title: "Value", type: "number", validation: (Rule) => Rule.required().min(0) }),
                defineField({ name: "after", title: "After the work", type: "boolean", initialValue: false }),
              ],
              preview: { select: { title: "label", subtitle: "value" } },
            }),
          ],
        }),
      ],
    }),

    // ─── Case study page: takeaways ──────────────────────────────
    defineField({
      name: "takeaways",
      title: "Steal this for your business",
      type: "array",
      group: "page",
      description: "Things a reader can do this week.",
      of: [
        defineArrayMember({
          type: "object",
          name: "takeaway",
          fields: [
            defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
            defineField({ name: "text", title: "Text", type: "text", rows: 2 }),
          ],
          preview: { select: { title: "title", subtitle: "text" } },
        }),
      ],
      validation: (Rule) => Rule.max(3),
    }),
    defineField({
      name: "underTheHood",
      title: "For your web person: under the hood",
      type: "array",
      group: "page",
      description: "Short technical notes. Replaces “System Built” text on the page.",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "relatedPosts",
      title: "Related guides",
      type: "array",
      group: "page",
      description: "Up to three posts. Empty slots fill with the newest posts.",
      of: [defineArrayMember({ type: "reference", to: [{ type: "post" }] })],
      validation: (Rule) => Rule.max(3),
    }),

    // ─── SEO ─────────────────────────────────────────────────────
    defineField({
      name: "seo",
      title: "SEO",
      type: "object",
      group: "seo",
      fields: [
        defineField({
          name: "metaTitle",
          title: "Meta Title",
          type: "string",
          validation: (Rule) => Rule.max(60),
        }),
        defineField({
          name: "metaDescription",
          title: "Meta Description",
          type: "text",
          rows: 3,
          validation: (Rule) => Rule.max(160),
        }),
      ],
    }),
  ],

  preview: {
    select: {
      title: "title",
      subtitle: "clientName",
      business: "businessName",
      media: "coverImage",
    },
    prepare({ title, subtitle, business, media }) {
      return {
        title: business || title,
        subtitle: subtitle ? `Client: ${subtitle}` : "No client name",
        media,
      };
    },
  },

  orderings: [
    {
      title: "Published Date, Newest First",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
    {
      title: "Featured First",
      name: "featuredFirst",
      by: [
        { field: "featured", direction: "desc" },
        { field: "publishedAt", direction: "desc" },
      ],
    },
  ],
});