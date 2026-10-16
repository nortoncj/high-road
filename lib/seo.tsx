type MetadataInput = {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  keywords?: string[];
};


export function buildMetadata({
  title,
  description,
  image = "/og-image.png",
  url = "https://webtechninjas.com",
  keywords = [],
}: MetadataInput) {
  const fullTitle = title ? `${title} | Webtech Ninjas` : "Webtech Ninjas";

  const fullDescription =
    description ||
    "Bilingual, phone-first websites that help home care agencies in Sarasota and Orlando hire caregivers and win families.";

  // Ensure absolute OG image URL
  const absoluteImage = image.startsWith("http") ? image : `${url}${image}`;

  return {
    // -------------------------
    // 🔍 GOOGLE SEO
    // -------------------------
    title: fullTitle,
    description: fullDescription,
    keywords,
    alternates: {
      canonical: url,
    },
    other: {
      "google-site-verification": "YqzMHIzOgPMFfzOKYOZBnVOccDAZ1jdaJ_qHKcmI5x0",
      "msvalidate.01": "60B32BAF819A3A3DD7BD39D7BCDBDA21",
    },
    

    // -------------------------
    // 🟦 OPEN GRAPH
    // -------------------------
    openGraph: {
      title: fullTitle,
      description: fullDescription,
      url,
      siteName: "Webtech Ninjas",
      images: [
        {
          url: absoluteImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      locale: "en_US",
      type: "website",
    },

    // -------------------------
    // 🐦 TWITTER
    // -------------------------
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: fullDescription,
      images: [absoluteImage],
      creator: "@chrisnortonjr",
    },

    // -------------------------
    // 📱 iMessage / SMS / WhatsApp
    // -------------------------
    metadataBase: new URL(url),
  };
}
