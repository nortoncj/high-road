import type { TrendPoint } from "@/lib/admin/report-logic";
import { num } from "@/lib/admin/format";
import { cn } from "@/lib/admin/utils";

/**
 * Twelve months as small bars, the report month in solid teal and the rest pale.
 * One series per chart on purpose: three small charts read faster than one busy one.
 * Screen readers get the numbers as text.
 */
export function TrendBars({
  points,
  pick,
  name,
  className,
}: {
  points: TrendPoint[];
  pick: (p: TrendPoint) => number;
  name: string;
  className?: string;
}) {
  const values = points.map(pick);
  const max = Math.max(1, ...values);
  const W = 240;
  const H = 44;
  const gap = 4;
  const bw = (W - gap * (values.length - 1)) / values.length;
  const last = values.length - 1;

  return (
    <figure className={cn("flex flex-col gap-1", className)}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-11 w-full overflow-visible" aria-hidden="true">
        {values.map((v, i) => {
          const h = v === 0 ? 1.5 : Math.max(3, (v / max) * H);
          return (
            <rect
              key={points[i].key}
              x={i * (bw + gap)}
              y={H - h}
              width={bw}
              height={h}
              rx={1.5}
              className={i === last ? "fill-primary" : v === 0 ? "fill-border" : "fill-sea-glass/35"}
            >
              <title>{`${points[i].label}: ${num(v)}`}</title>
            </rect>
          );
        })}
      </svg>
      <figcaption className="text-muted-foreground flex justify-between font-mono text-[10px] tracking-wide uppercase">
        <span>{points[0]?.short}</span>
        <span className="text-foreground">{points[last]?.short}</span>
      </figcaption>
      <p className="sr-only">
        {name} by month: {points.map((p, i) => `${p.label} ${values[i]}`).join(", ")}.
      </p>
    </figure>
  );
}
