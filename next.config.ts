import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
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
