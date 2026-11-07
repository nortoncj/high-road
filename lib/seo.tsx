type MetadataInput = {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  keywords?: string[];
  /** Page path, e.g. "/blog/my-post". Sets the canonical and og:url to that page on SITE_URL. */
  path?: string;
  type?: "website" | "article";
};

/** The canonical host. webtechninjas.com redirects here (next.config.ts). */
export const SITE_URL = "https://www.webtechninjas.com";

export function buildMetadata({
  title,
  description,
  image = "/og-image.png",
  url = "https://webtechninjas.com",
  keywords = [],
  path,
  type = "website",
}: MetadataInput) {
  const fullTitle = title ? `${title} | Webtech Ninjas` : "Webtech Ninjas";
  const canonical = path ? new URL(path, SITE_URL).toString() : url;

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
      canonical,
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
      url: canonical,
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
      type,
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
