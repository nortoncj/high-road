import Link from "next/link";
import type { IconType } from "react-icons";
import { TbArrowsExchange, TbCash, TbCircleCheck, TbUserPlus } from "react-icons/tb";
import { overview } from "@/content/admin";
import type { ActivityItem } from "@/lib/admin/data";
import { fullDateTime, relativeTime } from "@/lib/admin/format";
import { cn } from "@/lib/admin/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { EmptyState } from "./States";

const kinds: Record<ActivityItem["kind"], { Icon: IconType; className: string }> = {
  lead: { Icon: TbUserPlus, className: "bg-brass-soft text-brass-ink" },
  status: { Icon: TbArrowsExchange, className: "bg-sea-foam text-primary" },
  payment: { Icon: TbCash, className: "bg-positive-soft text-positive" },
  project: { Icon: TbCircleCheck, className: "bg-secondary text-secondary-foreground" },
};

export function RecentActivity({ items }: { items: ActivityItem[] }) {
  const now = new Date();
  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="font-display text-lg">{overview.activity.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState>{overview.activity.empty}</EmptyState>
        ) : (
          <ol className="before:bg-border relative flex flex-col gap-5 before:absolute before:top-3 before:bottom-3 before:left-4 before:w-px">
            {items.map((item) => {
              const { Icon, className } = kinds[item.kind];
              const at = new Date(item.at);
              return (
                <li key={item.id} className="relative flex gap-3">
                  <span
                    className={cn("ring-card relative z-10 grid size-8 shrink-0 place-items-center rounded-full ring-4", className)}
                  >
                    <Icon aria-hidden="true" className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1 pt-1">
                    <p className="text-sm leading-snug font-medium">
                      {item.href ? (
                        <Link href={item.href} className="hover:underline">
                          {item.title}
                        </Link>
                      ) : (
                        item.title
                      )}
                    </p>
                    {item.detail ? <p className="text-muted-foreground truncate text-xs">{item.detail}</p> : null}
                  </div>
                  <time
                    dateTime={item.at}
                    title={fullDateTime(at)}
                    className="text-muted-foreground shrink-0 pt-1 text-xs whitespace-nowrap tabular-nums"
                  >
                    {relativeTime(at, now)}
                  </time>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
