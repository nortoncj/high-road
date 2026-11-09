# WebTech Ninjas Studio

Sanity Studio for the blog (`/blog`), industries (`/industries`, `/industries/[slug]`) and case studies (`/work/[slug]`).
It runs inside the admin at `/admin/content` (Content in the sidebar), so it's behind the admin sign-in.
You also sign in to Sanity the first time you open it.

- Config: `sanity.config.ts` at the project root. Schemas: `sanity/schemaTypes`. Sidebar: `sanity/structure.ts`.
- Project ID and dataset come from `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET`, same as the site.
- Each origin you open it from needs to be in sanity.io/manage → API → CORS origins with "Allow credentials" on:
  `http://localhost:3000` and `https://www.webtechninjas.com`.

## Seed

`npm run sanity:seed` loads the wireframe content: 5 categories, the contact form post, 12 industries with
starter page copy (`seed/industry-pages.ts`) and the John R Clark page sections, plus 8 draft posts.
It only creates what's missing and only fills empty fields, so it's safe to run again. It uses your `npx sanity login`.

## Publishing updates the site

Pages are cached for up to an hour. To show changes right after you publish, add a webhook at
sanity.io/manage → API → Webhooks:

- URL: `https://www.webtechninjas.com/api/sanity/revalidate`, method POST
- Filter: `_type in ["post", "caseStudy", "industry", "category", "tag"]`
- Trigger on create, update and delete
- Secret: the same value as `SANITY_REVALIDATE_SECRET` in the site's `.env.production`

## Where things show up

| Studio | Site |
| --- | --- |
| Blog posts | `/blog`, `/blog/<slug>`. "Featured" puts a post in the big card at the top. Callout cards and checklists can go in the body. |
| Case studies | `/work/<slug>`. Fill the "Page sections" tab for the full layout; older case studies fall back to the Problem, Solution and System Built text. |
| Industries | The card on `/industries` (Card tab) and the page at `/industries/<slug>` (Page tab): headline, numbers with sources, problems, solutions, questions and the closing call to action. Case studies in the Proof tab show on the page and set each case study's breadcrumb. With none, the page shows recent work from other industries. |
| Categories | The topic chips on `/blog`. A post's first category is its topic. |
