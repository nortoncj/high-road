# WebTech Ninjas Studio

Sanity Studio for the blog (`/blog`), industries (`/industries`) and case studies (`/work/[slug]`).
It's a separate project from the Next.js site, so the site's build on the server never installs or bundles it.

## Run it

```bash
cd studio
cp .env.example .env     # same project ID and dataset as the site's NEXT_PUBLIC_SANITY_* vars
npm install
npm run dev              # http://localhost:3333
```

`npm run deploy` publishes it to `<name>.sanity.studio` so you can edit from anywhere.
The first deploy asks you to pick the name.

## Seed

`npm run seed` loads the wireframe content: 5 categories, the contact form post, 12 industries and
the John R Clark page sections, plus 8 draft posts. It only creates what's missing and only fills
empty case study fields, so it's safe to run again. It uses your `npx sanity login`.

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
| Industries | `/industries`. Link a case study to make the card point at it and set the case study's breadcrumb. |
| Categories | The topic chips on `/blog`. A post's first category is its topic. |
