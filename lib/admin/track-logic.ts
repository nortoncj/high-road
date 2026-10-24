/**
 * Pure helpers for the tracking endpoint. No Next, no Supabase, so they're easy to test.
 */

/** Crawlers, uptime checkers, link previewers and scripts. They don't call anybody. */
const BOT_RE =
  /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|pingdom|uptime|monitor|preview|facebookexternalhit|whatsapp|curl|wget|python|axios|node-fetch|go-http|java\/|httpclient|scrapy/i;

export function isBot(ua: string | null | undefined): boolean {
  return !ua || ua.length < 20 || BOT_RE.test(ua);
}

/** "https://www.AcmeHVAC.com/about?x=1" or "acmehvac.com" → "acmehvac.com". Null if it isn't a host. */
export function normalizeDomain(input: string | null | undefined): string | null {
  if (!input) return null;
  let s = input.trim().toLowerCase();
  if (!s) return null;
  if (!/^[a-z]+:\/\//.test(s)) s = `https://${s}`;
  try {
    const host = new URL(s).hostname.replace(/^www\./, "").replace(/\.$/, "");
    return /^[a-z0-9.-]+\.[a-z]{2,}$/.test(host) ? host : null;
  } catch {
    return null;
  }
}

/** Host from an Origin or Referer header. */
export function hostOf(v: string | null | undefined): string | null {
  if (!v || v === "null") return null;
  try {
    return new URL(v).hostname.toLowerCase();
  } catch {
    return null;
  }
}

/** "/Services/AC-Repair/?utm=x#top" → "/Services/AC-Repair". Root stays "/". */
export function cleanPath(p: unknown): string {
  let s = typeof p === "string" ? p : "/";
  s = s.split(/[?#]/)[0] || "/";
  if (!s.startsWith("/")) s = `/${s}`;
  if (s.length > 1) s = s.replace(/\/+$/, "") || "/";
  try {
    s = decodeURI(s);
  } catch {
    // Leave it encoded if it's malformed.
  }
  return s.slice(0, 300);
}

const SEARCH: [RegExp, string][] = [
  [/(^|\.)google\./, "google"],
  [/(^|\.)bing\.com$/, "bing"],
  [/(^|\.)duckduckgo\.com$/, "duckduckgo"],
  [/(^|\.)yahoo\.com$/, "yahoo"],
  [/(^|\.)(facebook\.com|fb\.com|fb\.me)$/, "facebook"],
  [/(^|\.)instagram\.com$/, "instagram"],
  [/(^|\.)(t\.co|twitter\.com|x\.com)$/, "x"],
  [/(^|\.)(linkedin\.com|lnkd\.in)$/, "linkedin"],
  [/(^|\.)nextdoor\.com$/, "nextdoor"],
  [/(^|\.)yelp\.com$/, "yelp"],
  [/(^|\.)(chatgpt\.com|chat\.openai\.com)$/, "chatgpt"],
  [/(^|\.)perplexity\.ai$/, "perplexity"],
  [/(^|\.)(claude\.ai)$/, "claude"],
  [/(^|\.)tiktok\.com$/, "tiktok"],
  [/(^|\.)youtube\.com$/, "youtube"],
];

const UTM_ALIASES: Record<string, string> = {
  gbp: "gbp",
  gmb: "gbp",
  google_business: "gbp",
  googlebusinessprofile: "gbp",
  fb: "facebook",
  ig: "instagram",
};

/**
 * Where a visit came from, only on the first view of a page load.
 * utm_source wins (tag the Google Business Profile link with ?utm_source=gbp), then the referrer.
 * Returns null for clicks within the same site, so they don't count as a new arrival.
 */
export function classifySource(referrer: unknown, pageHost: string | null, utm: unknown): string | null {
  const tag = typeof utm === "string" ? utm.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, "").slice(0, 40) : "";
  if (tag) return UTM_ALIASES[tag] ?? tag;

  const ref = typeof referrer === "string" ? referrer : "";
  if (!ref) return "direct";
  const host = hostOf(ref)?.replace(/^www\./, "");
  if (!host) return "direct";

  const page = pageHost?.replace(/^www\./, "") ?? "";
  if (page && (host === page || host.endsWith(`.${page}`) || page.endsWith(`.${host}`))) return null;

  for (const [re, name] of SEARCH) if (re.test(host)) return name;
  return host.slice(0, 60);
}

/** Display names for the report. Anything not listed shows as its domain. */
export const sourceLabels: Record<string, string> = {
  google: "Google search",
  google_ads: "Google Ads",
  gbp: "Google Business Profile",
  bing: "Bing",
  duckduckgo: "DuckDuckGo",
  yahoo: "Yahoo",
  facebook: "Facebook",
  instagram: "Instagram",
  x: "X (Twitter)",
  linkedin: "LinkedIn",
  nextdoor: "Nextdoor",
  yelp: "Yelp",
  chatgpt: "ChatGPT",
  perplexity: "Perplexity",
  claude: "Claude",
  tiktok: "TikTok",
  youtube: "YouTube",
  direct: "Typed in or bookmarked",
  email: "Email",
  newsletter: "Email",
};

export function sourceLabel(id: string): string {
  return sourceLabels[id] ?? id;
}

/** Only what the snippet sends. Anything else is dropped. */
export type Hit = {
  key: string;
  kind: "view" | "call" | "form";
  path: string;
  host: string | null;
  referrer?: string;
  utm?: string;
  number?: string;
  form?: string;
  first: boolean;
};

export function parseHit(raw: string): Hit | null {
  if (raw.length > 2000) return null;
  let b: Record<string, unknown>;
  try {
    b = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!b || typeof b !== "object") return null;
  const key = typeof b.k === "string" && /^[a-z0-9]{6,40}$/i.test(b.k) ? b.k : null;
  const kind = b.t === "view" || b.t === "call" || b.t === "form" ? b.t : null;
  if (!key || !kind) return null;
  const s = (v: unknown, n: number) => (typeof v === "string" && v ? v.slice(0, n) : undefined);
  return {
    key,
    kind,
    path: cleanPath(b.p),
    host: typeof b.h === "string" ? b.h.toLowerCase().slice(0, 253) : null,
    referrer: s(b.r, 500),
    utm: s(b.u, 60),
    number: s(typeof b.n === "string" ? b.n.replace(/[^\d+]/g, "") : undefined, 20),
    form: s(b.f, 60),
    first: b.r !== undefined,
  };
}
