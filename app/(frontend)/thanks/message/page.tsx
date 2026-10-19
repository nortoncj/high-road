import type { Metadata } from "next";
import { ThanksPage } from "@/components/thanks";
import { thanks } from "@/content/thanks";
import { buildMetadata } from "@/lib/seo";

// Thank-you pages stay out of search results: landing here from Google would fake a conversion.
export const metadata: Metadata = {
  ...(buildMetadata({ title: thanks.message.meta.title, description: thanks.message.meta.description }) as Metadata),
  robots: { index: false, follow: false },
};

export default function ThanksMessagePage() {
  return <ThanksPage kind="message" />;
}
