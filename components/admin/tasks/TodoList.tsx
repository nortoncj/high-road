"use client";

import Link from "next/link";
import { useState, useTransition, type ChangeEvent } from "react";
import { toast } from "sonner";
import { TbCalendarEvent, TbDots, TbFolders, TbListCheck, TbUsers } from "react-icons/tb";
import { tasksPage } from "@/content/admin";
import { addDays, dayNum, dueLabel } from "@/lib/admin/project-logic";
import { rescheduleTodo, toggleTodo, type TodoResult } from "@/lib/admin/task-actions";
import type { Ref } from "@/lib/admin/task-parse";
import { sortTodos, viewOf, type Todo, type TodoView } from "@/lib/admin/task-view";
import { cn } from "@/lib/admin/utils";
import { Button } from "@/components/admin/ui/button";
import { Checkbox } from "@/components/admin/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/admin/ui/dropdown-menu";
import { EmptyState } from "../States";
import { TaskSheet } from "./TaskSheet";

type Section = { key: string; label: string | null; tone?: "late"; items: Todo[] };

const dayHeading = (key: string, today: string) => {
  const diff = dayNum(key) - dayNum(today);
  if (diff === 1) return "Tomorrow";
  const opts: Intl.DateTimeFormatOptions =
    diff < 7 ? { weekday: "long", timeZone: "UTC" } : { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" };
  return new Date(`${key}T12:00:00Z`).toLocaleDateString("en-US", opts);
};

function sectionsFor(view: TodoView | "open", items: Todo[], today: string): Section[] {
  const s = tasksPage.sections;
  if (view === "today") {
    const t = dayNum(today);
    return [
      { key: "overdue", label: s.overdue, tone: "late" as const, items: items.filter((i) => i.dueDate && dayNum(i.dueDate) < t) },
      { key: "today", label: s.today, items: items.filter((i) => i.dueDate && dayNum(i.dueDate) === t) },
    ].filter((x) => x.items.length);
  }
  if (view === "upcoming") {
    // One heading per day for the next two weeks, then everything after under "Later".
    const out = new Map<string, Section>();
    for (const i of items) {
      const later = dayNum(i.dueDate!) - dayNum(today) > 14;
      const key = later ? "later" : i.dueDate!;
      if (!out.has(key)) out.set(key, { key, label: later ? s.later : dayHeading(i.dueDate!, today), items: [] });
      out.get(key)!.items.push(i);
    }
    return [...out.values()];
  }
  return [{ key: view, label: null, items }];
}

/**
 * The list itself. Check something off and it greys out right away with an Undo toast; it moves to
 * Done once the server confirms. The ⋯ menu reschedules in one tap, which is how you triage a pile
 * of overdue stuff on a Monday morning without opening anything.
 */
export function TodoList({
  items: initial,
  view,
  today,
  refs,
}: {
  items: Todo[];
  view: TodoView | "open";
  today: string;
  refs: Ref[];
}) {
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<Todo | null>(null);
  // Keys checked off in this visit. They stay visible (greyed) for undo instead of vanishing.
  const [recent, setRecent] = useState<Set<string>>(() => new Set());
  const [, startTransition] = useTransition();
  const [seen, setSeen] = useState(initial);
  if (initial !== seen) {
    setSeen(initial);
    setItems(initial);
  }

  const run = (next: Todo[], action: () => Promise<TodoResult>, success?: () => void) => {
    const before = items;
    setItems(next);
    startTransition(async () => {
      const res = await action();
      if (!res.ok) {
        setItems(before);
        toast.error(res.error);
      } else success?.();
    });
  };

  const patch = (key: string, change: Partial<Todo>) => items.map((i) => (i.key === key ? { ...i, ...change } : i));

  const toggle = (t: Todo, done: boolean) => {
    if (done) setRecent((r) => new Set(r).add(t.key));
    run(patch(t.key, { done }), () => toggleTodo(t.kind, t.id, done), () => {
      if (done)
        toast.success(tasksPage.done(t.title), {
          action: { label: tasksPage.undo, onClick: () => run(patch(t.key, { done: false }), () => toggleTodo(t.kind, t.id, false)) },
        });
    });
  };

  const reschedule = (t: Todo, due: string | null, label: string) =>
    run(patch(t.key, { dueDate: due }), () => rescheduleTodo(t.kind, t.id, due), () => toast.success(tasksPage.reschedule.moved(label)));

  // Items that just got checked stay put (greyed) until the refresh, so a mis-tap is easy to undo.
  const keep = (i: Todo) => view !== "done" && i.done && recent.has(i.key);
  const visible = items
    .filter((i) => (view === "open" ? !i.done || keep(i) : viewOf(i, today) === view || keep(i)))
    .slice()
    .sort((a, b) => (view === "done" ? sortTodos(a, b) : sortTodos({ ...a, done: false }, { ...b, done: false })));
  const sections = sectionsFor(view, visible, today);

  if (visible.length === 0) return <EmptyState>{view === "open" ? null : tasksPage.empty[view]}</EmptyState>;

  return (
    <>
      <div className="flex flex-col gap-5">
        {sections.map((sec) => (
          <section key={sec.key} aria-label={sec.label ?? undefined}>
            {sec.label ? (
              <h2
                className={cn(
                  "mb-1 flex items-center gap-2 px-1 text-xs font-semibold tracking-wide uppercase",
                  sec.tone === "late" ? "text-negative" : "text-muted-foreground",
                )}
              >
                {sec.label}
                <span className="font-normal tabular-nums">{sec.items.length}</span>
              </h2>
            ) : null}
            <ul className="bg-card divide-y rounded-xl border">
              {sec.items.map((t) => (
                <Row
                  key={t.key}
                  todo={t}
                  today={today}
                  onToggle={(v) => toggle(t, v)}
                  onReschedule={(due, label) => reschedule(t, due, label)}
                  onEdit={() => setEditing(t)}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>
      <TaskSheet task={editing} refs={refs} onClose={() => setEditing(null)} />
    </>
  );
}

function Row({
  todo: t,
  today,
  onToggle,
  onReschedule,
  onEdit,
}: {
  todo: Todo;
  today: string;
  onToggle: (done: boolean) => void;
  onReschedule: (due: string | null, label: string) => void;
  onEdit: () => void;
}) {
  const [picking, setPicking] = useState(false);
  const due = t.dueDate && !t.done ? dueLabel(t.dueDate, today) : null;
  const r = tasksPage.reschedule;
  const id = `todo-${t.key}`;
  const nextMonday = addDays(today, ((8 - ((dayNum(today) + 4) % 7)) % 7) || 7);

  return (
    <li className="group flex items-start gap-3 px-3 py-3 sm:px-4">
      <Checkbox
        id={id}
        checked={t.done}
        onCheckedChange={(v: boolean | "indeterminate") => onToggle(v === true)}
        aria-label={`Mark "${t.title}" ${t.done ? "not done" : "done"}`}
        className="mt-0.5 size-5 rounded-full"
      />
      <div className="min-w-0 flex-1">
        {t.kind === "task" ? (
          <button
            type="button"
            onClick={onEdit}
            className={cn("block w-full text-left text-sm leading-snug hover:underline", t.done && "text-muted-foreground line-through")}
          >
            {t.title}
          </button>
        ) : (
          <Link
            href={`/admin/projects/${t.project?.id}`}
            className={cn("block text-sm leading-snug hover:underline", t.done && "text-muted-foreground line-through")}
          >
            {t.title}
          </Link>
        )}
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          {due ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 font-medium tabular-nums",
                due.tone === "late" && "text-negative",
                due.tone === "soon" && "text-warning",
                due.tone === "normal" && "text-muted-foreground",
              )}
            >
              <TbCalendarEvent aria-hidden="true" className="size-3.5" />
              {due.text}
            </span>
          ) : null}
          {t.kind === "checklist" ? (
            <span className="bg-brass-soft text-brass-ink inline-flex items-center gap-1 rounded px-1 font-medium">
              <TbListCheck aria-hidden="true" className="size-3" />
              {tasksPage.checklistTag}
              {t.phase ? ` · ${t.phase}` : ""}
            </span>
          ) : null}
          {t.project ? (
            <Link href={`/admin/projects/${t.project.id}`} className="text-muted-foreground hover:text-primary inline-flex min-w-0 items-center gap-1">
              <TbFolders aria-hidden="true" className="size-3.5 shrink-0" />
              <span className="truncate">{t.project.name}</span>
            </Link>
          ) : null}
          {t.client ? (
            <Link href={`/admin/clients/${t.client.id}`} className="text-muted-foreground hover:text-primary inline-flex min-w-0 items-center gap-1">
              <TbUsers aria-hidden="true" className="size-3.5 shrink-0" />
              <span className="truncate">{t.client.name}</span>
            </Link>
          ) : null}
        </div>
        {picking ? (
          <input
            type="date"
            autoFocus
            defaultValue={t.dueDate ?? ""}
            aria-label={`${r.pick} for ${t.title}`}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              if (e.target.value) onReschedule(e.target.value, e.target.value);
              setPicking(false);
            }}
            onBlur={() => setPicking(false)}
            className="border-input bg-card mt-2 h-9 rounded-md border px-2 text-sm"
          />
        ) : null}
      </div>
      {!t.done ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground -mr-1 size-8 shrink-0" aria-label={`${r.label}: ${t.title}`}>
              <TbDots aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="text-muted-foreground text-xs font-medium">{r.label}</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => onReschedule(today, r.today.toLowerCase())}>{r.today}</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onReschedule(addDays(today, 1), r.tomorrow.toLowerCase())}>{r.tomorrow}</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onReschedule(nextMonday, r.nextWeek.toLowerCase())}>{r.nextWeek}</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setPicking(true)}>{r.pick}</DropdownMenuItem>
            {t.kind === "task" && t.dueDate ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => onReschedule(null, r.none.toLowerCase())}>{r.none}</DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </li>
  );
}
