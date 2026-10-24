import { TbMinus, TbTrendingDown, TbTrendingUp } from "react-icons/tb";
import { reportsPage } from "@/content/admin";
import { formatChange } from "@/lib/admin/report-logic";
import type { SiteStatus } from "@/lib/admin/reports";
import { cn } from "@/lib/admin/utils";

/** Up is teal, down is coral, flat is neutral. The arrow and the hidden word carry it without color. */
export function ChangePill({ cur, prev, size = "sm" }: { cur: number; prev: number; size?: "sm" | "xs" }) {
  const change = formatChange(cur, prev);
  if (change.dir === "none") return null;
  const flat = change.dir === "flat";
  const up = change.dir === "up";
  const Icon = flat ? TbMinus : up ? TbTrendingUp : TbTrendingDown;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold tabular-nums",
        size === "sm" ? "px-1.5 py-0.5 text-xs" : "px-1 text-[11px]",
        flat ? "bg-secondary text-secondary-foreground" : up ? "bg-positive-soft text-positive" : "bg-negative-soft text-negative",
      )}
    >
      <Icon aria-hidden="true" className={size === "sm" ? "size-3.5" : "size-3"} />
      <span className="sr-only">{flat ? "No change," : up ? "Up" : "Down"}</span>
      {change.text.replace(/^[+-]/, "")}
    </span>
  );
}

const dot: Record<SiteStatus, string> = {
  live: "bg-positive",
  quiet: "bg-coral",
  waiting: "bg-brass",
  paused: "bg-muted-foreground",
};

export function SiteStatusLabel({ status, className }: { status: SiteStatus; className?: string }) {
  const hint = status === "quiet" || status === "waiting" ? reportsPage.statusHint[status] : undefined;
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs", status === "quiet" ? "text-negative" : "text-muted-foreground", className)} title={hint}>
      <span aria-hidden="true" className={cn("size-1.5 shrink-0 rounded-full", dot[status], status === "live" && "animate-pulse")} />
      {reportsPage.status[status]}
    </span>
  );
}
