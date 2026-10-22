import Link from "next/link";
import type { IconType } from "react-icons";
import { TbCalendarEvent, TbMessage, TbUserPlus, TbWorld } from "react-icons/tb";
import { leadsPage } from "@/content/admin";
import type { Lead } from "@/lib/admin/data";
import { fullDateTime, initials, relativeTime } from "@/lib/admin/format";
import { leadSourceLabel, type LeadSource } from "@/lib/admin/schema";
import { Avatar, AvatarFallback } from "@/components/admin/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/admin/ui/table";
import { StatusBadge } from "./StatusBadge";

const sourceIcon: Record<LeadSource, IconType> = {
  calendly: TbCalendarEvent,
  contact_form: TbMessage,
  home_form: TbUserPlus,
  other: TbWorld,
};

/** Opens the lead's details on the Leads page. `query` keeps the current filters. */
function leadHref(id: string, query: string) {
  return `/admin/leads?${query ? `${query}&` : ""}lead=${encodeURIComponent(id)}`;
}

/**
 * Leads as a table on tablet and up, and as stacked rows on a phone.
 * Both are rendered and CSS picks one, so there's no layout jump while JS loads.
 * The whole row is the link (stretched ::after), so you don't have to hit the name exactly.
 */
export function LeadRows({ rows, query = "" }: { rows: Lead[]; query?: string }) {
  const now = new Date();
  const c = leadsPage.columns;

  return (
    <>
      <div className="hidden md:block">
        <Table className="[&_tr>*:first-child]:pl-6 [&_tr>*:last-child]:pr-6">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{c.lead}</TableHead>
              <TableHead>{c.service}</TableHead>
              <TableHead className="hidden lg:table-cell">{c.source}</TableHead>
              <TableHead>{c.status}</TableHead>
              <TableHead className="text-right">{c.date}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((lead) => {
              const SourceIcon = sourceIcon[lead.source];
              const at = new Date(lead.createdAt);
              return (
                <TableRow key={lead.id} className="relative">
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-semibold">
                          {initials(lead.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <Link
                          href={leadHref(lead.id, query)}
                          scroll={false}
                          className="after:ring-ring font-medium after:absolute after:inset-0 after:rounded-md hover:underline focus-visible:outline-none focus-visible:after:ring-2"
                        >
                          {lead.name}
                        </Link>
                        <p className="text-muted-foreground max-w-[22ch] truncate text-xs lg:max-w-[32ch]">{lead.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-[18ch] truncate">{lead.service ?? "—"}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-muted-foreground inline-flex items-center gap-1.5 text-sm">
                      <SourceIcon aria-hidden="true" className="size-4" />
                      {leadSourceLabel[lead.source]}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={lead.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-right text-sm whitespace-nowrap tabular-nums">
                    <time dateTime={lead.createdAt} title={fullDateTime(at)}>
                      {relativeTime(at, now)}
                    </time>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <ul className="divide-border divide-y md:hidden">
        {rows.map((lead) => {
          const SourceIcon = sourceIcon[lead.source];
          const at = new Date(lead.createdAt);
          return (
            <li key={lead.id}>
              <Link
                href={leadHref(lead.id, query)}
                scroll={false}
                className="active:bg-accent focus-visible:bg-accent flex items-start gap-3 px-4 py-3.5 transition-colors focus-visible:outline-none"
              >
                <Avatar className="mt-0.5 size-9">
                  <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-semibold">
                    {initials(lead.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate font-medium">{lead.name}</p>
                    <StatusBadge status={lead.status} />
                  </div>
                  <p className="text-muted-foreground truncate text-xs">{lead.email}</p>
                  <p className="text-muted-foreground mt-1.5 flex items-center gap-1.5 text-xs">
                    <SourceIcon aria-label={leadSourceLabel[lead.source]} className="size-3.5 shrink-0" />
                    <span className="truncate">{lead.service ?? leadSourceLabel[lead.source]}</span>
                    <span aria-hidden="true">·</span>
                    <time dateTime={lead.createdAt} className="shrink-0 tabular-nums">
                      {relativeTime(at, now)}
                    </time>
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
