import type { Metadata } from "next";
import Link from "next/link";
import { TbChevronLeft, TbChevronRight } from "react-icons/tb";
import { leadsPage } from "@/content/admin";
import { requireAdmin } from "@/lib/admin/auth";
import { getLead, listLeads } from "@/lib/admin/data";
import type { SearchParams } from "@/lib/admin/range";
import { isLeadStatus, type LeadStatus } from "@/lib/admin/schema";
import { Button } from "@/components/admin/ui/button";
import { Card } from "@/components/admin/ui/card";
import { LeadRows } from "@/components/admin/LeadRows";
import { LeadSheet } from "@/components/admin/LeadSheet";
import { LeadsFilters } from "@/components/admin/LeadsFilters";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState, IssueNote } from "@/components/admin/States";

export const metadata: Metadata = { title: leadsPage.meta.title };

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function AdminLeadsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin();
  const p = await searchParams;
  const q = one(p.q)?.trim() || undefined;
  const statusParam = one(p.status);
  const status: LeadStatus | undefined = isLeadStatus(statusParam) ? statusParam : undefined;
  const page = Math.max(1, Number.parseInt(one(p.page) ?? "1", 10) || 1);
  const leadId = one(p.lead);

  const [list, lead] = await Promise.all([listLeads({ q, status, page }), leadId ? getLead(leadId) : null]);

  // The current view without the open lead, so closing the sheet lands you back where you were.
  const base = new URLSearchParams();
  if (status) base.set("status", status);
  if (q) base.set("q", q);
  if (page > 1) base.set("page", String(page));
  const query = base.toString();

  const pageHref = (n: number) => {
    const sp = new URLSearchParams(base);
    if (n > 1) sp.set("page", String(n));
    else sp.delete("page");
    const qs = sp.toString();
    return qs ? `/admin/leads?${qs}` : "/admin/leads";
  };

  return (
    <>
      <PageHeader title={leadsPage.title} description={leadsPage.description} />
      <LeadsFilters q={q} status={status} counts={list.ok ? list.data.counts : undefined} />

      <Card className="gap-0 overflow-hidden py-0 md:py-2">
        {!list.ok ? (
          <div className="py-6">
            <IssueNote issue={list.issue} />
          </div>
        ) : list.data.rows.length === 0 ? (
          <EmptyState>{leadsPage.empty}</EmptyState>
        ) : (
          <LeadRows rows={list.data.rows} query={query} />
        )}
      </Card>

      {list.ok && list.data.pages > 1 ? (
        <nav aria-label="Pages" className="flex items-center justify-between gap-3">
          <p className="text-muted-foreground text-sm tabular-nums">{leadsPage.page(page, list.data.pages)}</p>
          <div className="flex gap-2">
            {page > 1 ? (
              <Button asChild variant="outline" size="sm">
                <Link href={pageHref(page - 1)}>
                  <TbChevronLeft aria-hidden="true" />
                  {leadsPage.prev}
                </Link>
              </Button>
            ) : null}
            {page < list.data.pages ? (
              <Button asChild variant="outline" size="sm">
                <Link href={pageHref(page + 1)}>
                  {leadsPage.next}
                  <TbChevronRight aria-hidden="true" />
                </Link>
              </Button>
            ) : null}
          </div>
        </nav>
      ) : null}

      <LeadSheet lead={lead} closeHref={query ? `/admin/leads?${query}` : "/admin/leads"} />
    </>
  );
}
