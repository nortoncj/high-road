import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Bricolage_Grotesque, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/admin/ui/sonner";
import "./admin.css";

/**
 * The admin's own ROOT layout (it renders <html>), separate from the marketing site's.
 * That's what keeps Tailwind's reset and shadcn's styles from touching your CSS-module pages:
 * the two never load on the same page. It sits in the (admin) route group; see ADMIN_SETUP.md step 1.
 */

// Every admin page reads the session cookie or the URL first, so there's nothing to prerender. Let them block.
export const instant = false;

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", display: "swap" });
const sans = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · WebTech Ninjas Admin" },
  robots: { index: false, follow: false, nocache: true },
  // Add to Home Screen on your phone and it opens like an app.
  appleWebApp: { capable: true, title: "WTN Admin", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F6F2EA" },
    { media: "(prefers-color-scheme: dark)", color: "#142428" },
  ],
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
