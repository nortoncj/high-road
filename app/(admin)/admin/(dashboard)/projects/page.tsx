import type { Metadata } from "next";
import Link from "next/link";
import { TbAlertTriangle, TbPlus, TbSearch } from "react-icons/tb";
import { projectsPage } from "@/content/admin";
import { requireAdmin } from "@/lib/admin/auth";
import { listProjects } from "@/lib/admin/projects";
import type { SearchParams } from "@/lib/admin/range";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState, IssueNote } from "@/components/admin/States";
import { ProjectBoard } from "@/components/admin/projects/ProjectBoard";

export const metadata: Metadata = { title: projectsPage.meta.title };

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function AdminProjectsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin();
  const q = one((await searchParams).q)?.trim() || undefined;
  const board = await listProjects(q);
  const s = projectsPage.slipping;

  // The heads-up: one line, worst news first, only when there's news.
  const alerts = board.ok
    ? [
        board.data.late ? s.late(board.data.late) : null,
        board.data.behind ? s.behind(board.data.behind) : null,
        board.data.dueSoon ? s.soon(board.data.dueSoon) : null,
      ].filter(Boolean)
    : [];

  return (
    <>
      <PageHeader
        title={projectsPage.title}
        description={projectsPage.description}
        actions={
          <Button asChild className="h-10">
            <Link href="/admin/projects/new">
              <TbPlus aria-hidden="true" />
              {projectsPage.add}
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {alerts.length ? (
          <p
            role="status"
            className={
              board.ok && board.data.late
                ? "bg-negative-soft text-negative flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm font-medium"
                : "bg-warning-soft text-warning flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm font-medium"
            }
          >
            <TbAlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {alerts.join(". ")}.
          </p>
        ) : (
          <p className="text-muted-foreground hidden text-xs lg:block">{projectsPage.dragHint}</p>
        )}
        <form method="get" action="/admin/projects" role="search" className="relative w-full lg:w-72">
          <TbSearch aria-hidden="true" className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            type="search"
            name="q"
            defaultValue={q}
            placeholder={projectsPage.searchPlaceholder}
            aria-label={projectsPage.searchLabel}
            enterKeyHint="search"
            className="bg-card h-10 pl-9 text-base sm:text-sm"
          />
        </form>
      </div>

      {!board.ok ? (
        <IssueNote issue={board.issue} />
      ) : board.data.projects.length === 0 && !q ? (
        <EmptyState>{projectsPage.empty}</EmptyState>
      ) : (
        <ProjectBoard projects={board.data.projects} today={board.data.today} />
      )}
    </>
  );
}
