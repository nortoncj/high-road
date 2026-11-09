/**
 * Loads the blog, the industries and the John R Clark case study page from the site wireframes.
 *
 *   npm run sanity:seed        (uses your `npx sanity login`)
 *
 * Safe to run twice. It only creates documents that don't exist yet, and only fills case study
 * fields that are empty, so nothing you've edited in the Studio gets overwritten.
 *
 * Published: 5 categories, the contact form post, 12 industries with their page copy (see
 *            ./industry-pages.ts), the John R Clark page sections.
 * Drafts:    8 posts that only have a title and summary so far. Write them, then publish.
 */
import { createReadStream } from "node:fs";
import { resolve } from "node:path";
import { getCliClient } from "sanity/cli";
import { INDUSTRY_PAGES, statFor } from "./industry-pages";

// "raw" so the existence checks below see drafts too; newer API versions hide them by default.
const client = getCliClient({ apiVersion: "2026-10-01", perspective: "raw" });

// Run from the project root (npm run sanity:seed does that).
const imagesDir = resolve(process.cwd(), "sanity/seed/images");
const publicDir = resolve(process.cwd(), "public");

/* ---------- Helpers ---------- */

let keyCount = 0;
const key = () => `seed${(keyCount++).toString(36).padStart(4, "0")}`;

type Span = { _type: "span"; _key: string; text: string; marks: string[] };
const span = (text: string, marks: string[] = []): Span => ({ _type: "span", _key: key(), text, marks });
const block = (style: string, children: Span[], extra: Record<string, unknown> = {}) => ({
  _type: "block",
  _key: key(),
  style,
  markDefs: [],
  children,
  ...extra,
});
const p = (text: string) => block("normal", [span(text)]);
const h2 = (text: string) => block("h2", [span(text)]);
const quote = (text: string) => block("blockquote", [span(text)]);
const numbered = (text: string) => block("normal", [span(text)], { listItem: "number", level: 1 });
/** Bullet with a bold lead-in: "Send through a real email service. Your form should..." */
const bullet = (lead: string, text: string) => block("normal", [span(lead, ["strong"]), span(` ${text}`)], { listItem: "bullet", level: 1 });

const ref = (id: string) => ({ _type: "reference", _ref: id });
const keyedRef = (id: string) => ({ _key: key(), ...ref(id) });
const image = (assetId: string, alt?: string) => ({ _type: "image", asset: ref(assetId), ...(alt ? { alt } : {}) });

async function upload(path: string, filename: string) {
  // Sanity stores each file once by its content hash, so re-running returns the same asset.
  const asset = await client.assets.upload("image", createReadStream(path), { filename });
  return asset._id;
}

/* ---------- Content from the wireframes ---------- */

const CATEGORIES = [
  { id: "getting-leads", title: "Getting leads" },
  { id: "local-search", title: "Local search" },
  { id: "speed-and-tech", title: "Speed and tech" },
  { id: "behind-the-build", title: "Behind the build" },
  { id: "pricing", title: "Pricing" },
];

const CASE_STUDY_SLUGS = {
  johnClark: "john-r-clark-handyman-website-development",
  butcherBlock: "butcher-block-guy-custom-countertops-website",
  casaDeLaPaz: "casa-de-la-paz-independent-living-website",
  lachelle: "lachelle-travels-adventures-website-development",
  uncontained: "tiny-home-and-storage-units",
};

type Stub = { id: string; title: string; excerpt: string; category: string; image?: string; alt?: string; featured?: boolean; format?: string };

const DRAFT_POSTS: Stub[] = [
  {
    id: "lead-system",
    title: "How I built a lead system that texts me before the customer hangs up",
    excerpt: "A form that saves every lead, emails me in seconds and drops it into a private dashboard. The whole setup, what broke, and what it costs to run.",
    category: "behind-the-build",
    image: "post-lead-system.webp",
    alt: "Faceted illustration of a lead flowing from a form to a database",
    featured: true,
    format: "story",
  },
  {
    id: "google-business-profile",
    title: "Google Business Profile: the free listing doing more work than your website",
    excerpt: "A lot of local customers call you straight from Maps. Here's what to fill out first.",
    category: "local-search",
    image: "post-local.webp",
    alt: "Faceted illustration of a map pin over a local map",
    format: "guide",
  },
  {
    id: "slow-on-a-phone",
    title: "Why your website feels slow on a phone, and what to fix first",
    excerpt: "Big images and too many plugins are the usual suspects. A plain English checklist you can hand to anyone.",
    category: "speed-and-tech",
    image: "post-speed.webp",
    alt: "Faceted illustration of a lightning bolt on a browser window",
    format: "checklist",
  },
  {
    id: "what-a-website-gets-you",
    title: "What a $1,500 website actually gets you",
    excerpt: "Where the money goes, what's worth paying for, and what you can skip when you're starting out.",
    category: "pricing",
  },
  {
    id: "wordpress-or-custom",
    title: "WordPress or custom code? How I decide for each client",
    excerpt: "It comes down to one question: who's going to edit the site after launch.",
    category: "behind-the-build",
    format: "opinion",
  },
  {
    id: "click-to-call",
    title: "Click-to-call done right: stop making customers hunt for your number",
    excerpt: "Most people find you on a phone. One tap should reach you from every page.",
    category: "getting-leads",
    image: "post-leads.webp",
    alt: "Faceted illustration of a phone receiving new lead messages",
    format: "guide",
  },
  {
    id: "service-area-pages",
    title: "Service area pages: how to show up in the next town over",
    excerpt: "One page per city, written for that city, not copy and paste. Here's the template I use.",
    category: "local-search",
    image: "post-local.webp",
    alt: "Faceted illustration of a map pin over a local map",
    format: "guide",
  },
  {
    id: "pay-monthly",
    title: "Should you pay monthly for a website?",
    excerpt: "It spreads the cost out. Read the fine print on who owns the site before you sign.",
    category: "pricing",
  },
];

const INDUSTRIES: {
  id: string;
  name: string;
  group: "home" | "makers" | "food" | "care";
  line: string;
  image?: string;
  clientWork?: boolean;
  caseStudy?: keyof typeof CASE_STUDY_SLUGS;
}[] = [
  { id: "contractors-and-remodelers", name: "Contractors and remodelers", group: "home", clientWork: true, caseStudy: "johnClark", image: "industry-remodeling.webp", line: "Project galleries and estimate forms that show off the work before you ever quote it." },
  { id: "custom-woodworking", name: "Custom woodworking", group: "makers", clientWork: true, caseStudy: "butcherBlock", image: "industry-woodworking.webp", line: "A gallery that sells the craft, and that you can update from your phone in a minute." },
  { id: "restaurants-and-pop-ups", name: "Restaurants and pop-ups", group: "food", clientWork: true, image: "industry-restaurants.webp", line: "Menus, hours and this week's location, right where hungry people look first." },
  { id: "senior-living-and-home-care", name: "Senior living and home care", group: "care", clientWork: true, caseStudy: "casaDeLaPaz", image: "industry-senior-care.webp", line: "Warm, easy-to-read sites that help families trust you before they ever visit." },
  { id: "tiny-homes-and-containers", name: "Tiny homes and containers", group: "makers", clientWork: true, caseStudy: "uncontained", image: "industry-tiny-homes.webp", line: "Floor plans, price ranges and quote requests for buyers doing serious research." },
  { id: "travel-and-professional-services", name: "Travel and professional services", group: "care", clientWork: true, caseStudy: "lachelle", image: "industry-travel.webp", line: "Booked consultations and trust signals for businesses that sell their expertise." },
  { id: "hvac", name: "HVAC", group: "home", image: "industry-hvac.webp", line: "Catch the emergency call on the hottest day of the year, before they try the next company." },
  { id: "plumbing", name: "Plumbing", group: "home", line: "When a pipe bursts, people call whoever shows up first on their phone. Make that you." },
  { id: "roofing", name: "Roofing", group: "home", image: "industry-roofing.webp", line: "Quote forms that sort real jobs from tire kickers when storm season hits." },
  { id: "cleaning-services", name: "Cleaning services", group: "home", line: "Online booking for recurring clients, so you stop playing phone tag to fill the week." },
  { id: "landscaping-and-lawn-care", name: "Landscaping and lawn care", group: "home", line: "Service area pages that win the neighborhoods you actually want to drive to." },
  { id: "retail-shops", name: "Retail shops", group: "food", line: "Hours, directions and what's in stock, so browsers turn into walk-ins." },
];

/* ---------- Run ---------- */

async function main() {
  const { projectId, dataset } = client.config();
  console.log(`Seeding ${projectId} / ${dataset}`);

  // Existing case studies, looked up by slug so this works on any copy of the dataset.
  const studies = await client.fetch<{ _id: string; slug: string }[]>(
    `*[_type == "caseStudy" && slug.current in $slugs && !(_id in path("drafts.**"))]{ _id, "slug": slug.current }`,
    { slugs: Object.values(CASE_STUDY_SLUGS) },
  );
  const studyId = (k: keyof typeof CASE_STUDY_SLUGS) => studies.find((s) => s.slug === CASE_STUDY_SLUGS[k])?._id;
  const johnClark = studyId("johnClark");

  console.log("Uploading images…");
  const files = [...new Set([...DRAFT_POSTS.map((s) => s.image), ...INDUSTRIES.map((i) => i.image), "post-leads.webp", "post-lead-system.webp"])].filter(
    (f): f is string => Boolean(f),
  );
  const assets: Record<string, string> = {};
  for (const f of files) assets[f] = await upload(resolve(imagesDir, f), f);
  const johnClarkPhone = await upload(resolve(publicDir, "assets/img/work/john-clark-mobile.webp"), "john-clark-mobile.webp");

  const tx = client.transaction();

  for (const c of CATEGORIES) {
    tx.createIfNotExists({ _id: `category-${c.id}`, _type: "category", title: c.title, slug: { _type: "slug", current: c.id } });
  }

  // The one post the wireframes wrote in full.
  const contactPostId = "post-contact-form-losing-customers";
  tx.createIfNotExists({
    _id: contactPostId,
    _type: "post",
    title: "Your contact form might be quietly losing customers",
    slug: { _type: "slug", current: "contact-form-losing-customers" },
    publishedAt: new Date().toISOString(),
    excerpt:
      "If the email never reaches your inbox, the lead disappears and nobody tells you. Here's how to test your form in two minutes, and what to fix if it fails.",
    format: "guide",
    featured: false,
    image: image(assets["post-leads.webp"], "Faceted illustration of a phone receiving new lead messages"),
    categories: [keyedRef("category-getting-leads")],
    ...(johnClark ? { relatedCaseStudies: [keyedRef(johnClark)] } : {}),
    body: [
      p(
        `Here's the worst kind of website problem: the one that looks fine. Your contact form has a nice button. A customer fills it out and sees "Thanks, we'll be in touch." Then nothing reaches you. No error, no bounce, no warning.`,
      ),
      p("The customer thinks you ignored them. You think nobody uses your website. Both of you are wrong, and you're the one losing money."),
      p(
        "I've found this on real client sites, including a contractor with 30 years of work behind him who was missing estimate requests without knowing it.",
      ),
      h2("Why forms fail without telling you"),
      p(
        "Most websites send form emails the cheap way: the web server sends the message itself, claiming to be from your business. Gmail and Outlook see an email that says it's from you, sent by a machine that isn't on your list. To a spam filter, that looks exactly like a scam.",
      ),
      p(
        "So it lands in spam, or it gets dropped before it lands anywhere. Some web hosts block that kind of sending entirely. The form still says thanks. The email just never leaves the building.",
      ),
      h2("The two-minute test"),
      numbered("Open your website on your phone, the way a customer would."),
      numbered("Fill out your contact form with a real name and an email that isn't your business email."),
      numbered(`Type "TEST" and the time in the message.`),
      numbered("Check your inbox and your spam folder."),
      numbered("Give it 10 minutes. If it's not there, it's not working."),
      p("Do this once a month. Plugins update, hosts change settings, and a form that worked in March can break in June."),
      ...(johnClark
        ? [
            {
              _type: "calloutCard",
              _key: key(),
              target: ref(johnClark),
              kicker: "Case study",
              image: image(assets["industry-remodeling.webp"]),
              title: "John R Clark & CO: the estimate form that wasn't sending",
              text: "His form used the host's built-in mail, which the host blocks. Every request vanished. Now they go through a real email service and land in his inbox.",
            },
          ]
        : []),
      h2("What to fix if it failed"),
      bullet(
        "Send through a real email service.",
        "Your form should hand its emails to a service built for sending email, instead of letting the web server fake it.",
      ),
      bullet(
        "Prove the service is allowed to send for you.",
        "Two small settings on your domain, called SPF and DKIM, work like a signed permission slip. Without them, inboxes don't trust the email.",
      ),
      bullet("Save every lead somewhere besides email.", "If an email ever fails again, the lead is still sitting in a list you can check."),
      p("If those words sound like gibberish, that's fine. It's about an hour of work for whoever manages your site. Send them this post."),
      quote(`A form that says "thanks" isn't proof it works. An email in your inbox is.`),
      h2("Make sure a human sees it fast"),
      p(
        "A working form is step one. The lead still goes cold if it sits in an inbox until Thursday. Most people contact more than one business, and the first one to answer usually gets the job.",
      ),
      bullet("Get a text, not just an email.", "A text to your phone the second someone fills out the form."),
      bullet("Send an automatic reply.", "Tell the customer when you'll call, so they stop shopping around."),
      bullet("Keep every lead in one list.", "New, called, booked, won. Nothing falls through the cracks."),
      {
        _type: "calloutCard",
        _key: key(),
        href: "/work#own-system",
        kicker: "Case study",
        title: "My own lead system: alerts in seconds, every lead tracked",
        text: "The exact setup I run on this site: the form saves every lead, emails me instantly and drops it into a private dashboard.",
        linkLabel: "See how it works",
        image: image(assets["post-lead-system.webp"]),
      },
      {
        _type: "checklist",
        _key: key(),
        eyebrow: "Your to-do list",
        heading: "Tick these off this week",
        items: [
          "Send a test through my contact form",
          "Check my inbox and my spam folder",
          "Switch my form to a real email service",
          "Ask my web person to set up SPF and DKIM",
          "Save every form submission outside email",
          "Get a text alert when a lead comes in",
        ],
        doneMessage: "All done. Your form is in better shape than most of your competitors'.",
      },
    ],
  });

  // Stubs stay drafts: they have a title and summary, not a body yet. Skip any you've already
  // published, or re-running would put a stub draft back on top of your finished post.
  const existing = new Set(
    await client.fetch<string[]>(`*[_id in $ids]._id`, {
      ids: DRAFT_POSTS.flatMap((s) => [`post-${s.id}`, `drafts.post-${s.id}`]),
    }),
  );
  for (const s of DRAFT_POSTS) {
    if (existing.has(`post-${s.id}`) || existing.has(`drafts.post-${s.id}`)) continue;
    tx.create({
      _id: `drafts.post-${s.id}`,
      _type: "post",
      title: s.title,
      slug: { _type: "slug", current: s.id },
      excerpt: s.excerpt,
      featured: Boolean(s.featured),
      ...(s.format ? { format: s.format } : {}),
      ...(s.image ? { image: image(assets[s.image], s.alt) } : {}),
      categories: [keyedRef(`category-${s.category}`)],
    });
  }

  INDUSTRIES.forEach((it, i) => {
    const caseStudy = it.caseStudy ? studyId(it.caseStudy) : undefined;
    tx.createIfNotExists({
      _id: `industry-${it.id}`,
      _type: "industry",
      name: it.name,
      slug: { _type: "slug", current: it.id },
      line: it.line,
      group: it.group,
      clientWork: Boolean(it.clientWork),
      sortOrder: (i + 1) * 10,
      ...(it.image ? { image: image(assets[it.image]) } : {}),
      ...(caseStudy ? { caseStudies: [keyedRef(caseStudy)] } : {}),
    });
  });

  await tx.commit();
  console.log("Created categories, posts and industries (anything that already existed was left alone).");

  // Fill the industry pages. setIfMissing never overwrites, and "href" is the old card link field.
  const industryIds = INDUSTRIES.flatMap((it) => [`industry-${it.id}`, `drafts.industry-${it.id}`]);
  const presentIndustries = new Set(await client.fetch<string[]>(`*[_id in $ids]._id`, { ids: industryIds }));
  const pages = client.transaction();
  for (const it of INDUSTRIES) {
    const page = INDUSTRY_PAGES[it.id];
    if (!page) continue;
    const caseStudy = it.caseStudy ? studyId(it.caseStudy) : undefined;
    const fields = {
      ...(page.eyebrow ? { eyebrow: page.eyebrow } : {}),
      headline: page.headline,
      intro: page.intro,
      stats: page.stats.map((k) => ({ _key: key(), _type: "industryStat", ...statFor(k) })),
      problems: page.problems.map(([title, body]) => ({ _key: key(), _type: "industryProblem", title, body })),
      solutions: page.solutions.map(([title, body, points]) => ({ _key: key(), _type: "industrySolution", title, body, ...(points ? { points } : {}) })),
      faqs: page.faqs.map(([question, answer]) => ({ _key: key(), _type: "industryFaq", question, answer })),
      ...(page.cta ? { cta: page.cta } : {}),
      ...(caseStudy ? { caseStudies: [keyedRef(caseStudy)] } : {}),
    };
    for (const id of [`industry-${it.id}`, `drafts.industry-${it.id}`]) {
      if (presentIndustries.has(id)) pages.patch(id, (p) => p.setIfMissing(fields).unset(["href"]));
    }
  }
  await pages.commit();
  console.log("Filled the empty industry page sections.");

  if (!johnClark) {
    console.log(`No case study with slug "${CASE_STUDY_SLUGS.johnClark}", so the case study page sections were skipped.`);
    return;
  }

  // Fill the new page sections on the John R Clark case study. setIfMissing never overwrites.
  const sections = {
    businessName: "John R Clark & CO",
    location: "Tarpon Springs, FL",
    headline: "His estimate requests were vanishing. Now every one lands in his inbox.",
    facts: [
      { _key: key(), _type: "fact", label: "Location", value: "Tarpon Springs, FL" },
      { _key: key(), _type: "fact", label: "In business", value: "30+ years" },
      { _key: key(), _type: "fact", label: "Services", value: "Website, Google, local SEO" },
    ],
    summary: {
      problem: "Customers filled out his estimate form. The emails never reached him, and nobody knew.",
      plan: "Fix the form first, then rebuild the site around his work and get him found on Google.",
      result: "Every estimate request now lands in his inbox, and his site shows off 30 years of work.",
    },
    problemHeading: "Great work, invisible website",
    beforeAfter: [
      ["Estimate form", `Said "thanks," then the email vanished`, "Every request lands in his inbox"],
      ["Google", "Hard to find on Maps, few reviews", "Business Profile set up, reviews coming in"],
      ["His work", "30 years of projects, almost none online", "A project gallery you can filter by job type"],
      ["Services", "Everything lumped onto one page", "A page for each service, starting with wallpaper"],
      ["On a phone", "Hard to read, hard to call", "Built for phones, call button on every page"],
    ].map(([label, before, after]) => ({ _key: key(), _type: "beforeAfterRow", label, before, after })),
    afterImage: image(johnClarkPhone, "John R Clark & CO website on a phone"),
    steps: [
      {
        title: "Fix the leak first",
        short: "Make the estimate form actually deliver",
        did: "Found that his host blocks the server's built-in email. Switched the form to a real email service and verified his domain so inboxes trust it.",
        why: "No point sending more people to a form that loses them. Fixing this first made every later step count.",
      },
      {
        title: "Rebuild around his work",
        short: "A site that shows, not tells",
        did: "Built a new site with a services hub, a page for each service, an about page with his story, and a project gallery you can filter by job type.",
        why: "People hiring a contractor want proof. Photos of real jobs do more selling than any paragraph.",
      },
      {
        title: "Get found on Google",
        short: "Business Profile and reviews",
        did: "Set up his Google Business Profile and asked past customers for reviews.",
        why: "For a local contractor, the Maps listing is often the first thing people see, before the website.",
      },
      {
        title: "Win the next town over",
        short: "One page per service, per town",
        did: "Planned a page for each service in each town he covers, starting with wallpaper installation, where fewer companies compete.",
        why: "Each page is another way to show up when someone searches for exactly what you do, where they live.",
      },
    ].map((s) => ({ _key: key(), _type: "planStep", ...s })),
    // Only the result we can stand behind. Add counts here once his analytics have them.
    results: [{ _key: key(), _type: "resultTile", label: "Estimate form", value: "Fixed", note: "Requests land in his inbox within seconds", highlight: true }],
    takeaways: [
      ["Test your own form", "Fill it out from your phone and check your inbox and spam. Two minutes, once a month."],
      ["Lead with your least crowded service", "John leads with wallpaper installation, where fewer local companies compete, instead of painting."],
      ["Ask past customers for reviews", "Thirty years of happy customers is a goldmine. A short text with your review link is enough."],
    ].map(([title, text]) => ({ _key: key(), _type: "takeaway", title, text })),
    underTheHood: [
      "WordPress with a custom theme: home, services hub, service template, about, contact and a filterable project gallery",
      "The host blocked the server's built-in mail, so the form now sends through WP Mail SMTP and an email service, with SPF and DKIM set on his domain",
      "Next up: a page for each service in each town he covers, rolled out in small batches",
    ],
    relatedPosts: [keyedRef(contactPostId)],
  };

  const ids = [johnClark, `drafts.${johnClark}`];
  const present = await client.fetch<string[]>(`*[_id in $ids]._id`, { ids });
  for (const id of present) await client.patch(id).setIfMissing(sections).commit();
  console.log(`Filled the empty page sections on John R Clark & CO (${present.length === 2 ? "published and draft" : "published"}).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
