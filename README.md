This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# high-road

## Planned: client reports (`/admin/reports`)

Not built yet. `/admin/reports` is still a "coming soon" placeholder. The plan is the monthly report Growth plan clients get ("visits, calls and leads", see `content/pricing.ts`). Reports cover each **client's** site, not webtechninjas.com.

### Data sources

| Source | Role | Cost | Notes |
| --- | --- | --- | --- |
| GA4 | Visits, traffic sources, top pages, click-to-call events | Free | One Google service account, added to every client's GA4 property |
| Google Search Console | Search queries, impressions, clicks, average position | Free | Data runs 2–3 days behind. Fine for monthly reports |
| Google Business Profile Performance API | Calls, direction requests and website clicks from the Google listing | Free | **Needs API access approval from Google. Apply early.** Big for local service clients |
| Own lead capture | Exact form leads with the actual messages | Free | Client site forms save to our Supabase with `client_id`, same as our own contact form (`submitLead`) |
| CallRail | Real call tracking | Paid per client | **Add-on, not default.** Most clients get click-to-call taps from GA4 instead. Use tracking numbers on the website only and keep the real number on the Business Profile so listing details stay consistent |
| Microsoft Clarity | Heatmaps and session recordings | Free | Install on every site for our own diagnostics. **Not a report source** (its export API only covers the last few days) |

### How it fits together

1. Store per-client IDs on the client record: GA4 property ID, Search Console site URL, Business Profile location ID, and optionally a CallRail account.
2. A monthly job pulls each source and saves a snapshot to Supabase. Reports load fast, stay the same if Google revises its numbers later, and stay well within API limits.
3. Admin report page per client and month, with month-over-month comparisons, built from the snapshots.
4. One-click PDF to send the client.

### Setup checklist per new Growth client

- [ ] Add our service account to their GA4 property (Viewer)
- [ ] Add our service account to their Search Console property
- [ ] Get access to their Google Business Profile location
- [ ] Track click-to-call taps and form submits as GA4 events
- [ ] Point their site's forms at our lead capture with their `client_id`
- [ ] Install Clarity
- [ ] (If calls are their main channel) set up CallRail
