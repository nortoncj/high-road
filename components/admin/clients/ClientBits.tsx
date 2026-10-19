import type { IconType } from "react-icons";
import { TbAlertTriangle, TbCalendarDue, TbCreditCardOff, TbHourglassLow, TbReceipt } from "react-icons/tb";
import type { ClientHealth, ClientPlan } from "@/lib/admin/clients";
import { clientStatusMeta, planKindLabel, projectStatusMeta, type ClientStatus, type ProjectStatus } from "@/lib/admin/schema";
import { cn } from "@/lib/admin/utils";
import { Badge } from "@/components/admin/ui/badge";

export function ClientStatusBadge({ status, className }: { status: ClientStatus; className?: string }) {
  const meta = clientStatusMeta[status];
  return (
    <Badge variant="outline" className={cn("shrink-0 gap-1.5 border-transparent font-medium", meta.className, className)}>
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current opacity-80" />
      {meta.label}
    </Badge>
  );
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const meta = projectStatusMeta[status];
  return (
    <Badge variant="outline" className={cn("shrink-0 border-transparent font-medium", meta.className)}>
      {meta.label}
    </Badge>
  );
}

/** Plan name with a quiet tag for what kind it is. Payment plans get brass: they're the ones that end. */
export function PlanTag({ plan }: { plan: ClientPlan }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <span className="truncate font-medium">{plan.name}</span>
      <span
        className={cn(
          "shrink-0 rounded px-1 py-px font-mono text-[10px] tracking-wide uppercase",
          plan.kind === "build" ? "bg-brass-soft text-brass-ink" : "bg-secondary text-muted-foreground",
        )}
      >
        {plan.source === "manual" ? "Manual" : plan.kind === "build" ? "12 mo" : planKindLabel[plan.kind].split(" ")[0]}
      </span>
    </span>
  );
}

const healthMeta: Partial<Record<ClientHealth, { label: string; Icon: IconType; className: string }>> = {
  failed: { label: "Payment failed", Icon: TbCreditCardOff, className: "text-negative" },
  canceling: { label: "Canceling", Icon: TbAlertTriangle, className: "text-warning" },
  ending: { label: "Plan ending", Icon: TbHourglassLow, className: "text-brass-ink" },
  "manual-due": { label: "Bill them", Icon: TbReceipt, className: "text-warning" },
};

/** Only shows when something needs you. "ok" and "no plan" render nothing. */
export function HealthNote({ health, className }: { health: ClientHealth; className?: string }) {
  const meta = healthMeta[health];
  if (!meta) return null;
  const { Icon } = meta;
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium", meta.className, className)}>
      <Icon aria-hidden="true" className="size-3.5 shrink-0" />
      {meta.label}
    </span>
  );
}

export const NextIcon = TbCalendarDue;
