import Link from "next/link";
import { TbSearch } from "react-icons/tb";
import { leadsPage } from "@/content/admin";
import type { LeadsList } from "@/lib/admin/data";
import { leadStatuses, leadStatusMeta, type LeadStatus } from "@/lib/admin/schema";
import { cn } from "@/lib/admin/utils";
import { Input } from "@/components/admin/ui/input";

function href(status?: LeadStatus, q?: string) {
  const sp = new URLSearchParams();
  if (status) sp.set("status", status);
  if (q) sp.set("q", q);
  const qs = sp.toString();
  return qs ? `/admin/leads?${qs}` : "/admin/leads";
}

/**
 * Status tabs + search. Plain links and a GET form: no client JS, and every filtered view
 * is a URL you can bookmark on your phone ("New leads" on the home screen, say).
 */
export function LeadsFilters({
  q,
  status,
  counts,
}: {
  q?: string;
  status?: LeadStatus;
  counts?: LeadsList["counts"];
}) {
  const tabs: { key?: LeadStatus; label: string; count?: number }[] = [
    { label: leadsPage.all, count: counts?.all },
    ...leadStatuses.map((s) => ({ key: s, label: leadStatusMeta[s].label, count: counts?.[s] })),
  ];

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <nav aria-label="Filter by status" className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
        <ul className="bg-secondary flex w-max gap-1 rounded-lg p-1">
          {tabs.map((t) => {
            const active = t.key === status;
            return (
              <li key={t.key ?? "all"}>
                <Link
                  href={href(t.key, q)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:outline-none",
                    active && "bg-card text-foreground shadow-sm",
                  )}
                >
                  {t.label}
                  {t.count !== undefined ? <span className="text-xs tabular-nums opacity-80">{t.count}</span> : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <form method="get" action="/admin/leads" role="search" className="relative w-full lg:w-72">
        {status ? <input type="hidden" name="status" value={status} /> : null}
        <TbSearch
          aria-hidden="true"
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
        />
        <Input
          type="search"
          name="q"
          defaultValue={q}
          placeholder={leadsPage.searchPlaceholder}
          aria-label={leadsPage.searchLabel}
          enterKeyHint="search"
          className="bg-card h-10 pl-9 text-base sm:text-sm"
        />
      </form>
    </div>
  );
}
