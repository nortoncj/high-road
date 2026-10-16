import { Suspense } from "react";
import type { Metadata } from "next";
import { LeadsView } from "@/components/admin/LeadsView";
import styles from "@/components/admin/Admin.module.css";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { LEAD_STATUSES, type Lead, type LeadStatus } from "@/lib/leads";

export const metadata: Metadata = {
  title: { absolute: "Leads, WebTech Ninjas" },
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ status?: string }>;

// With cacheComponents on, anything that reads cookies or the URL has to sit inside <Suspense>.
export default function LeadsPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<p className={styles.loading}>Loading leads...</p>}>
      <Leads searchParams={searchParams} />
    </Suspense>
  );
}

async function Leads({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();
  const { status } = await searchParams;
  const active: LeadStatus | "all" = LEAD_STATUSES.includes(status as LeadStatus) ? (status as LeadStatus) : "all";

  const db = supabaseAdmin();
  let query = db.from("leads").select("*").order("created_at", { ascending: false }).limit(200);
  if (active !== "all") query = query.eq("status", active);

  const [{ data, error }, { data: all }] = await Promise.all([query, db.from("leads").select("status")]);
  if (error) throw new Error(error.message);

  const counts = { all: 0, new: 0, contacted: 0, booked: 0, won: 0, lost: 0 } as Record<LeadStatus | "all", number>;
  for (const row of (all ?? []) as { status: LeadStatus }[]) {
    counts.all += 1;
    counts[row.status] += 1;
  }

  return <LeadsView leads={(data ?? []) as Lead[]} counts={counts} active={active} />;
}
