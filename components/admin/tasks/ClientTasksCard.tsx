import Link from "next/link";
import { TbArrowRight } from "react-icons/tb";
import { tasksPage } from "@/content/admin";
import type { Loaded } from "@/lib/admin/data";
import type { Ref } from "@/lib/admin/task-parse";
import type { Todo } from "@/lib/admin/task-view";
import { Button } from "@/components/admin/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { IssueNote } from "../States";
import { QuickAdd } from "./QuickAdd";
import { TodoList } from "./TodoList";

/** On a client's page: their open tasks, and quick add that's already linked to them. */
export function ClientTasksCard({
  client,
  todos,
  refs,
  today,
}: {
  client: { id: string; name: string };
  todos: Loaded<Todo[]>;
  refs: Ref[];
  today: string;
}) {
  const c = tasksPage.clientCard;
  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="font-display text-lg">{c.title}</CardTitle>
        <CardAction>
          <Button asChild variant="ghost" size="sm" className="text-primary -mr-2">
            <Link href="/admin/tasks">
              {c.all}
              <TbArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <QuickAdd refs={refs} today={today} lockedClient={client} />
        {!todos.ok ? (
          <div className="-mx-4 sm:-mx-6">
            <IssueNote issue={todos.issue} />
          </div>
        ) : todos.data.length === 0 ? (
          <p className="text-muted-foreground text-sm">{c.empty}</p>
        ) : (
          <TodoList items={todos.data} view="open" today={today} refs={refs} />
        )}
      </CardContent>
    </Card>
  );
}
