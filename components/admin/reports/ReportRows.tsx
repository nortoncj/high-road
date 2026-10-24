import Link from "next/link";
import { TbCircleCheckFilled } from "react-icons/tb";
import { reportsPage } from "@/content/admin";
import { initials, num, shortDate, toDate } from "@/lib/admin/format";
import type { Counts } from "@/lib/admin/report-logic";
import type { ReportRow } from "@/lib/admin/reports";
import { Avatar, AvatarFallback } from "@/components/admin/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/admin/ui/table";
import { ChangePill, SiteStatusLabel } from "./ReportBits";

function Sent({ at, now }: { at: string | null; now: Date }) {
  if (!at) return <span className="text-muted-foreground text-xs">{reportsPage.notSent}</span>;
  return (
    <span className="text-positive inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap">
      <TbCircleCheckFilled aria-hidden="true" className="size-3.5" />
      {reportsPage.sent(shortDate(toDate(at), now))}
    </span>
  );
}

function Metric({ row, k }: { row: ReportRow; k: keyof Counts }) {
  return (
    <span className="inline-flex items-center justify-end gap-2">
      <span className="font-semibold tabular-nums">{num(row.cur[k])}</span>
      <ChangePill cur={row.cur[k]} prev={row.prev[k]} size="xs" />
    </span>
  );
}

/** Table on tablet and up, stacked rows on a phone. Whole row opens the client's report. */
export function ReportRows({ rows, month }: { rows: ReportRow[]; month: string }) {
  const now = new Date();
  const c = reportsPage.columns;
  const href = (id: string) => `/admin/reports/${id}?m=${month}`;

  return (
    <>
      <div className="hidden md:block">
        <Table className="[&_tr>*:first-child]:pl-6 [&_tr>*:last-child]:pr-6">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{c.client}</TableHead>
              <TableHead className="text-right">{c.calls}</TableHead>
              <TableHead className="text-right">{c.forms}</TableHead>
              <TableHead className="text-right">{c.visits}</TableHead>
              <TableHead className="text-right">{c.sent}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.client.id} className="relative">
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8 rounded-lg">
                      <AvatarFallback className="bg-sea-foam text-primary rounded-lg text-xs font-semibold">
                        {initials(r.client.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <Link
                        href={href(r.client.id)}
                        className="after:ring-ring block truncate font-medium after:absolute after:inset-0 after:rounded-md hover:underline focus-visible:outline-none focus-visible:after:ring-2"
                      >
                        {r.client.name}
                      </Link>
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="text-muted-foreground max-w-[22ch] truncate text-xs">{r.sites.map((s) => s.domain).join(", ")}</span>
                        {r.status !== "live" ? <SiteStatusLabel status={r.status} /> : null}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Metric row={r} k="calls" />
                </TableCell>
                <TableCell className="text-right">
                  <Metric row={r} k="forms" />
                </TableCell>
                <TableCell className="text-right">
                  <Metric row={r} k="visits" />
                </TableCell>
                <TableCell className="text-right">
                  <Sent at={r.sentAt} now={now} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul className="divide-border divide-y md:hidden">
        {rows.map((r) => (
          <li key={r.client.id}>
            <Link
              href={href(r.client.id)}
              className="active:bg-accent focus-visible:bg-accent flex flex-col gap-2 px-4 py-3.5 transition-colors focus-visible:outline-none"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-medium">{r.client.name}</p>
                  {r.status !== "live" ? <SiteStatusLabel status={r.status} /> : null}
                </div>
                <Sent at={r.sentAt} now={now} />
              </div>
              <dl className="grid grid-cols-3 gap-2 text-xs">
                {(["calls", "forms", "visits"] as const).map((k) => (
                  <div key={k} className="bg-secondary/60 rounded-lg px-2.5 py-2">
                    <dt className="text-muted-foreground">{c[k]}</dt>
                    <dd className="mt-0.5 flex flex-wrap items-center gap-1.5">
                      <span className="text-sm font-semibold tabular-nums">{num(r.cur[k])}</span>
                      <ChangePill cur={r.cur[k]} prev={r.prev[k]} size="xs" />
                    </dd>
                  </div>
                ))}
              </dl>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
