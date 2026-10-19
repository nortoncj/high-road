import { leadStatusMeta, type LeadStatus } from "@/lib/admin/schema";
import { cn } from "@/lib/admin/utils";
import { Badge } from "@/components/admin/ui/badge";

export function StatusBadge({ status, className }: { status: LeadStatus; className?: string }) {
  const meta = leadStatusMeta[status];
  return (
    <Badge variant="outline" className={cn("shrink-0 gap-1.5 border-transparent font-medium", meta.className, className)}>
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current opacity-80" />
      {meta.label}
    </Badge>
  );
}
