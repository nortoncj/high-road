import Link from "next/link";
import { TbSearch } from "react-icons/tb";
import { clientsPage } from "@/content/admin";
import type { ClientFilter } from "@/lib/admin/clients";
import { cn } from "@/lib/admin/utils";
import { Input } from "@/components/admin/ui/input";

const order: ClientFilter[] = ["active", "paused", "churned", "all"];

function href(status: ClientFilter, q?: string) {
  const sp = new URLSearchParams();
  if (status !== "active") sp.set("status", status);
  if (q) sp.set("q", q);
  const qs = sp.toString();
  return qs ? `/admin/clients?${qs}` : "/admin/clients";
}

/** Same pattern as Leads: links and a GET form, no client JS, every view is a URL. */
export function ClientFilters({ status, q, counts }: { status: ClientFilter; q?: string; counts?: Record<ClientFilter, number> }) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <nav aria-label="Filter by status" className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
        <ul className="bg-secondary flex w-max gap-1 rounded-lg p-1">
          {order.map((s) => {
            const active = s === status;
            return (
              <li key={s}>
                <Link
                  href={href(s, q)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:outline-none",
                    active && "bg-card text-foreground shadow-sm",
                  )}
                >
                  {clientsPage.tabs[s]}
                  {counts ? <span className="text-xs tabular-nums opacity-80">{counts[s]}</span> : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <form method="get" action="/admin/clients" role="search" className="relative w-full lg:w-72">
        {status !== "active" ? <input type="hidden" name="status" value={status} /> : null}
        <TbSearch
          aria-hidden="true"
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
        />
        <Input
          type="search"
          name="q"
          defaultValue={q}
          placeholder={clientsPage.searchPlaceholder}
          aria-label={clientsPage.searchLabel}
          enterKeyHint="search"
          className="bg-card h-10 pl-9 text-base sm:text-sm"
        />
      </form>
    </div>
  );
}
