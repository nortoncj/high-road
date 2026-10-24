import { TbBulb } from "react-icons/tb";
import { reportPage } from "@/content/admin";
import { num } from "@/lib/admin/format";
import type { SourceShare } from "@/lib/admin/report-logic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { cn } from "@/lib/admin/utils";

export function SourcesCard({ sources, className }: { sources: SourceShare[]; className?: string }) {
  const s = reportPage.sources;
  const hasGbp = sources.some((x) => x.id === "gbp");
  const hasGoogle = sources.some((x) => x.id === "google");
  return (
    <Card className={cn("gap-4", className)}>
      <CardHeader>
        <CardTitle className="font-display text-lg">{s.title}</CardTitle>
        <CardDescription>{s.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {sources.length === 0 ? (
          <p className="text-muted-foreground text-sm">{s.empty}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {sources.map((x, i) => (
              <li key={x.id} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate font-medium">{x.label}</span>
                  <span className="text-muted-foreground shrink-0 tabular-nums">
                    {num(x.visits)} <span className="text-foreground ml-1 font-semibold">{Math.round(x.share)}%</span>
                  </span>
                </div>
                <span className="bg-secondary block h-1.5 overflow-hidden rounded-full">
                  <span
                    className={cn("block h-full rounded-full", i === 0 ? "bg-primary" : "bg-sea-glass/60")}
                    style={{ width: `${Math.max(2, x.share)}%` }}
                  />
                </span>
              </li>
            ))}
          </ul>
        )}
        {hasGoogle && !hasGbp ? (
          <p className="bg-brass-soft text-brass-ink flex gap-2 rounded-lg px-3 py-2.5 text-xs leading-relaxed">
            <TbBulb aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {s.gbpTip}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
