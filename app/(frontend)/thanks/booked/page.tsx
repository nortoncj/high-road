import type { Metadata } from "next";
import { ThankYou } from "@/components/thanks";
import { thanksMeta } from "@/content/thanks";

const meta = thanksMeta.booked;

export const metadata: Metadata = {
  title: { absolute: meta.title },
  description: meta.description,
  // Nobody should land here from Google.
  robots: { index: false, follow: false },
};

// No tracking event here on purpose: the calendar on /book already sends book_call.
export default function BookedPage() {
  return <ThankYou variant="booked" />;
}
