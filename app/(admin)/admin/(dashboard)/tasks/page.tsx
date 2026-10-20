import type { Metadata } from "next";
import Link from "next/link";
import { tasksPage } from "@/content/admin";
import { requireAdmin } from "@/lib/admin/auth";
import type { SearchParams } from "@/lib/admin/range";
import { listTodos, taskRefs } from "@/lib/admin/tasks";
import { todoViews, type TodoView } from "@/lib/admin/task-view";
import { cn } from "@/lib/admin/utils";
import { PageHeader } from "@/components/admin/PageHeader";
import { IssueNote } from "@/components/admin/States";
import { QuickAdd } from "@/components/admin/tasks/QuickAdd";
import { TodoList } from "@/components/admin/tasks/TodoList";

export const metadata: Metadata = { title: tasksPage.meta.title };

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/**
 * /admin/tasks            Today: overdue + due today
 * /admin/tasks?view=...   upcoming | someday | done
 * /admin/tasks?add=1      opens with the keyboard up. Save THIS one to your phone's home screen.
 * /admin/tasks?add=Call%20Dana%20tomorrow   prefills the box (for an iPhone Shortcut with dictation).
 */
export default async function AdminTasksPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin();
  const p = await searchParams;
  const raw = one(p.view);
  const view: TodoView = todoViews.includes(raw as TodoView) ? (raw as TodoView) : "today";
  const [list, refs] = await Promise.all([listTodos(), taskRefs()]);
  const add = one(p.add);
  const prefill = add && add !== "1" ? add.slice(0, 300) : "";

  return (
    // Bottom padding on phones so the docked quick-add bar never covers the last task.
    <div className="flex flex-col gap-5 pb-28 sm:gap-6 sm:pb-0">
      <PageHeader
        title={tasksPage.title}
        description={
          list.ok && list.data.overdue
            ? `${list.data.overdue} overdue. Knock those out or push them.`
            : tasksPage.description
        }
      />

      {list.ok ? <QuickAdd refs={refs} today={list.data.today} autoFocus={Boolean(add)} initialText={prefill} dock /> : null}

      <nav aria-label="Task views" className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
        <ul className="bg-secondary flex w-max gap-1 rounded-lg p-1">
          {todoViews.map((v) => {
            const active = v === view;
            const count = list.ok ? list.data.counts[v] : undefined;
            const late = v === "today" && list.ok && list.data.overdue > 0;
            return (
              <li key={v}>
                <Link
                  href={v === "today" ? "/admin/tasks" : `/admin/tasks?view=${v}`}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:outline-none",
                    active && "bg-card text-foreground shadow-sm",
                  )}
                >
                  {tasksPage.tabs[v]}
                  {count !== undefined && v !== "done" ? (
                    <span
                      className={cn(
                        "rounded-full px-1.5 text-xs tabular-nums",
                        late ? "bg-negative-soft text-negative font-semibold" : "opacity-80",
                      )}
                    >
                      {count}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {!list.ok ? (
        <IssueNote issue={list.issue} />
      ) : (
        <TodoList items={list.data.items} view={view} today={list.data.today} refs={refs} />
      )}
    </div>
  );
}
