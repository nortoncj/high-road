import Link from "next/link";
import type { ReactNode } from "react";
import { TbBrandGoogleDrive, TbChecks } from "react-icons/tb";
import { projectsPage } from "@/content/admin";
import type { Project } from "@/lib/admin/projects";
import { cn } from "@/lib/admin/utils";
import { DueChip } from "./DueChip";

/**
 * One card on the board. The whole card is the link (stretched ::after); the Drive icon and the
 * move menu sit above it so they stay clickable.
 */
export function ProjectCard({ project: p, today, menu, dragging }: { project: Project; today: string; menu?: ReactNode; dragging?: boolean }) {
  const pct = p.total ? Math.round((p.done / p.total) * 100) : 0;
  const done = p.status === "done";

  return (
    <article
      className={cn(
        "bg-card group relative rounded-lg border p-3 shadow-xs transition-shadow hover:shadow-md",
        p.health === "late" && "border-l-coral border-l-4",
        p.health === "behind" && "border-l-warning border-l-4",
        dragging && "ring-sea-glass rotate-1 shadow-xl ring-2",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          {p.client ? <p className="text-muted-foreground truncate text-xs">{p.client.name}</p> : null}
          <Link
            href={`/admin/projects/${p.id}`}
            draggable={false}
            className="after:ring-ring block leading-snug font-medium after:absolute after:inset-0 after:rounded-lg hover:underline focus-visible:outline-none focus-visible:after:ring-2"
          >
            {p.name}
          </Link>
        </div>
        {menu ? <div className="relative z-10 -mt-1 -mr-1">{menu}</div> : null}
      </div>

      {p.total > 0 && !done ? (
        <div className="mt-3">
          <div aria-hidden="true" className="bg-muted h-1.5 overflow-hidden rounded-full">
            <div className="bg-sea-glass h-full rounded-full transition-[width] duration-500" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-muted-foreground mt-1.5 flex items-center justify-between gap-2 text-xs">
            <span className="truncate">{p.next ? projectsPage.next(p.next) : projectsPage.allDone}</span>
            <span className="shrink-0 tabular-nums">
              {p.done}/{p.total}
            </span>
          </p>
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {done ? (
          <span className="bg-positive-soft text-positive inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium">
            <TbChecks aria-hidden="true" className="size-3.5" />
            Launched
          </span>
        ) : p.dueDate ? (
          <DueChip due={p.dueDate} today={today} />
        ) : null}
        {p.overdueTasks > 0 && !done ? (
          <span className="text-negative text-xs font-medium">{p.overdueTasks} overdue</span>
        ) : null}
        {p.driveUrl ? (
          <a
            href={p.driveUrl}
            target="_blank"
            rel="noopener noreferrer"
            draggable={false}
            className="text-muted-foreground hover:text-primary hover:bg-accent relative z-10 ml-auto grid size-7 place-items-center rounded-md"
            aria-label={`${p.name} assets in Google Drive`}
          >
            <TbBrandGoogleDrive aria-hidden="true" className="size-4" />
          </a>
        ) : null}
      </div>
    </article>
  );
}
