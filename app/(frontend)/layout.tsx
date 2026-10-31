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
          pushed early are kept. GTM (which brings GA4 and the Meta pixel) and Clarity download only
          on the visitor's first interaction, or when a page calls window.loadAnalytics() (the
          thank-you pages do, so conversions never wait on a click). Loading them on idle still put
          ~750 KB of third-party JS inside the page-load window that PageSpeed measures.
          GA4 is not loaded here directly: the GTM container already loads gtag.js for it, and
          loading it twice downloaded the same 177 KB again and doubled page views.
          This lives in <head>, not <body>: PostHog injects its extension scripts before the first
          `body > script` ahead of hydration, which would land on top of a React-rendered script
          there and cause a mismatch.
        */}
        {/* eslint-disable-next-line @next/next/next-script-for-ga -- <GoogleTagManager> loads right after hydration, the cost this avoids. */}
        <script
          id="analytics-init"
          dangerouslySetInnerHTML={{
            __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            (function(){
              var loaded = false;
              var events = ['pointerdown', 'keydown', 'touchstart', 'scroll', 'mousemove'];
              var opts = { passive: true, capture: true };
              function add(src){
                var s = document.createElement('script');
                s.async = true;
                s.src = src;
                document.head.appendChild(s);
              }
              function load(){
                if (loaded) return;
                loaded = true;
                events.forEach(function(e){ window.removeEventListener(e, load, opts); });
                dataLayer.push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
                add('https://www.googletagmanager.com/gtm.js?id=${GTM_ID}');
                ${
                  clarityId
                    ? `window.clarity = window.clarity || function(){(window.clarity.q = window.clarity.q || []).push(arguments)};
                add('https://www.clarity.ms/tag/${clarityId}');`
                    : ""
                }
              }
              window.loadAnalytics = load;
              events.forEach(function(e){ window.addEventListener(e, load, opts); });
            })();
          `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <TopNav />
        <div>{children}</div>
        <Footer />
      </body>
    </html>
  );
}

export default Frontendlayout;
