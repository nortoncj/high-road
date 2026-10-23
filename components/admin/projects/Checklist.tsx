"use client";

import { useRef, useState, useTransition, type ChangeEvent, type FormEvent, type KeyboardEvent, type MouseEvent } from "react";
import { toast } from "sonner";
import { TbCalendarPlus, TbPlus, TbRocket, TbTrash, TbX } from "react-icons/tb";
import posthog from "posthog-js";
import { projectPage } from "@/content/admin";
import { addTask, deleteTask, setTaskDue, toggleTask, type TaskResult } from "@/lib/admin/project-actions";
import { dueLabel, launchPhases, phaseOrder } from "@/lib/admin/project-logic";
import type { ProjectTask } from "@/lib/admin/projects";
import { cn } from "@/lib/admin/utils";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Checkbox } from "@/components/admin/ui/checkbox";
import { Input } from "@/components/admin/ui/input";

/**
 * The checklist, grouped by phase in your order (Kickoff → Sitemap → Brand → Copy → Build →
 * Launch checklist → After launch). Everything is optimistic: it updates as you tap and rolls
 * back with a toast if the save fails.
 */
export function Checklist({ projectId, tasks: initial, today }: { projectId: string; tasks: ProjectTask[]; today: string }) {
  const [tasks, setTasks] = useState(initial);
  const [, startTransition] = useTransition();
  // Fresh server data replaces local edits. Done during render, not in an effect.
  const [seen, setSeen] = useState(initial);
  if (initial !== seen) {
    setSeen(initial);
    setTasks(initial);
  }

  const run = (optimistic: ProjectTask[], action: () => Promise<TaskResult>) => {
    const before = tasks;
    setTasks(optimistic);
    startTransition(async () => {
      const res = await action();
      if (!res.ok) {
        setTasks(before);
        toast.error(res.error);
      }
    });
  };

  const phases = [...phaseOrder, ...new Set(tasks.map((t) => t.phase).filter((p) => !phaseOrder.includes(p)))];
  const done = tasks.filter((t) => t.done).length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <Card className="gap-5">
      <CardHeader>
        <CardTitle className="font-display text-lg">{projectPage.checklist}</CardTitle>
        <CardDescription className="tabular-nums">{projectPage.progress(done, tasks.length)}</CardDescription>
        <div aria-hidden="true" className="bg-muted mt-2 h-2 overflow-hidden rounded-full">
          <div className="bg-sea-glass h-full rounded-full transition-[width] duration-500" style={{ width: `${pct}%` }} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {phases.map((phase) => {
          const items = tasks.filter((t) => t.phase === phase);
          const launch = launchPhases.has(phase);
          const phaseDone = items.filter((t) => t.done).length;
          return (
            <section key={phase} aria-labelledby={`phase-${phase}`} className={cn(launch && "bg-brass-soft/40 -mx-3 rounded-xl p-3")}>
              <header className="mb-1 flex items-center gap-2">
                {launch ? <TbRocket aria-hidden="true" className="text-brass-ink size-4" /> : null}
                <h3 id={`phase-${phase}`} className={cn("text-sm font-semibold", launch && "text-brass-ink")}>
                  {phase}
                </h3>
                {items.length ? (
                  <span className="text-muted-foreground text-xs tabular-nums">
                    {phaseDone}/{items.length}
                  </span>
                ) : null}
              </header>
              <ul className="flex flex-col">
                {items.map((t) => (
                  <TaskRow
                    key={t.id}
                    task={t}
                    today={today}
                    onToggle={(v) => {
                      posthog.capture("checklist_task_toggled", { completed: v });
                      run(tasks.map((x) => (x.id === t.id ? { ...x, done: v } : x)), () => toggleTask(t.id, v));
                    }}
                    onDue={(d) => run(tasks.map((x) => (x.id === t.id ? { ...x, dueDate: d } : x)), () => setTaskDue(t.id, d))}
                    onDelete={() => run(tasks.filter((x) => x.id !== t.id), () => deleteTask(t.id))}
                  />
                ))}
              </ul>
              <AddItem
                onAdd={(title) =>
                  run(
                    [...tasks, { id: `tmp-${Date.now()}`, phase, title, done: false, dueDate: null, position: Number.MAX_SAFE_INTEGER }],
                    () => addTask(projectId, phase, title),
                  )
                }
              />
            </section>
          );
        })}
      </CardContent>
    </Card>
  );
}

function TaskRow({
  task,
  today,
  onToggle,
  onDue,
  onDelete,
}: {
  task: ProjectTask;
  today: string;
  onToggle: (v: boolean) => void;
  onDue: (d: string | null) => void;
  onDelete: () => void;
}) {
  const [editingDate, setEditingDate] = useState(false);
  const due = task.dueDate ? dueLabel(task.dueDate, today) : null;
  const late = due?.tone === "late" && !task.done;
  const id = `task-${task.id}`;

  return (
    <li className="group flex min-h-11 items-center gap-3 border-b py-1.5 last:border-0">
      <Checkbox id={id} checked={task.done} onCheckedChange={(v) => onToggle(v === true)} className="size-5" />
      <label
        htmlFor={id}
        className={cn(
          "min-w-0 flex-1 cursor-pointer text-sm leading-snug",
          task.done && "text-muted-foreground line-through",
          late && "text-negative font-medium",
        )}
      >
        {task.title}
      </label>

      {editingDate ? (
        <span className="flex items-center gap-1">
          <input
            type="date"
            autoFocus
            defaultValue={task.dueDate ?? ""}
            aria-label={`Due date for ${task.title}`}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              onDue(e.target.value || null);
              setEditingDate(false);
            }}
            onBlur={() => setEditingDate(false)}
            className="border-input bg-card h-8 rounded-md border px-2 text-xs"
          />
          {task.dueDate ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label="Clear due date"
              onMouseDown={(e: MouseEvent) => e.preventDefault()}
              onClick={() => {
                onDue(null);
                setEditingDate(false);
              }}
            >
              <TbX aria-hidden="true" />
            </Button>
          ) : null}
        </span>
      ) : due && !task.done ? (
        <button
          type="button"
          onClick={() => setEditingDate(true)}
          aria-label={`${due.text}. Change due date`}
          className={cn(
            "shrink-0 rounded-md px-1.5 py-0.5 text-xs font-medium tabular-nums hover:ring-1 hover:ring-current",
            due.tone === "late" && "bg-negative-soft text-negative",
            due.tone === "soon" && "bg-warning-soft text-warning",
            due.tone === "normal" && "text-muted-foreground",
          )}
        >
          {due.text}
        </button>
      ) : !task.done ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-muted-foreground size-8 sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100"
          aria-label={`${projectPage.setDate}: ${task.title}`}
          onClick={() => setEditingDate(true)}
        >
          <TbCalendarPlus aria-hidden="true" />
        </Button>
      ) : null}

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-negative size-8 sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100"
        aria-label={`Delete ${task.title}`}
        onClick={onDelete}
      >
        <TbTrash aria-hidden="true" />
      </Button>
    </li>
  );
}

function AddItem({ onAdd }: { onAdd: (title: string) => void }) {
  const [open, setOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  if (!open)
    return (
      <Button type="button" variant="ghost" size="sm" className="text-muted-foreground mt-1 -ml-2" onClick={() => setOpen(true)}>
        <TbPlus aria-hidden="true" />
        {projectPage.addItem}
      </Button>
    );

  return (
    <form
      className="mt-2 flex gap-2"
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        const v = input.current?.value.trim();
        if (v) onAdd(v);
        if (input.current) input.current.value = "";
      }}
    >
      <Input
        ref={input}
        autoFocus
        placeholder={projectPage.addPlaceholder}
        aria-label={projectPage.addItem}
        onKeyDown={(e: KeyboardEvent) => e.key === "Escape" && setOpen(false)}
        className="bg-card h-9 text-base sm:text-sm"
      />
      <Button type="submit" size="sm" className="h-9">
        Add
      </Button>
      <Button type="button" variant="ghost" size="sm" className="h-9" onClick={() => setOpen(false)}>
        Done
      </Button>
    </form>
  );
}
