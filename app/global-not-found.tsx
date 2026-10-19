import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

/**
 * 404 for URLs that match no route at all. Needed because the site has two root layouts
 * ((frontend) and (admin)), so there's no single layout to wrap a not-found page in.
 * It skips every layout, so it brings its own <html> and the marketing styles.
 */

export const metadata: Metadata = {
  title: "Page not found · WebTech Ninjas",
  robots: { index: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body
        style={{
          minHeight: "100svh",
          display: "grid",
          placeItems: "center",
          padding: "var(--gutter)",
          background: "var(--surface-page)",
          color: "var(--ink)",
          fontFamily: "var(--font-text)",
        }}
      >
        <main style={{ maxWidth: 480, textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-mono)", color: "var(--brand-text)", letterSpacing: "0.14em" }}>404</p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", margin: "8px 0 12px" }}>
            That page isn&apos;t here.
          </h1>
          <p style={{ color: "var(--ink-muted)", margin: "0 0 24px" }}>It may have moved, or the link has a typo.</p>
          <Link href="/" style={{ color: "var(--brand-text)", fontWeight: 700 }}>
            Back to the home page
          </Link>
        </main>
      </body>
    </html>
  );
}
