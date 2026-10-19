import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { clientForm } from "@/content/admin";
import { requireAdmin } from "@/lib/admin/auth";
import { getLead } from "@/lib/admin/data";
import type { SearchParams } from "@/lib/admin/range";
import { PageHeader } from "@/components/admin/PageHeader";
import { ClientForm, type ClientFormValues } from "@/components/admin/clients/ClientForm";

export const metadata: Metadata = { title: clientForm.newTitle };

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** /admin/clients/new, or /admin/clients/new?lead=<id> to carry a won lead over. */
export default async function NewClientPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin();
  const leadId = one((await searchParams).lead);
  const lead = leadId ? await getLead(leadId) : null;

  // Already converted? Don't make a twin, go to the client.
  if (lead?.client) redirect(`/admin/clients/${lead.client.id}`);

  const values: ClientFormValues = lead
    ? {
        leadId: lead.id,
        contactName: lead.name,
        email: lead.email,
        phone: lead.phone ?? undefined,
        website: lead.website ?? undefined,
        status: "active",
        onboardedOn: new Date().toISOString().slice(0, 10),
        // Their original message is often the best "why they hired us" note you'll ever have.
        notes: lead.message ? `From their first message:\n${lead.message}` : undefined,
      }
    : { status: "active" };

  return (
    <>
      <PageHeader title={lead ? clientForm.newFromLead(lead.name) : clientForm.newTitle} />
      <ClientForm values={values} fromLead={Boolean(lead)} cancelHref={lead ? `/admin/leads?lead=${lead.id}` : "/admin/clients"} />
    </>
  );
}
