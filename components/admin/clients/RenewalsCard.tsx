import Link from "next/link";
import type { IconType } from "react-icons";
import { TbAlertTriangle, TbCreditCardOff, TbHourglassLow, TbReceipt, TbRepeat } from "react-icons/tb";
import { clientsPage } from "@/content/admin";
import type { Renewal, RenewalKind } from "@/lib/admin/clients";
import { daysFrom, shortDate, toDate, usd } from "@/lib/admin/format";
import { cn } from "@/lib/admin/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { EmptyState } from "../States";

const kinds: Record<RenewalKind, { Icon: IconType; chip: string; row: string }> = {
  failed: { Icon: TbCreditCardOff, chip: "bg-negative-soft text-negative", row: "bg-negative-soft/50" },
  ending: { Icon: TbHourglassLow, chip: "bg-brass-soft text-brass-ink", row: "bg-brass-soft/40" },
  canceling: { Icon: TbAlertTriangle, chip: "bg-warning-soft text-warning", row: "" },
  manual: { Icon: TbReceipt, chip: "bg-warning-soft text-warning", row: "" },
  renews: { Icon: TbRepeat, chip: "bg-sea-foam text-primary", row: "" },
};

const MAX = 8;

/**
 * Monthly care plan charges are routine and get one quiet line each. The rows that matter
 * (failed cards, payment plans hitting month 12, cancellations, manual bills) sort to the top
 * with a hint about what to do.
 */
export function RenewalsCard({ items, className }: { items: Renewal[]; className?: string }) {
  const copy = clientsPage.renewals;
  const now = new Date();
  const shown = items.slice(0, MAX);
  const routine = items.filter((r) => r.kind === "renews");

  return (
    <Card className={cn("gap-4", className)}>
      <CardHeader>
        <CardTitle className="font-display text-lg">{copy.title}</CardTitle>
        <CardDescription>{copy.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {items.length === 0 ? (
          <EmptyState>{copy.empty}</EmptyState>
        ) : (
          <>
            <ul className="flex flex-col gap-1.5">
              {shown.map((r) => {
                const k = kinds[r.kind];
                const meta = copy.kinds[r.kind];
                const important = r.kind !== "renews";
                return (
                  <li key={r.id}>
                    <Link
                      href={`/admin/clients/${r.clientId}`}
                      className={cn(
                        "hover:bg-accent focus-visible:ring-ring flex items-start gap-3 rounded-lg p-2 transition-colors focus-visible:ring-2 focus-visible:outline-none",
                        k.row,
                      )}
                    >
                      <span className={cn("grid size-8 shrink-0 place-items-center rounded-full", k.chip)}>
                        <k.Icon aria-hidden="true" className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="truncate text-sm font-medium">{r.clientName}</span>
                          <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                            {r.at ? (
                              <time dateTime={r.at} title={shortDate(toDate(r.at), now)}>
                                {daysFrom(r.at, now)}
                              </time>
                            ) : null}
                          </span>
                        </span>
                        <span className="text-muted-foreground block truncate text-xs">
                          <span className={cn(important && "text-foreground font-medium")}>{meta.label}</span>
                          {" · "}
                          {r.planName}
                          {r.amountCents ? ` · ${usd(r.amountCents)}` : ""}
                        </span>
                        {important && meta.hint ? (
                          <span className="text-muted-foreground mt-0.5 block text-xs">{meta.hint}</span>
                        ) : null}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            {items.length > MAX ? (
              <p className="text-muted-foreground px-2 text-xs">+{items.length - MAX} more routine renewals</p>
            ) : null}
            {routine.length ? (
              <p className="text-muted-foreground border-t px-2 pt-3 text-xs tabular-nums">
                {usd(routine.reduce((t, r) => t + r.amountCents, 0))} in routine renewals over the next 30 days
              </p>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
