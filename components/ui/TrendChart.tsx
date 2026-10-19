import styles from "./TrendChart.module.css";

export type TrendSeries = { name: string; values: number[]; /** Paint coral (chart-5). */ risk?: boolean };

export type TrendChartProps = {
  title?: string;
  subtitle?: string;
  labels: string[];
  /** At most five. Extra series are dropped. */
  series: TrendSeries[];
  /** Single series only: sea-glass fill fading to transparent under the line. */
  area?: boolean;
  height?: number;
  /** false starts the y-axis at the data minimum. Leave counts and money at zero. */
  zero?: boolean;
  format?: (n: number) => string;
  className?: string;
};

function niceTicks(min: number, max: number, count: number) {
  const span = max - min || 1;
  const raw = span / count;
  let step = 10 ** Math.floor(Math.log10(raw));
  const err = raw / step;
  if (err >= 7.5) step *= 10;
  else if (err >= 3.5) step *= 5;
  else if (err >= 1.5) step *= 2;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Math.round(v * 1e6) / 1e6);
  return ticks;
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

/** Up to five series over time, labelled at the line ends instead of a legend. */
export function TrendChart({
  title,
  subtitle,
  labels,
  series: all,
  area = false,
  height = 240,
  zero = true,
  format = (n) => n.toLocaleString("en-US"),
  className,
}: TrendChartProps) {
  const series = all.slice(0, 5);
  const isArea = area && series.length === 1;
  const W = 640;
  const H = height;
  const L = 44;
  const R = isArea ? 24 : 132;
  const T = 12;
  const B = 28;
  const values = series.flatMap((s) => s.values);
  const lo = zero ? Math.min(0, ...values) : Math.min(...values);
  const ticks = niceTicks(lo, Math.max(...values), 4);
  const y0 = ticks[0];
  const y1 = ticks[ticks.length - 1];
  const n = labels.length;
  const pw = W - L - R;
  const ph = H - T - B;
  const x = (i: number) => L + (n > 1 ? (i * pw) / (n - 1) : pw / 2);
  const y = (v: number) => T + ph - ((v - y0) / (y1 - y0 || 1)) * ph;
  const gradId = `tc-${slug(title ?? "chart")}`;
  const colorOf = (s: TrendSeries, i: number) => (s.risk ? 5 : i + 1);

  // End labels, nudged apart so they never collide
  const ends = series
    .map((s, i) => ({ i, c: colorOf(s, i), name: s.name, y: y(s.values[s.values.length - 1]) }))
    .sort((a, b) => a.y - b.y);
  for (let k = 1; k < ends.length; k++) {
    if (ends[k].y - ends[k - 1].y < 16) ends[k].y = ends[k - 1].y + 16;
  }

  return (
    <figure className={[styles.chart, className].filter(Boolean).join(" ")}>
      {title ? (
        <figcaption className={styles.caption}>
          <span className={styles.title}>{title}</span>
          {subtitle ? <span className={styles.subtitle}>{subtitle}</span> : null}
        </figcaption>
      ) : null}
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title ?? "Trend chart"} className={styles.svg}>
        {isArea ? (
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" className={styles.stopA} />
              <stop offset="100%" className={styles.stopB} />
            </linearGradient>
          </defs>
        ) : null}

        {ticks.map((t) => (
          <g key={t}>
            <line className={styles.grid} x1={L} x2={W - R + (isArea ? 0 : 8)} y1={y(t)} y2={y(t)} />
            <text className={styles.axis} x={L - 10} y={y(t) + 4} textAnchor="end">
              {format(t)}
            </text>
          </g>
        ))}

        {labels.map((lab, i) => (
          <text
            key={lab}
            className={styles.axis}
            x={x(i)}
            y={H - 6}
            textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"}
          >
            {lab}
          </text>
        ))}

        {series.map((s, i) => {
          const d = s.values.map((v, j) => `${j ? "L" : "M"}${x(j).toFixed(1)} ${y(v).toFixed(1)}`).join("");
          const last = s.values.length - 1;
          return (
            <g key={s.name} data-series={colorOf(s, i)} className={styles.series}>
              {isArea ? (
                <path d={`${d}L${x(last)} ${y(y0)}L${x(0)} ${y(y0)}Z`} fill={`url(#${gradId})`} stroke="none" />
              ) : null}
              <path className={styles.line} d={d} />
              <circle className={styles.end} cx={x(last)} cy={y(s.values[last])} r={4} />
            </g>
          );
        })}

        {!isArea
          ? ends.map((e) => (
              <g key={e.name} data-series={e.c} className={styles.series}>
                <circle className={styles.dot} cx={W - R + 22} cy={e.y} r={4} />
                <text className={styles.label} x={W - R + 32} y={e.y + 4}>
                  {e.name}
                </text>
              </g>
            ))
          : null}
      </svg>
    </figure>
  );
}
