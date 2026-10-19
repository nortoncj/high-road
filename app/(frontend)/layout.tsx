import Script from "next/script";
import React from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleTagManager } from "@next/third-parties/google";
import { Footer, TopNav } from "@/components/home";
import { buildMetadata } from "@/lib/seo";
import "../globals.css";

/**
 * The marketing site's ROOT layout (it renders <html>). The admin has its own in app/(admin)/layout.tsx,
 * so globals.css and admin.css never load on the same page.
 */

export const metadata = buildMetadata({});

const GTM_ID = "GTM-NZZ2DH99";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function Frontendlayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <GoogleTagManager gtmId={GTM_ID} />
      <body className="min-h-full flex flex-col">
        {/* Google Tag Manager */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-P3VJZQ9VNG"
          strategy="afterInteractive"
        />

        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-P3VJZQ9VNG');
          `}
        </Script>
        {clarityId && (
          <Script id="ms-clarity" strategy="afterInteractive">
            {`
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "${clarityId}");
    `}
          </Script>
        )}
        <TopNav />
        <div>{children}</div>
        <Footer />
      </body>
    </html>
  );
}

export default Frontendlayout;
