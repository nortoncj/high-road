"use client";

import { useRef, useState, useTransition, type MouseEvent, type ReactNode } from "react";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { toast } from "sonner";
import { TbCheck, TbDots } from "react-icons/tb";
import { projectsPage } from "@/content/admin";
import { moveProject } from "@/lib/admin/project-actions";
import type { Project } from "@/lib/admin/projects";
import { boardStatuses, projectStatusMeta, type ProjectStatus } from "@/lib/admin/schema";
import { cn } from "@/lib/admin/utils";
import { Button } from "@/components/admin/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/admin/ui/dropdown-menu";
import { ProjectCard } from "./ProjectCard";

type Lane = ProjectStatus;

const laneDot: Record<string, string> = {
  planning: "bg-muted-foreground",
  in_progress: "bg-primary",
  review: "bg-brass",
  done: "bg-positive",
  on_hold: "bg-warning",
};

const severity = { late: 0, behind: 1, "due-soon": 2, ok: 3, done: 4 } as const;
const DONE_RECENT_DAYS = 30;

function sortLane(lane: Lane, list: Project[]): Project[] {
  if (lane === "done") return [...list].sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""));
  return [...list].sort(
    (a, b) => severity[a.health] - severity[b.health] || (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999"),
  );
}

/**
 * Asana-style board. Drag a card to a column (mouse, or press and hold on a phone), or use the ⋯
 * menu, which is also how keyboard users move cards. Moves show instantly and roll back if
 * Supabase says no. Inside a column, cards sort by trouble first, then due date, so the ones that
 * need you float up on their own.
 */
export function ProjectBoard({ projects, today }: { projects: Project[]; today: string }) {
  const [items, setItems] = useState(projects);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showOlder, setShowOlder] = useState(false);
  const [, startTransition] = useTransition();
  const justDragged = useRef(false);

  // Fresh server data replaces local moves. Done during render, not in an effect.
  const [seen, setSeen] = useState(projects);
  if (projects !== seen) {
    setSeen(projects);
    setItems(projects);
  }

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } }),
  );

  function move(id: string, to: Lane) {
    const current = items.find((p) => p.id === id);
    if (!current || current.status === to) return;
    const before = items;
    setItems(items.map((p) => (p.id === id ? { ...p, status: to, health: to === "done" ? "done" : p.health } : p)));
    startTransition(async () => {
      const res = await moveProject(id, to);
      if (!res.ok) {
        setItems(before);
        toast.error(projectsPage.moveFailed, { description: res.error });
      } else if (res.warning) toast.warning(res.warning);
      else toast.success(projectsPage.movedTo(projectStatusMeta[to].label));
    });
  }

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    justDragged.current = true;
    window.setTimeout(() => (justDragged.current = false), 0);
    if (e.over) move(String(e.active.id), String(e.over.id) as Lane);
  }

  const lanes: Lane[] = [...boardStatuses];
  if (items.some((p) => p.status === "on_hold")) lanes.push("on_hold");
  const cutoff = new Date(Date.parse(`${today}T00:00:00Z`) - DONE_RECENT_DAYS * 86_400_000).toISOString();
  const active = items.find((p) => p.id === activeId) ?? null;

  const menu = (p: Project) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-7" aria-label={`${projectsPage.move}: ${p.name}`}>
          <TbDots aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="text-muted-foreground text-xs font-medium">{projectsPage.move}</DropdownMenuLabel>
        {[...boardStatuses, "on_hold" as const].map((s) => (
          <DropdownMenuItem key={s} disabled={p.status === s} onSelect={() => move(p.id, s)}>
            <span aria-hidden="true" className={cn("size-2 rounded-full", laneDot[s])} />
            {projectsPage.columns[s]}
            {p.status === s ? <TbCheck aria-hidden="true" className="ml-auto" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setActiveId(null)}>
      <div
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:snap-none lg:px-0"
        onClickCapture={(e: MouseEvent) => {
          // A drag that ends over a card shouldn't also open it.
          if (justDragged.current) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        {lanes.map((lane) => {
          let list = sortLane(
            lane,
            items.filter((p) => p.status === lane),
          );
          let older = 0;
          if (lane === "done" && !showOlder) {
            const recent = list.filter((p) => (p.completedAt ?? p.createdAt) >= cutoff);
            older = list.length - recent.length;
            list = recent;
          }
          return (
            <Column key={lane} lane={lane} count={items.filter((p) => p.status === lane).length}>
              {list.length === 0 ? (
                <p className="text-muted-foreground px-2 py-6 text-center text-xs">{projectsPage.emptyColumn}</p>
              ) : (
                list.map((p) => (
                  <DraggableCard key={p.id} id={p.id}>
                    <ProjectCard project={p} today={today} menu={menu(p)} />
                  </DraggableCard>
                ))
              )}
              {older > 0 ? (
                <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setShowOlder(true)}>
                  {projectsPage.doneOlder(older)}
                </Button>
              ) : null}
            </Column>
          );
        })}
      </div>

      <DragOverlay dropAnimation={null}>{active ? <ProjectCard project={active} today={today} dragging /> : null}</DragOverlay>
    </DndContext>
  );
}

function Column({ lane, count, children }: { lane: Lane; count: number; children: ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: lane });
  const label = projectsPage.columns[lane as keyof typeof projectsPage.columns];
  return (
    <section
      aria-label={`${label}, ${count}`}
      className="flex w-[85%] shrink-0 snap-start flex-col gap-2 sm:w-[45%] lg:w-0 lg:min-w-60 lg:flex-1"
    >
      <header className="flex items-center gap-2 px-1">
        <span aria-hidden="true" className={cn("size-2 rounded-full", laneDot[lane])} />
        <h2 className="text-sm font-semibold">{label}</h2>
        <span className="text-muted-foreground text-xs tabular-nums">{count}</span>
      </header>
      <div
        ref={setNodeRef}
        className={cn(
          "bg-secondary/50 flex min-h-32 flex-1 flex-col gap-2 rounded-xl p-2 transition-colors",
          isOver && "bg-sea-foam/60 ring-sea-glass ring-2",
        )}
      >
        {children}
      </div>
    </section>
  );
}

function DraggableCard({ id, children }: { id: string; children: ReactNode }) {
  // Listeners only, no role/tabindex attributes: the card holds a link and a menu, and a
  // role="button" wrapper around those would trip up screen readers. The ⋯ menu is the keyboard path.
  const { setNodeRef, listeners, isDragging } = useDraggable({ id });
  return (
    <div ref={setNodeRef} {...listeners} className={cn("touch-manipulation", isDragging && "opacity-40")}>
      {children}
    </div>
  );
}
