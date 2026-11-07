// Shapes returned by the GROQ queries in ./queries.ts. Keep the two files in step.
// Every field the Studio doesn't require can come back null.

import type { PortableTextBlock } from "@portabletext/react";

export type SanityImage = {
  asset?: { _ref: string } | null;
  crop?: { top: number; bottom: number; left: number; right: number } | null;
  hotspot?: { x: number; y: number; height: number; width: number } | null;
  alt?: string | null;
  caption?: string | null;
  /** Tiny base64 preview from Sanity, used as the blur placeholder. */
  lqip?: string | null;
  width?: number | null;
  height?: number | null;
};

export type CategoryRef = { title: string; slug: string };

export type PostCard = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  publishedAt: string | null;
  featured: boolean | null;
  /** "guide" | "story" | "checklist" | "opinion" */
  format: string | null;
  readMinutes: number;
  image: SanityImage | null;
  category: CategoryRef | null;
};

export type CaseStudyCard = {
  _id: string;
  slug: string;
  /** Business name, falling back to the testimonial's business, then the title. */
  name: string;
  /** First item of the free-text industry field, e.g. "Contractor". */
  sector: string | null;
  location: string | null;
  excerpt: string | null;
  image: SanityImage | null;
};

/* ---------- Custom blocks inside a post body ---------- */

export type CalloutTarget = {
  _type: "post" | "caseStudy";
  slug: string;
  title: string;
  excerpt: string | null;
  image: SanityImage | null;
};

export type CalloutCardBlock = {
  _type: "calloutCard";
  _key: string;
  kicker?: string | null;
  title?: string | null;
  text?: string | null;
  href?: string | null;
  linkLabel?: string | null;
  image?: SanityImage | null;
  target?: CalloutTarget | null;
};

export type ChecklistBlock = {
  _type: "checklist";
  _key: string;
  eyebrow?: string | null;
  heading?: string | null;
  items?: string[] | null;
  doneMessage?: string | null;
};

export type CodeBlock = { _type: "code"; _key: string; code?: string; language?: string; filename?: string };

export type TableBlock = {
  _type: "contentTable";
  _key: string;
  table?: { rows?: { _key: string; cells?: string[] }[] } | null;
  caption?: string | null;
  hasHeaderRow?: boolean | null;
  note?: string | null;
};

export type BodyImageBlock = SanityImage & { _type: "image"; _key: string };

export type PostBodyBlock =
  | PortableTextBlock
  | CalloutCardBlock
  | ChecklistBlock
  | CodeBlock
  | TableBlock
  | BodyImageBlock;

export type Seo = { title?: string | null; description?: string | null; keywords?: string[] | null };

export type PostDetail = PostCard & {
  updatedAt: string;
  body: PostBodyBlock[] | null;
  seo: Seo | null;
  categories: CategoryRef[] | null;
  /** Picked in the Studio. Topped up with the newest ones on the page. */
  pickedCaseStudies: CaseStudyCard[] | null;
  latestCaseStudies: CaseStudyCard[];
  sameCategory: PostCard[];
  latest: PostCard[];
};

/* ---------- Industries ---------- */

export type IndustryGroup = "home" | "makers" | "food" | "care";

export type Industry = {
  _id: string;
  name: string;
  slug: string;
  group: IndustryGroup | null;
  line: string | null;
  clientWork: boolean | null;
  href: string | null;
  image: SanityImage | null;
  caseStudy: { slug: string; name: string } | null;
};

/* ---------- Case studies ---------- */

export type Fact = { _key: string; label: string; value: string };
export type BeforeAfterRow = { _key: string; label: string; before: string | null; after: string | null };
export type PlanStep = { _key: string; title: string; short: string | null; did: string | null; why: string | null };
export type ResultTile = { _key: string; label: string; value: string; note: string | null; highlight: boolean | null };
export type ChartPoint = { _key: string; label: string; value: number; after: boolean | null };
export type Takeaway = { _key: string; title: string; text: string | null };
export type Outcome = {
  _key: string;
  metric: string;
  before: string | null;
  after: string | null;
  delta: string | null;
  isEstimated: boolean | null;
};

export type CaseStudyDetail = CaseStudyCard & {
  title: string;
  updatedAt: string;
  publishedAt: string | null;
  headline: string | null;
  facts: Fact[] | null;
  summary: { problem?: string | null; plan?: string | null; result?: string | null } | null;
  problemHeading: string | null;
  beforeAfter: BeforeAfterRow[] | null;
  beforeImage: SanityImage | null;
  afterImage: SanityImage | null;
  steps: PlanStep[] | null;
  results: ResultTile[] | null;
  resultsChart: { title?: string | null; note?: string | null; points?: ChartPoint[] | null } | null;
  outcomes: Outcome[] | null;
  testimonial: { quote?: string | null; authorName?: string | null; authorBusiness?: string | null; authorPhoto?: SanityImage | null } | null;
  takeaways: Takeaway[] | null;
  underTheHood: string[] | null;
  techStack: string[] | null;
  gallery: SanityImage[] | null;
  /** Older case studies keep their story in these three rich text fields. */
  problem: PortableTextBlock[] | null;
  solution: PortableTextBlock[] | null;
  systemBuilt: PortableTextBlock[] | null;
  seo: { metaTitle?: string | null; metaDescription?: string | null } | null;
  industryPage: { name: string; slug: string } | null;
  pickedPosts: PostCard[] | null;
  latestPosts: PostCard[];
};
