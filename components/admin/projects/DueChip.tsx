import { TbCalendarDue, TbClockExclamation } from "react-icons/tb";
import { dueLabel } from "@/lib/admin/project-logic";
import { cn } from "@/lib/admin/utils";

/** "3 days late" in coral, "Due Thu" in warning, anything further out stays quiet. */
export function DueChip({ due, today, className }: { due: string; today: string; className?: string }) {
  const { text, tone } = dueLabel(due, today);
  const Icon = tone === "late" ? TbClockExclamation : TbCalendarDue;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium tabular-nums",
        tone === "late" && "bg-negative-soft text-negative",
        tone === "soon" && "bg-warning-soft text-warning",
        tone === "normal" && "bg-secondary text-muted-foreground",
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-3.5" />
      {text}
    </span>
  );
}
