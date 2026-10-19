import Link from "next/link";
import { TbArrowRight } from "react-icons/tb";
import { overview } from "@/content/admin";
import type { Overview } from "@/lib/admin/data";
import { cn } from "@/lib/admin/utils";
import { Button } from "@/components/admin/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { LeadRows } from "./LeadRows";
import { EmptyState, IssueNote } from "./States";

export function LeadsCard({ data, className }: { data: Overview["recentLeads"]; className?: string }) {
  const copy = overview.leadsCard;
  return (
    <Card className={cn("gap-4 pb-2", className)}>
      <CardHeader>
        <CardTitle className="font-display text-lg">{copy.title}</CardTitle>
        {data.ok ? <CardDescription>{copy.description(data.data.total)}</CardDescription> : null}
        <CardAction>
          <Button asChild variant="ghost" size="sm" className="text-primary -mr-2">
            <Link href="/admin/leads">
              <span className="hidden sm:inline">{copy.viewAll}</span>
              <span className="sm:hidden">All</span>
              <TbArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="px-0">
        {!data.ok ? (
          <IssueNote issue={data.issue} />
        ) : data.data.rows.length === 0 ? (
          <EmptyState>{copy.empty}</EmptyState>
        ) : (
          <LeadRows rows={data.data.rows} />
        )}
      </CardContent>
    </Card>
  );
}
