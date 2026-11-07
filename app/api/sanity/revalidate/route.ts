import { revalidateTag } from "next/cache";
import { SIGNATURE_HEADER_NAME, isValidSignature } from "@sanity/webhook";
import { SANITY_TAG } from "@/lib/sanity/data";

/**
 * Sanity webhook: publish, unpublish or delete in the Studio → POST here → the blog, industries
 * and case study pages refetch on their next visit. Signed with SANITY_REVALIDATE_SECRET.
 *
 * Set it up at sanity.io/manage → API → Webhooks:
 *   URL: https://www.webtechninjas.com/api/sanity/revalidate   Method: POST   Dataset: your dataset
 *   Filter: _type in ["post", "caseStudy", "industry", "category", "tag"]
 *   Trigger on: create, update, delete   Secret: the same value as SANITY_REVALIDATE_SECRET
 */

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

export async function POST(req: Request) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) return json(500, { error: "SANITY_REVALIDATE_SECRET is not set" });

  const body = await req.text();
  const signature = req.headers.get(SIGNATURE_HEADER_NAME) ?? "";
  if (!(await isValidSignature(body, signature, secret))) return json(401, { error: "bad signature" });

  // Posts, case studies and industries reference each other, so clear them all. Stale copies
  // aren't served after a publish: the next visit waits for fresh content.
  revalidateTag(SANITY_TAG, { expire: 0 });
  return json(200, { revalidated: true, now: Date.now() });
}
