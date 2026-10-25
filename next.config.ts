import { execSync } from "node:child_process";
import type { NextConfig } from "next";

/**
 * One id per deploy (the commit being built). Without it, a tab still running the old JS that
 * client-navigates after a deploy gets RSC data pointing at client components it doesn't have,
 * and React crashes with error #130. With it, Next sees the mismatch and does a full reload.
 */
function deploymentId() {
  if (process.env.NEXT_DEPLOYMENT_ID) return process.env.NEXT_DEPLOYMENT_ID;
  try {
    return execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return undefined;
  }
}

const nextConfig: NextConfig = {
  deploymentId: deploymentId(),
  /* config options here */
  // next.config.js
  experimental: {
    agentFeedback: true,
    inlineCss:true,
    // Two root layouts ((frontend) and (admin)) need app/global-not-found.tsx for unmatched URLs.
    globalNotFound: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  // The server runs out of memory type checking (tsc needs ~550MB). The Deploy workflow type checks
  // on GitHub's runner first and only then builds on the server with SKIP_TYPECHECK=1.
  // Local `next build` still type checks.
  typescript: {
    ignoreBuildErrors: process.env.SKIP_TYPECHECK === "1",
  },
  turbopack: {
    rules: {
      "*.css": {
        // Skip CSS modules: `as: "*.css"` would turn them into global CSS.
        condition: { not: { path: /\.module\.css$/ } },
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  // NEW: send webtechninjas.com to www.webtechninjas.com (permanent 308)
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "webtechninjas.com" }],
        destination: "https://www.webtechninjas.com/:path*",
        permanent: true,
      },
    ];
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      {
        protocol: "https",
        hostname: "images.pexels.com",
        pathname: "/photos/**",
      },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "fal.media" },
      { protocol: "https", hostname: "v3.fal.media" },
    ],
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 768, 1024, 1280, 1600],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // NEW: keep resized images cached for 30 days instead of re-resizing them constantly (fix #2/#3 from the list)
    minimumCacheTTL: 2592000,
  },
};

export default nextConfig;
