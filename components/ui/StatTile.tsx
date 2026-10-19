import styles from "./StatTile.module.css";

export type StatTileProps = {
  label: string;
  value: number | string;
  unit?: string;
  /** Signed percent change, shown with an arrow and the word up or down. */
  delta?: number;
  /** Which direction is good news. Response time, cost and refunds go "down". */
  goodWhen?: "up" | "down";
  /** Short comparison, e.g. "vs Sept". */
  context?: string;
  /** Recent values for the sparkline, oldest first. */
  trend?: number[];
  /** Sparkline color, chart-1 to chart-4. Defaults to teal, or coral on bad news. */
  series?: 1 | 2 | 3 | 4 | 5;
  /** Brass number. One per row, for the premium metric. */
  featured?: boolean;
  className?: string;
};

const fmt = (v: number | string) => (typeof v === "number" ? v.toLocaleString("en-US") : v);

/** KPI card: one number an owner cares about, how it moved, and where it's heading. */
export function StatTile({
  label,
  value,
  unit,
  delta,
  goodWhen = "up",
  context,
  trend,
  series,
  featured,
  className,
}: StatTileProps) {
  let state: "good" | "bad" | "flat" = "flat";
  let arrow = "→";
  let word = "flat";
  if (typeof delta === "number" && delta !== 0) {
    const up = delta > 0;
    state = up === (goodWhen === "up") ? "good" : "bad";
    arrow = up ? "↑" : "↓";
    word = up ? "up" : "down";
  }
  const sparkSeries = series ?? (state === "bad" ? 5 : 1);

  return (
    <div className={[styles.tile, featured ? styles.featured : "", className].filter(Boolean).join(" ")}>
      <p className={styles.label}>{label}</p>
      <p className={styles.value}>
        {fmt(value)}
        {unit ? <span className={styles.unit}>{unit}</span> : null}
      </p>
      <div className={styles.foot}>
        {typeof delta === "number" ? (
          <p className={styles.delta} data-state={state}>
            <span aria-hidden="true">{arrow}</span>
            <span>
              {word} {Math.abs(delta).toFixed(1)}%
            </span>
            {context ? <span className={styles.context}>{context}</span> : null}
          </p>
        ) : (
          <span />
        )}
        {trend && trend.length > 1 ? <Spark values={trend} series={sparkSeries} /> : null}
      </div>
    </div>
  );
}

function Spark({ values, series }: { values: number[]; series: number }) {
  const W = 96;
  const H = 32;
  const min = Math.min(...values);
  const span = Math.max(...values) - min || 1;
  const pts = values.map((y, i) => [i * (W / (values.length - 1)), H - 3 - ((y - min) / span) * (H - 6)]);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join("");
  const [lx, ly] = pts[pts.length - 1];
  return (
    <svg className={styles.spark} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" data-series={series}>
      <path className={styles.area} d={`${line}L${W} ${H}L0 ${H}Z`} />
      <path className={styles.line} d={line} />
      <circle className={styles.end} cx={lx} cy={ly} r={3.5} />
    </svg>
  );
}
