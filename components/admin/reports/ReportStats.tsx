import type { IconType } from "react-icons";
import { TbChecklist, TbPhoneCall, TbUsers } from "react-icons/tb";
import { reportsPage } from "@/content/admin";
import { num } from "@/lib/admin/format";
import type { Counts, TrendPoint } from "@/lib/admin/report-logic";
import { Card, CardAction, CardContent, CardDescription, CardHeader } from "@/components/admin/ui/card";
import { ChangePill } from "./ReportBits";
import { TrendBars } from "./TrendBars";

type Key = "calls" | "forms" | "visits";
const keys: Key[] = ["calls", "forms", "visits"];
const icons: Record<Key, IconType> = { calls: TbPhoneCall, forms: TbChecklist, visits: TbUsers };

/** Calls, form fills, visits. With a 12 month trend on a client report, without one on the list. */
export function ReportStats({
  cur,
  prev,
  compareLabel,
  trend,
}: {
  cur: Counts;
  prev: Counts;
  compareLabel: string;
  trend?: TrendPoint[];
}) {
  return (
    <section aria-label="This month's numbers" className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
      {keys.map((k, i) => {
        const Icon = icons[k];
        const s = reportsPage.stats[k];
        return (
          <Card
            key={k}
            className="animate-in fade-in slide-in-from-bottom-1 fill-mode-both gap-3 py-4 duration-500 sm:py-5"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <CardHeader className="px-4 sm:px-5">
              <CardDescription className="text-xs font-medium sm:text-sm">
                {s.label}
                <span className="text-muted-foreground/80 block text-[11px] font-normal">{s.hint}</span>
              </CardDescription>
              <CardAction>
                <span className="bg-sea-foam text-primary grid size-8 place-items-center rounded-lg">
                  <Icon aria-hidden="true" className="size-4" />
                </span>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 px-4 sm:px-5">
              <div className="flex flex-wrap items-end gap-x-2.5 gap-y-1">
                <p className="font-display text-3xl leading-none font-semibold tracking-tight tabular-nums">{num(cur[k])}</p>
                <p className="flex items-center gap-1.5 text-xs">
                  <ChangePill cur={cur[k]} prev={prev[k]} />
                  <span className="text-muted-foreground">{compareLabel}</span>
                </p>
              </div>
              {trend ? <TrendBars points={trend} pick={(p) => p[k]} name={s.label} /> : null}
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
