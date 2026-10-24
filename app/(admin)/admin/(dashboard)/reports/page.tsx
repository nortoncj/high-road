import type { Metadata } from "next";
import Link from "next/link";
import { TbArrowRight } from "react-icons/tb";
import { reportsPage } from "@/content/admin";
import { requireAdmin } from "@/lib/admin/auth";
import type { SearchParams } from "@/lib/admin/range";
import { monthOptions, parseMonth } from "@/lib/admin/report-logic";
import { listReports } from "@/lib/admin/reports";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState, IssueNote } from "@/components/admin/States";
import { MonthPicker } from "@/components/admin/reports/MonthPicker";
import { ReportRows } from "@/components/admin/reports/ReportRows";
import { ReportStats } from "@/components/admin/reports/ReportStats";

export const metadata: Metadata = { title: reportsPage.meta.title };

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** /admin/reports?m=2026-09. Defaults to last month: the one you're about to send. */
export default async function AdminReportsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin();
  const month = parseMonth(one((await searchParams).m));
  const list = await listReports(month);

  return (
    <>
      <PageHeader
        title={reportsPage.title}
        description={reportsPage.description(month.label)}
        actions={<MonthPicker value={month.key} options={monthOptions()} />}
      />

      {list.ok && list.data.rows.length ? (
        <ReportStats cur={list.data.totals.cur} prev={list.data.totals.prev} compareLabel={month.compareLabel} />
      ) : null}

      <div className="grid grid-cols-1 items-start gap-4 sm:gap-6 xl:grid-cols-3">
        <Card className="min-w-0 gap-0 overflow-hidden py-0 md:py-2 xl:col-span-2">
          {!list.ok ? (
            <div className="py-6">
              <IssueNote issue={list.issue} />
            </div>
          ) : list.data.rows.length === 0 ? (
            <EmptyState>{reportsPage.empty}</EmptyState>
          ) : (
            <ReportRows rows={list.data.rows} month={month.key} />
          )}
        </Card>

        {list.ok && list.data.untracked.length ? (
          <Card className="gap-4 xl:sticky xl:top-20">
            <CardHeader>
              <CardTitle className="font-display text-lg">{reportsPage.untracked.title}</CardTitle>
              <CardDescription>{reportsPage.untracked.body}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="divide-y">
                {list.data.untracked.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/admin/clients/${c.id}#tracking`}
                      className="hover:bg-accent focus-visible:ring-ring -mx-2 flex items-center justify-between gap-3 rounded-md px-2 py-2.5 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
                    >
                      <span className="truncate font-medium">{c.name}</span>
                      <span className="text-primary inline-flex shrink-0 items-center gap-1 text-xs font-medium">
                        {reportsPage.untracked.setup}
                        <TbArrowRight aria-hidden="true" className="size-3.5" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </>
  );
}
