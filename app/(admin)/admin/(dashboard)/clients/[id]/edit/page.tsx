import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { clientForm } from "@/content/admin";
import { requireAdmin } from "@/lib/admin/auth";
import { getClient } from "@/lib/admin/clients";
import { PageHeader } from "@/components/admin/PageHeader";
import { ClientForm } from "@/components/admin/clients/ClientForm";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const detail = await getClient((await params).id);
  return { title: detail ? clientForm.editTitle(detail.client.name) : "Client" };
}

export default async function EditClientPage({ params }: Props) {
  await requireAdmin();
  const detail = await getClient((await params).id);
  if (!detail) notFound();
  const c = detail.client;

  return (
    <>
      <PageHeader title={clientForm.editTitle(c.name)} />
      <ClientForm
        cancelHref={`/admin/clients/${c.id}`}
        values={{
          id: c.id,
          name: c.name,
          contactName: c.contactName ?? undefined,
          email: c.email ?? undefined,
          phone: c.phone ?? undefined,
          website: c.website ?? undefined,
          status: c.status,
          onboardedOn: c.onboardedOn ?? undefined,
          notes: c.notes ?? undefined,
          manualPlan: c.manual.plan ?? undefined,
          manualMonthly: c.manual.monthlyCents != null ? String(c.manual.monthlyCents / 100) : undefined,
          manualRenewsOn: c.manual.renewsOn ?? undefined,
        }}
      />
    </>
  );
}
