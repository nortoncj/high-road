import type { Metadata } from "next";
import Link from "next/link";
import { TbBrandStripe, TbInfoCircle, TbPlus } from "react-icons/tb";
import { clientsPage } from "@/content/admin";
import { requireAdmin } from "@/lib/admin/auth";
import { syncAllStripe } from "@/lib/admin/client-actions";
import { listClients, renewalsFrom, type ClientFilter } from "@/lib/admin/clients";
import type { SearchParams } from "@/lib/admin/range";
import { clientStatuses } from "@/lib/admin/schema";
import { stripeConfigured } from "@/lib/admin/stripe-sync";
import { Button } from "@/components/admin/ui/button";
import { Card } from "@/components/admin/ui/card";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState, IssueNote } from "@/components/admin/States";
import { ActionButton } from "@/components/admin/clients/ActionButtons";
import { ClientFilters } from "@/components/admin/clients/ClientFilters";
import { ClientRows } from "@/components/admin/clients/ClientRows";
import { ClientStats } from "@/components/admin/clients/ClientStats";
import { RenewalsCard } from "@/components/admin/clients/RenewalsCard";

export const metadata: Metadata = { title: clientsPage.meta.title };

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function AdminClientsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin();
  const p = await searchParams;
  const raw = one(p.status);
  const status: ClientFilter = raw === "all" || (clientStatuses as readonly string[]).includes(raw ?? "") ? (raw as ClientFilter) : "active";
  const q = one(p.q)?.trim() || undefined;

  const list = await listClients({ status, q });

  return (
    <>
      <PageHeader
        title={clientsPage.title}
        description={clientsPage.description}
        actions={
          <>
            {stripeConfigured() ? (
              <ActionButton action={syncAllStripe} pendingLabel={clientsPage.syncing} className="h-10">
                <TbBrandStripe aria-hidden="true" />
                <span className="hidden sm:inline">{clientsPage.sync}</span>
                <span className="sm:hidden">Sync</span>
              </ActionButton>
            ) : null}
            <Button asChild className="h-10">
              <Link href="/admin/clients/new">
                <TbPlus aria-hidden="true" />
                {clientsPage.add}
              </Link>
            </Button>
          </>
        }
      />

      {list.ok ? <ClientStats stats={list.data.stats} /> : null}

      {list.ok && list.data.unlinked > 0 ? (
        <p className="bg-warning-soft text-warning flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm">
          <TbInfoCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {clientsPage.unlinked(list.data.unlinked)}
        </p>
      ) : null}

      <div className="grid grid-cols-1 items-start gap-4 sm:gap-6 xl:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-4 xl:col-span-2">
          <ClientFilters status={status} q={q} counts={list.ok ? list.data.counts : undefined} />
          <Card className="gap-0 overflow-hidden py-0 md:py-2">
            {!list.ok ? (
              <div className="py-6">
                <IssueNote issue={list.issue} />
              </div>
            ) : list.data.rows.length === 0 ? (
              <EmptyState>{clientsPage.empty}</EmptyState>
            ) : (
              <ClientRows rows={list.data.rows} />
            )}
          </Card>
        </div>
        <RenewalsCard items={list.ok ? renewalsFrom(list.data.everyone, list.data.dues) : []} className="xl:sticky xl:top-20" />
      </div>
    </>
  );
}
