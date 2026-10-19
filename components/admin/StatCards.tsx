import type { IconType } from "react-icons";
import { TbCash, TbDatabaseOff, TbFolders, TbMinus, TbTrendingDown, TbTrendingUp, TbUserPlus, TbUsers } from "react-icons/tb";
import { overview } from "@/content/admin";
import type { Kpi } from "@/lib/admin/data";
import { formatPct, num, usd } from "@/lib/admin/format";
import { cn } from "@/lib/admin/utils";
import { Card, CardAction, CardContent, CardDescription, CardHeader } from "@/components/admin/ui/card";

const icons: Record<Kpi["key"], IconType> = {
  leads: TbUserPlus,
  clients: TbUsers,
  projects: TbFolders,
  revenue: TbCash,
};

export function StatCards({ kpis, compareLabel }: { kpis: Kpi[]; compareLabel: string }) {
  return (
    <section aria-label="Key numbers" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      {kpis.map((kpi, i) => (
        <StatCard key={kpi.key} kpi={kpi} compareLabel={compareLabel} index={i} />
      ))}
    </section>
  );
}

function StatCard({ kpi, compareLabel, index }: { kpi: Kpi; compareLabel: string; index: number }) {
  const Icon = icons[kpi.key];
  // Brass is the luxury accent, and the DS saves it for one featured number. Money gets it.
  const featured = kpi.key === "revenue";
  const value = kpi.value === null ? "—" : kpi.format === "usd" ? usd(kpi.value, true) : num(kpi.value);

  return (
    <Card
      className="animate-in fade-in slide-in-from-bottom-1 fill-mode-both gap-3 py-4 duration-500 sm:py-5"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <CardHeader className="px-4 sm:px-5">
        <CardDescription className="text-muted-foreground text-xs font-medium sm:text-sm">{kpi.label}</CardDescription>
        <CardAction>
          <span className="bg-sea-foam text-primary grid size-8 place-items-center rounded-lg">
            <Icon aria-hidden="true" className="size-4" />
          </span>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-1.5 px-4 sm:px-5">
        <p
          className={cn(
            "font-display text-2xl leading-none font-semibold tracking-tight tabular-nums sm:text-3xl",
            featured && kpi.value !== null && "text-brass",
          )}
        >
          {value}
        </p>
        {kpi.issue ? (
          <p className="text-muted-foreground flex items-center gap-1 text-xs" title={kpi.issue.message}>
            <TbDatabaseOff aria-hidden="true" className="size-3.5 shrink-0" />
            {kpi.issue.missing ? `No ${kpi.issue.table} table yet` : `Couldn't load ${kpi.issue.table}`}
          </p>
        ) : kpi.change !== undefined ? (
          <Delta change={kpi.change} compareLabel={compareLabel} />
        ) : kpi.note ? (
          <p className="text-muted-foreground text-xs">{kpi.note}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function Delta({ change, compareLabel }: { change: number | null; compareLabel: string }) {
  if (change === null) return <p className="text-muted-foreground text-xs">{overview.noPrev}</p>;

  const flat = Math.abs(change) < 0.5;
  const up = change > 0;
  const Icon = flat ? TbMinus : up ? TbTrendingUp : TbTrendingDown;
  // Coral is for bad news only. Up is teal, flat is neutral, and the arrow + word carry it for anyone who can't see color.
  const tone = flat
    ? "bg-secondary text-secondary-foreground"
    : up
      ? "bg-positive-soft text-positive"
      : "bg-negative-soft text-negative";

  return (
    <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs">
      <span className={cn("inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-semibold tabular-nums", tone)}>
        <Icon aria-hidden="true" className="size-3.5" />
        <span className="sr-only">{flat ? "No change," : up ? "Up" : "Down"}</span>
        {formatPct(change)}
      </span>
      <span className="text-muted-foreground">{compareLabel}</span>
    </p>
  );
}
