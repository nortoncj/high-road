// Copy for /blog and /blog/[slug]. The posts themselves live in Sanity (see /studio).

import { AboutHeadshot } from "@img/thumbnails";
import { site } from "@/content/home";

export const blogMeta = {
  title: "Website tips for local businesses",
  description:
    "How to get more calls, show up on Google and stop losing leads. Plain English guides for local business owners, written by Chris Norton.",
  path: "/blog",
};

export const blogHero = {
  eyebrow: "The blog",
  headline: "Straight answers about websites that bring in work",
  body: "How to get more calls, show up on Google and stop losing leads. Written for business owners, not developers.",
};

export const blogIndex = {
  latestEyebrow: "Latest post",
  featuredBadge: "Featured",
  readPost: "Read the post",
  allEyebrow: "All posts",
  heading: "Pick what you're stuck on",
  all: "All",
  filterLabel: "Filter posts by topic",
  searchLabel: "Search the blog",
  searchPlaceholder: 'Try "Google Business Profile"',
  pageSize: 6,
  showing: (shown: number, total: number) => `Showing ${shown} of ${total} ${total === 1 ? "post" : "posts"}`,
  showMore: "Show more posts",
  emptyTitle: "Nothing on that yet",
  emptyBody: "Ask me on a free call and it might be the next post.",
  emptyReset: "Show all posts",
  noPosts: "The first posts are on their way. In the meantime, book a free call and ask me anything.",
  read: "Read",
};

export const formatLabels: Record<string, string> = {
  guide: "Guide",
  story: "Story",
  checklist: "Checklist",
  opinion: "Opinion",
};

export const minRead = (n: number) => `${n} min read`;

export const formatDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/New_York" })
    : null;

export const author = {
  name: "Chris Norton",
  bio: "Engineer turned web designer. I build websites for local businesses that make money when someone calls, books or fills out a form, and I answer my own phone.",
  photo: { src: AboutHeadshot, alt: "Chris Norton" },
  aboutHref: "/about",
  aboutLabel: "More about me",
  writtenBy: "Written by",
};

export const post = {
  breadcrumbLabel: "Breadcrumb",
  toc: "On this page",
  progressLabel: "Reading progress",
  caseStudiesEyebrow: "Case studies",
  caseStudiesHeading: "See it fixed on real businesses",
  readCaseStudy: "Read the case study",
  keepReadingEyebrow: "Keep reading",
  moreOn: (category: string) => `More on ${category.toLowerCase()}`,
  moreFallback: "More from the blog",
  allPosts: "All posts",
  updated: "Updated",
};

/** Defaults for the blocks you can drop into a post body in the Studio. */
export const blocks = {
  callout: { kicker: "Case study", caseStudyLink: "Read the case study", postLink: "Read the post", link: "Take a look" },
  checklist: {
    eyebrow: "Your to-do list",
    heading: "Tick these off this week",
    done: (n: number, total: number) => `${n} of ${total} done`,
    allDone: "All done. Your site is in better shape than most of your competitors'.",
  },
};

export const formCheck = {
  eyebrow: "Free form check",
  heading: "Not sure your form works? I'll test it for you.",
  body: "Send me your website. I'll test your form and email you what I found within one business day.",
  name: { label: "Your name", placeholder: "Dana Rivera" },
  email: { label: "Email", placeholder: "you@yourbusiness.com" },
  website: { label: "Website", placeholder: "yourbusiness.com" },
  submit: "Test my form",
  sending: "Sending...",
  footnote: "No spam. No sales pitch. Just what I found.",
  /** Saved as the lead's message so you know where it came from. */
  message: (postTitle: string) =>
    `Free form check request from the blog post "${postTitle}". Please test the contact form on my website.`,
  talkTitle: "Rather just talk?",
  talkLink: "Book a free 15 minute call",
  talkHref: site.bookHref,
};

export const newsletter = {
  eyebrow: "Monthly email",
  heading: "One email a month. What's actually working.",
  body: "New posts and one quick fix you can make to your site that week. Unsubscribe any time.",
  railTitle: "One email a month",
  railBody: "New guides and one quick fix for your site. Unsubscribe any time.",
  email: { label: "Email", placeholder: "you@yourbusiness.com" },
  submit: "Send me the email",
  railSubmit: "Sign me up",
  sending: "Sending...",
  success: "You're in. Look for the next one at the start of the month.",
  errors: {
    email: "That email doesn't look right.",
    rateLimited: "Looks like you've tried a few times already. Give it a few minutes.",
    server: "Something went wrong on my end. Please try again in a minute.",
  },
};

export const blogCta = {
  eyebrow: "Rather skip the reading?",
  heading: "I'll look at your site and tell you what to fix first",
  body: "Free 15 minute call. You'll leave knowing where leads are slipping away, whether you hire me or not.",
  primaryCta: { label: "Book a free call", href: site.bookHref },
};
