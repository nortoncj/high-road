import Script from "next/script";
import React from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { Footer, TopNav } from "@/components/home";
import { buildMetadata } from "@/lib/seo";
import "../globals.css";

/**
 * The marketing site's ROOT layout (it renders <html>). The admin has its own in app/(admin)/layout.tsx,
 * so globals.css and admin.css never load on the same page.
 */

export const metadata = buildMetadata({});

const GTM_ID = "GTM-NZZ2DH99";
const GA_ID = "G-P3VJZQ9VNG";

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
      <head>
        {/*
          Analytics: the dataLayer/gtag queues are set up right away (tiny, no network) so events
          pushed early (e.g. ConversionPing) are kept, while the heavy GTM/GA4/Clarity downloads wait
          for browser idle time and don't compete with the page loading. This lives in <head>, not
          <body>: PostHog injects its extension scripts before the first `body > script` ahead of
          hydration, which would land on top of a React-rendered script there and cause a mismatch.
        */}
        <script
          id="analytics-init"
          dangerouslySetInnerHTML={{
            __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            dataLayer.push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Script src={`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`} strategy="lazyOnload" />
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="lazyOnload" />
        {clarityId && (
          <Script id="ms-clarity" strategy="lazyOnload">
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
