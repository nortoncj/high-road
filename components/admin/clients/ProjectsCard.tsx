import Link from "next/link";
import { clientPage } from "@/content/admin";
import type { Loaded } from "@/lib/admin/data";
import type { ClientProject } from "@/lib/admin/clients";
import type { FormState } from "@/lib/admin/client-actions";
import { shortDate, toDate } from "@/lib/admin/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { IssueNote } from "../States";
import { AddProjectForm } from "./AddProjectForm";
import { ProjectStatusBadge } from "./ClientBits";

/** Their projects, newest first. Each row opens the project; quick add gets the standard checklist. */
export function ProjectsCard({
  projects,
  addAction,
}: {
  projects: Loaded<ClientProject[]>;
  addAction: (prev: FormState, fd: FormData) => Promise<FormState>;
}) {
  const p = clientPage.projects;
  const now = new Date();

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="font-display text-lg">{p.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {!projects.ok ? (
          <div className="-mx-4 sm:-mx-6">
            <IssueNote issue={projects.issue} />
          </div>
        ) : projects.data.length === 0 ? (
          <p className="text-muted-foreground text-sm">{p.empty}</p>
        ) : (
          <ul className="divide-y">
            {projects.data.map((pr) => (
              <li key={pr.id} className="flex items-start justify-between gap-3 py-2.5 first:pt-0">
                <div className="min-w-0">
                  <Link href={`/admin/projects/${pr.id}`} className="block truncate text-sm font-medium hover:underline">
                    {pr.name}
                  </Link>
                  <p className="text-muted-foreground text-xs">
                    {[
                      pr.service,
                      pr.completedAt
                        ? `Launched ${shortDate(toDate(pr.completedAt), now)}`
                        : pr.dueDate
                          ? p.due_label(shortDate(toDate(pr.dueDate), now))
                          : null,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </p>
                </div>
                <ProjectStatusBadge status={pr.status} />
              </li>
            ))}
          </ul>
        )}
        <AddProjectForm action={addAction} />
      </CardContent>
    </Card>
  );
}
