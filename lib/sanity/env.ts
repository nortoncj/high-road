// Sanity project settings. The project ID and dataset are public (they ship to the browser anyway).
// The Studio (sanity.config.ts, served at /admin/content) uses the same two values.

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "";

// Pin the API version so a Sanity change never alters query results under us.
export const apiVersion = "2026-10-01";

/** False when the env vars are missing: pages render their empty states instead of failing the build. */
export const sanityConfigured = Boolean(projectId && dataset);
