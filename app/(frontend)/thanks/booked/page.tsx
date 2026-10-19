import type { Metadata } from "next";
import { ThanksPage } from "@/components/thanks";
import { thanks } from "@/content/thanks";
import { buildMetadata } from "@/lib/seo";

// Thank-you pages stay out of search results: landing here from Google would fake a conversion.
export const metadata: Metadata = {
  ...(buildMetadata({ title: thanks.booked.meta.title, description: thanks.booked.meta.description }) as Metadata),
  robots: { index: false, follow: false },
};

export default function ThanksBookedPage() {
  return <ThanksPage kind="booked" />;
}
