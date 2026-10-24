import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TbArrowLeft, TbExternalLink, TbMail } from "react-icons/tb";
import { reportPage } from "@/content/admin";
import { requireAdmin } from "@/lib/admin/auth";
import { brevoConfigured } from "@/lib/admin/brevo";
import { initials, shortDate, toDate } from "@/lib/admin/format";
import type { SearchParams } from "@/lib/admin/range";
import { emailReport } from "@/lib/admin/report-actions";
import { monthLabel, monthOptions } from "@/lib/admin/report-logic";
import { getClientReport } from "@/lib/admin/reports";
import { Avatar, AvatarFallback } from "@/components/admin/ui/avatar";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { IssueNote } from "@/components/admin/States";
import { MonthPicker } from "@/components/admin/reports/MonthPicker";
import { ReportActions } from "@/components/admin/reports/ReportActions";
import { SiteStatusLabel } from "@/components/admin/reports/ReportBits";
import { ReportStats } from "@/components/admin/reports/ReportStats";
import { SourcesCard } from "@/components/admin/reports/SourcesCard";
import { TopPagesCard } from "@/components/admin/reports/TopPagesCard";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<SearchParams> };
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const loaded = await getClientReport((await params).id, one((await searchParams).m));
  return { title: loaded?.ok ? `${loaded.data.client.name} report` : "Report" };
}

export default async function ClientReportPage({ params, searchParams }: Props) {
  await requireAdmin();
  const { id } = await params;
  const m = one((await searchParams).m);
  const loaded = await getClientReport(id, m);
  if (!loaded) notFound();

  const rp = reportPage;
  const back = (
    <Link href={`/admin/reports${m ? `?m=${m}` : ""}`} className="text-muted-foreground hover:text-foreground -mb-2 inline-flex w-fit items-center gap-1 text-sm">
      <TbArrowLeft aria-hidden="true" className="size-4" />
      {rp.back}
    </Link>
  );
  if (!loaded.ok) {
    return (
      <>
        {back}
        <Card className="py-6">
          <IssueNote issue={loaded.issue} />
        </Card>
      </>
    );
  }

  const r = loaded.data;
  const now = new Date();
  const sentThisMonth = r.sends.find((s) => s.month === r.month.key);
  const tracked = r.sites.length > 0;
  const worst = r.sites.find((s) => s.status === "quiet") ?? r.sites.find((s) => s.status === "waiting");
  const monthName = (key: string) => {
    const [y, mm] = key.split("-").map(Number);
    return monthLabel({ y, m: mm });
  };

  return (
    <>
      {back}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="size-12 rounded-xl">
            <AvatarFallback className="bg-sea-foam text-primary font-display rounded-xl text-base font-semibold">{initials(r.client.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h1 className="font-display truncate text-2xl font-semibold tracking-tight sm:text-3xl">{r.client.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-muted-foreground text-sm">{r.month.label}</span>
              {worst ? <SiteStatusLabel status={worst.status} /> : null}
              <Link href={`/admin/clients/${r.client.id}`} className="text-primary inline-flex items-center gap-1 text-xs font-medium hover:underline">
                Client page
                <TbExternalLink aria-hidden="true" className="size-3" />
              </Link>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <MonthPicker value={r.month.key} options={monthOptions(now)} />
          <ReportActions
            pdfHref={`/admin/reports/${r.client.id}/pdf?m=${r.month.key}`}
            monthLabel={r.month.label}
            suggestedTo={r.suggestedTo}
            sentThisMonth={sentThisMonth ? shortDate(toDate(sentThisMonth.sentAt), now) : null}
            emailReady={brevoConfigured()}
            disabled={!tracked}
            sendAction={emailReport.bind(null, r.client.id, r.month.key)}
          />
        </div>
      </div>

      {!tracked ? (
        <Card className="items-center gap-3 py-10 text-center">
          <p className="text-muted-foreground max-w-sm text-sm">{rp.noSites}</p>
          <Button asChild>
            <Link href={`/admin/clients/${r.client.id}#tracking`}>{rp.setupLink}</Link>
          </Button>
        </Card>
      ) : (
        <>
          <Card className="gap-3">
            <CardHeader>
              <CardTitle className="text-muted-foreground font-mono text-xs font-semibold tracking-[0.12em] uppercase">{rp.summaryTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="border-sea-glass text-base leading-relaxed sm:text-lg border-l-[3px] pl-4">{r.summary}</p>
            </CardContent>
          </Card>

          <ReportStats cur={r.cur} prev={r.prev} compareLabel={r.month.compareLabel} trend={r.trend} />

          <div className="grid grid-cols-1 items-start gap-4 sm:gap-6 lg:grid-cols-5">
            <TopPagesCard pages={r.pages} className="min-w-0 lg:col-span-3" />
            <div className="flex min-w-0 flex-col gap-4 sm:gap-6 lg:col-span-2">
              <SourcesCard sources={r.sources} />
              <Card className="gap-4">
                <CardHeader>
                  <CardTitle className="font-display text-lg">{rp.sends.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {r.sends.length === 0 ? (
                    <p className="text-muted-foreground text-sm">{rp.sends.empty}</p>
                  ) : (
                    <ul className="flex flex-col gap-2.5">
                      {r.sends.map((s) => (
                        <li key={s.id} className="flex items-start gap-2.5 text-sm">
                          <TbMail aria-hidden="true" className="text-sea-glass mt-0.5 size-4 shrink-0" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate">{rp.sends.line(monthName(s.month), s.toEmail)}</span>
                            <time dateTime={s.sentAt} className="text-muted-foreground text-xs">
                              {shortDate(toDate(s.sentAt), now)}
                            </time>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </>
  );
}
