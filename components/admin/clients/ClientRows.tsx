import Link from "next/link";
import { clientsPage } from "@/content/admin";
import type { Client } from "@/lib/admin/clients";
import { initials, shortDate, toDate, usd } from "@/lib/admin/format";
import { Avatar, AvatarFallback } from "@/components/admin/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/admin/ui/table";
import { ClientStatusBadge, HealthNote, PlanTag } from "./ClientBits";

function Next({ client, now }: { client: Client; now: Date }) {
  if (client.health !== "ok" && client.health !== "no-plan") return <HealthNote health={client.health} />;
  if (!client.nextChargeAt) return <span className="text-muted-foreground">—</span>;
  return (
    <time dateTime={client.nextChargeAt} className="text-muted-foreground tabular-nums">
      {shortDate(toDate(client.nextChargeAt), now)}
    </time>
  );
}

/** Table on tablet and up, stacked rows on a phone. Whole row is the link. */
export function ClientRows({ rows }: { rows: Client[] }) {
  const now = new Date();
  const c = clientsPage.columns;

  return (
    <>
      <div className="hidden md:block">
        <Table className="[&_tr>*:first-child]:pl-6 [&_tr>*:last-child]:pr-6">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{c.client}</TableHead>
              <TableHead>{c.plan}</TableHead>
              <TableHead className="text-right">{c.monthly}</TableHead>
              <TableHead>{c.next}</TableHead>
              <TableHead className="hidden text-right xl:table-cell">{c.since}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((cl) => (
              <TableRow key={cl.id} className="relative">
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8 rounded-lg">
                      <AvatarFallback className="bg-sea-foam text-primary rounded-lg text-xs font-semibold">
                        {initials(cl.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <span className="flex items-center gap-2">
                        <Link
                          href={`/admin/clients/${cl.id}`}
                          className="after:ring-ring truncate font-medium after:absolute after:inset-0 after:rounded-md hover:underline focus-visible:outline-none focus-visible:after:ring-2"
                        >
                          {cl.name}
                        </Link>
                        {/* Status only when it's news. On the Active tab every row would say Active. */}
                        {cl.status !== "active" ? <ClientStatusBadge status={cl.status} /> : null}
                      </span>
                      <p className="text-muted-foreground max-w-[26ch] truncate text-xs">
                        {[cl.contactName, cl.email].filter(Boolean).join(" · ") || "No contact on file"}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="max-w-[24ch]">
                  {cl.plans.length ? (
                    <div className="flex flex-col gap-0.5">
                      {cl.plans.map((p) => (
                        <PlanTag key={p.id} plan={p} />
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">{clientsPage.noPlan}</span>
                  )}
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {cl.monthlyCents ? usd(cl.monthlyCents) : <span className="text-muted-foreground font-normal">—</span>}
                </TableCell>
                <TableCell className="text-sm whitespace-nowrap">
                  <Next client={cl} now={now} />
                </TableCell>
                <TableCell className="text-muted-foreground hidden text-right text-sm tabular-nums xl:table-cell">
                  {shortDate(toDate(cl.onboardedOn ?? cl.createdAt), now)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul className="divide-border divide-y md:hidden">
        {rows.map((cl) => (
          <li key={cl.id}>
            <Link
              href={`/admin/clients/${cl.id}`}
              className="active:bg-accent focus-visible:bg-accent flex items-start gap-3 px-4 py-3.5 transition-colors focus-visible:outline-none"
            >
              <Avatar className="mt-0.5 size-9 rounded-lg">
                <AvatarFallback className="bg-sea-foam text-primary rounded-lg text-xs font-semibold">
                  {initials(cl.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate font-medium">{cl.name}</p>
                  <span className="shrink-0 text-sm font-semibold tabular-nums">
                    {cl.monthlyCents ? `${usd(cl.monthlyCents)}/mo` : ""}
                  </span>
                </div>
                <p className="text-muted-foreground truncate text-xs">{cl.planLabel ?? clientsPage.noPlan}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                  {cl.status !== "active" ? <ClientStatusBadge status={cl.status} /> : null}
                  <Next client={cl} now={now} />
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
