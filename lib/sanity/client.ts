import "server-only";
import { createClient, type QueryParams } from "@sanity/client";
import { apiVersion, dataset, projectId, sanityConfigured } from "./env";

// No CDN: every read already sits behind 'use cache', and the CDN can lag a publish by a few
// seconds, which would cache the old version right after the webhook clears it.
const client = sanityConfigured
  ? createClient({ projectId, dataset, apiVersion, useCdn: false, perspective: "published" })
  : null;

/**
 * Runs a GROQ query. Returns `fallback` when Sanity isn't configured. Real errors still throw.
 * "no-store" keeps the response out of Next's fetch cache, which outlives deploys and doesn't know
 * the "sanity" tag; the 'use cache' functions in ./data.ts are the one cache, cleared on publish.
 */
export async function sanityFetch<T>(query: string, params: QueryParams = {}, fallback: T): Promise<T> {
  if (!client) return fallback;
  return (await client.fetch<T | null>(query, params, { cache: "no-store" })) ?? fallback;
}
