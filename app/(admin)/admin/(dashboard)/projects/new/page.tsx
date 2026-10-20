import type { Metadata } from "next";
import { projectForm } from "@/content/admin";
import { requireAdmin } from "@/lib/admin/auth";
import { createProject } from "@/lib/admin/project-actions";
import { clientOptions, today } from "@/lib/admin/projects";
import type { SearchParams } from "@/lib/admin/range";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProjectForm } from "@/components/admin/projects/ProjectForm";

export const metadata: Metadata = { title: projectForm.newTitle };

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** /admin/projects/new, or ?client=<id> to start one for a client. */
export default async function NewProjectPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin();
  const clientId = one((await searchParams).client);
  const clients = await clientOptions();

  return (
    <>
      <PageHeader title={projectForm.newTitle} />
      <ProjectForm
        mode="new"
        action={createProject}
        clients={clients}
        cancelHref={clientId ? `/admin/clients/${clientId}` : "/admin/projects"}
        values={{ clientId: clients.some((c) => c.id === clientId) ? clientId : undefined, status: "planning", startDate: today() }}
      />
    </>
  );
}
