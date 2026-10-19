import { overview } from "@/content/admin";
import type { Overview, ServiceSlice } from "@/lib/admin/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { EmptyState, IssueNote } from "./States";

const MAX_ROWS = 5;

/** Top services as bars. Past five, the rest fold into one row so the card stays short on a phone. */
function fold(slices: ServiceSlice[]): ServiceSlice[] {
  const tagged = slices.filter((s) => !s.untagged);
  const untagged = slices.find((s) => s.untagged);
  if (tagged.length <= MAX_ROWS) return slices;
  const rest = tagged.slice(MAX_ROWS - 1).reduce((t, s) => t + s.count, 0);
  return [...tagged.slice(0, MAX_ROWS - 1), { label: "Everything else", count: rest }, ...(untagged ? [untagged] : [])];
}

export function ServicesBreakdown({ data }: { data: Overview["services"] }) {
  const copy = overview.services;
  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="font-display text-lg">{copy.title}</CardTitle>
        <CardDescription>{copy.description}</CardDescription>
      </CardHeader>
      <CardContent className={data.ok ? undefined : "px-0"}>
        {!data.ok ? (
          <IssueNote issue={data.issue} />
        ) : data.data.total === 0 ? (
          <EmptyState>{copy.empty}</EmptyState>
        ) : (
          <ul className="flex flex-col gap-4">
            {fold(data.data.slices).map((s, i) => {
              const pct = (s.count / data.data.total) * 100;
              return (
                <li key={s.label}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className={s.untagged ? "text-muted-foreground truncate" : "truncate font-medium"}>{s.label}</span>
                    <span className="text-muted-foreground shrink-0 tabular-nums">
                      <span className="text-foreground font-semibold">{s.count}</span>
                      <span aria-hidden="true"> · </span>
                      <span className="sr-only">, </span>
                      {Math.round(pct)}%
                    </span>
                  </div>
                  <div aria-hidden="true" className="bg-muted mt-2 h-2 overflow-hidden rounded-full">
                    <div
                      className="animate-grow h-full rounded-full"
                      style={{
                        width: `${Math.max(pct, 2)}%`,
                        background: s.untagged ? "var(--input)" : `var(--chart-${(i % 4) + 1})`,
                        animationDelay: `${150 + i * 70}ms`,
                      }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
