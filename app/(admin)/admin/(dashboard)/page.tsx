import type { Metadata } from "next";
import { overview } from "@/content/admin";
import { requireAdmin } from "@/lib/admin/auth";
import { getOverview } from "@/lib/admin/data";
import { firstName } from "@/lib/admin/format";
import { dayPart, parseRange, type SearchParams } from "@/lib/admin/range";
import { DateRangePicker } from "@/components/admin/DateRangePicker";
import { LeadsCard } from "@/components/admin/LeadsCard";
import { PageHeader } from "@/components/admin/PageHeader";
import { RecentActivity } from "@/components/admin/RecentActivity";
import { ServicesBreakdown } from "@/components/admin/ServicesBreakdown";
import { StatCards } from "@/components/admin/StatCards";

export const metadata: Metadata = { title: overview.meta.title };

export default async function AdminOverviewPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const admin = await requireAdmin();
  const range = parseRange(await searchParams);
  const data = await getOverview(range);

  return (
    <>
      <PageHeader
        title={overview.greeting(dayPart(), firstName(admin.name))}
        description={overview.subhead(range.label)}
        actions={<DateRangePicker preset={range.preset} fromDay={range.fromDay} toDay={range.toDay} label={range.label} />}
      />

      <StatCards kpis={data.kpis} compareLabel={range.compareLabel} />

      <div className="grid items-start gap-4 sm:gap-6 xl:grid-cols-3">
        <LeadsCard data={data.recentLeads} className="xl:col-span-2" />
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-1">
          <ServicesBreakdown data={data.services} />
          <RecentActivity items={data.activity} />
        </div>
      </div>
    </>
  );
}
