import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TbAlertTriangle, TbArrowLeft, TbBrandGoogleDrive, TbPencil } from "react-icons/tb";
import { projectPage } from "@/content/admin";
import { requireAdmin } from "@/lib/admin/auth";
import { shortDate, toDate } from "@/lib/admin/format";
import { setDriveUrl } from "@/lib/admin/project-actions";
import { getProject } from "@/lib/admin/projects";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Checklist } from "@/components/admin/projects/Checklist";
import { DriveCard } from "@/components/admin/projects/DriveCard";
import { DueChip } from "@/components/admin/projects/DueChip";
import { ProjectStatusSelect } from "@/components/admin/projects/ProjectStatusSelect";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await getProject((await params).id);
  return { title: found?.project.name ?? "Project" };
}

export default async function ProjectDetailPage({ params }: Props) {
  await requireAdmin();
  const found = await getProject((await params).id);
  if (!found) notFound();
  const { project: p, today } = found;
  const now = new Date();
  const d = projectPage.details;

  const warning = p.health === "late" ? projectPage.late(p.daysLate) : p.health === "behind" ? projectPage.behind(p.overdueTasks) : null;

  return (
    <>
      <Link href="/admin/projects" className="text-muted-foreground hover:text-foreground -mb-2 inline-flex w-fit items-center gap-1 text-sm">
        <TbArrowLeft aria-hidden="true" className="size-4" />
        {projectPage.back}
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {p.client ? (
            <Link href={`/admin/clients/${p.client.id}`} className="text-muted-foreground hover:text-primary text-sm hover:underline">
              {p.client.name}
            </Link>
          ) : null}
          <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{p.name}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            {p.status === "done" && p.completedAt ? (
              <span className="text-positive text-sm font-medium">
                {d.launched} {shortDate(toDate(p.completedAt), now)}
              </span>
            ) : p.dueDate ? (
              <DueChip due={p.dueDate} today={today} />
            ) : null}
            {p.service ? <span className="text-muted-foreground text-sm">{p.service}</span> : null}
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 sm:flex-none">
            <ProjectStatusSelect id={p.id} status={p.status} />
          </div>
          {p.driveUrl ? (
            // On a phone the Drive card sits below a long checklist, so the folder gets a button up here too.
            <Button asChild variant="outline" className="h-10 lg:hidden">
              <a href={p.driveUrl} target="_blank" rel="noopener noreferrer" aria-label={projectPage.drive.open}>
                <TbBrandGoogleDrive aria-hidden="true" />
              </a>
            </Button>
          ) : null}
          <Button asChild variant="outline" className="h-10">
            <Link href={`/admin/projects/${p.id}/edit`}>
              <TbPencil aria-hidden="true" />
              {projectPage.edit}
            </Link>
          </Button>
        </div>
      </div>

      {warning ? (
        <p
          role="status"
          className={
            p.health === "late"
              ? "bg-negative-soft text-negative flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm font-medium"
              : "bg-warning-soft text-warning flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm font-medium"
          }
        >
          <TbAlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {warning}
        </p>
      ) : null}

      <div className="grid grid-cols-1 items-start gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <Checklist projectId={p.id} tasks={p.tasks} today={today} />
        </div>
        <div className="flex min-w-0 flex-col gap-4 sm:gap-6 lg:sticky lg:top-20">
          <DriveCard url={p.driveUrl} action={setDriveUrl.bind(null, p.id)} />

          <Card className="gap-4">
            <CardHeader>
              <CardTitle className="font-display text-lg">{d.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-3 gap-y-2 text-sm">
                <dt className="text-muted-foreground">{d.client}</dt>
                <dd className="truncate">
                  {p.client ? (
                    <Link href={`/admin/clients/${p.client.id}`} className="text-primary hover:underline">
                      {p.client.name}
                    </Link>
                  ) : (
                    d.none
                  )}
                </dd>
                <dt className="text-muted-foreground">{d.service}</dt>
                <dd className="truncate">{p.service ?? "—"}</dd>
                <dt className="text-muted-foreground">{d.start}</dt>
                <dd className="tabular-nums">{p.startDate ? shortDate(toDate(p.startDate), now) : "—"}</dd>
                <dt className="text-muted-foreground">{d.due}</dt>
                <dd className="tabular-nums">{p.dueDate ? shortDate(toDate(p.dueDate), now) : "—"}</dd>
              </dl>
            </CardContent>
          </Card>

          <Card className="gap-4">
            <CardHeader>
              <CardTitle className="font-display text-lg">{projectPage.notes.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {p.notes ? (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{p.notes}</p>
              ) : (
                <p className="text-muted-foreground text-sm">{projectPage.notes.empty}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
