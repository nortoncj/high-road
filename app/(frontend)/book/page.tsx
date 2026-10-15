import type { Metadata } from "next";
import { BookSection } from "@/components/book";
import { bookMeta } from "@/content/book";

export const metadata: Metadata = {
  title: { absolute: bookMeta.title },
  description: bookMeta.description,
  alternates: { canonical: bookMeta.path },
  // People land here from your buttons, not from Google. Keep cold searches off the calendar.
  robots: { index: false, follow: true },
};

// TopNav and Footer come from app/layout.tsx. MobileCtaBar hides itself on /book.
export default function BookPage() {
  return <BookSection />;
}
