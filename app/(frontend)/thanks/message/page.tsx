import type { Metadata } from "next";
import { ThankYou, TrackEvent } from "@/components/thanks";
import { thanksMeta } from "@/content/thanks";

const meta = thanksMeta.message;

export const metadata: Metadata = {
  title: { absolute: meta.title },
  description: meta.description,
  // Nobody should land here from Google.
  robots: { index: false, follow: false },
};

export default function MessagePage() {
  return (
    <>
      <TrackEvent name="contact_form" params={{ method: "form" }} />
      <ThankYou variant="message" />
    </>
  );
}
