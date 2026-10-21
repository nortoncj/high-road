import Link from "next/link";
import { TbArrowRight } from "react-icons/tb";
import { tasksPage } from "@/content/admin";
import type { Loaded } from "@/lib/admin/data";
import { dayNum } from "@/lib/admin/project-logic";
import type { Ref } from "@/lib/admin/task-parse";
import type { Todo } from "@/lib/admin/task-view";
import { cn } from "@/lib/admin/utils";
import { Button } from "@/components/admin/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { IssueNote } from "../States";
import { TodoList } from "./TodoList";

/** How far ahead the overview looks. Past that, it's the Tasks page's job. */
const HORIZON_DAYS = 7;
const MAX_ITEMS = 8;

/**
 * On the overview: what's late, due today, and due this week, oldest first. Same rows as the
 * Tasks page, so you can check things off or push them without leaving.
 */
export function UpcomingTasksCard({
  list,
  refs,
  className,
}: {
  list: Loaded<{ items: Todo[]; overdue: number; today: string }>;
  refs: Ref[];
  className?: string;
}) {
  const c = tasksPage.overviewCard;
  const soon = list.ok
    ? list.data.items.filter((t) => !t.done && t.dueDate && dayNum(t.dueDate) - dayNum(list.data.today) <= HORIZON_DAYS)
    : [];
  const shown = soon.slice(0, MAX_ITEMS);
  const overdue = list.ok ? list.data.overdue : 0;

  return (
    <Card className={cn("gap-4", className)}>
      <CardHeader>
        <CardTitle className="font-display text-lg">{c.title}</CardTitle>
        <CardDescription className={cn(overdue > 0 && "text-negative font-medium")}>
          {list.ok ? c.description(soon.length, overdue) : c.fallback}
        </CardDescription>
        <CardAction>
          <Button asChild variant="ghost" size="sm" className="text-primary -mr-2">
            <Link href="/admin/tasks">
              {c.all}
              <TbArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {!list.ok ? (
          <div className="-mx-4 sm:-mx-6">
            <IssueNote issue={list.issue} />
          </div>
        ) : shown.length === 0 ? (
          <p className="text-muted-foreground text-sm">{c.empty}</p>
        ) : (
          <>
            <TodoList items={shown} view="open" today={list.data.today} refs={refs} />
            {soon.length > shown.length ? (
              <Link href="/admin/tasks?view=upcoming" className="text-muted-foreground hover:text-primary text-xs">
                {c.more(soon.length - shown.length)}
              </Link>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
