import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projectForm } from "@/content/admin";
import { requireAdmin } from "@/lib/admin/auth";
import { saveProject } from "@/lib/admin/project-actions";
import { clientOptions, getProject } from "@/lib/admin/projects";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProjectForm } from "@/components/admin/projects/ProjectForm";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await getProject((await params).id);
  return { title: found ? projectForm.editTitle(found.project.name) : "Project" };
}

export default async function EditProjectPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const [found, clients] = await Promise.all([getProject(id), clientOptions()]);
  if (!found) notFound();
  const p = found.project;

  // A churned client won't be in the options list; keep them selectable for their own old project.
  const options = p.client && !clients.some((c) => c.id === p.client!.id) ? [p.client, ...clients] : clients;

  return (
    <>
      <PageHeader title={projectForm.editTitle(p.name)} />
      <ProjectForm
        mode="edit"
        action={saveProject.bind(null, p.id)}
        clients={options}
        cancelHref={`/admin/projects/${p.id}`}
        values={{
          name: p.name,
          clientId: p.client?.id,
          service: p.service ?? undefined,
          status: p.status,
          startDate: p.startDate ?? undefined,
          dueDate: p.dueDate ?? undefined,
          driveUrl: p.driveUrl ?? undefined,
          notes: p.notes ?? undefined,
        }}
      />
    </>
  );
}
