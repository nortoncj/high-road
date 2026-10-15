import Script from "next/script";
import React from "react";
import { Footer, MobileCtaBar, TopNav } from "@/components/home";
import { buildMetadata } from "@/libs/seo";

export const metadata = buildMetadata({});

function Frontendlayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;
  return (
    <>
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
    </>
  );
}

export default Frontendlayout;
