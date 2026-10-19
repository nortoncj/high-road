import {
  About,
  BookCta,
  Faq,
  Hero,
  LeadMath,
  Packages,
  Pillars,
  Process,
  RecentWork,
  ReportPreview,
  TradeMarquee,
} from "@/components/home";
import { site } from "@/content/home";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: `Websites for service businesses | ${site.name}`,
  description: site.oneLiner,
});

export default function Home() {
  return (
    <>
      <Hero />
      <TradeMarquee />
      <Pillars />
      <LeadMath />
      <Process />
      <ReportPreview />
      <RecentWork />
      <About />
      <Packages />
      <Faq />
      <BookCta />
    </>
  );
}
