import { reportPage } from "@/content/admin";
import { num } from "@/lib/admin/format";
import { pageLabel } from "@/lib/admin/report-logic";
import type { PageRow } from "@/lib/admin/reports";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { cn } from "@/lib/admin/utils";

/** Views, plus the calls and forms that happened on each page. A page that rings the phone is worth more than one that gets looked at. */
export function TopPagesCard({ pages, className }: { pages: PageRow[]; className?: string }) {
  const p = reportPage.pages;
  const max = Math.max(1, ...pages.map((r) => r.views));
  return (
    <Card className={cn("gap-4", className)}>
      <CardHeader>
        <CardTitle className="font-display text-lg">{p.title}</CardTitle>
        <CardDescription>{p.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {pages.length === 0 ? (
          <p className="text-muted-foreground text-sm">{p.empty}</p>
        ) : (
          <table className="w-full table-fixed text-sm">
            <thead>
              <tr className="text-muted-foreground text-xs">
                <th className="pb-2 text-left font-medium">{p.page}</th>
                <th className="w-16 pb-2 pl-3 text-right font-medium sm:w-20">{p.views}</th>
                <th className="w-14 pb-2 pl-3 text-right font-medium sm:w-16">{p.calls}</th>
                <th className="w-14 pb-2 pl-3 text-right font-medium sm:w-16">{p.forms}</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((r) => (
                <tr key={r.path} className="border-t">
                  <td className="py-2">
                    <span className="block truncate font-medium" title={r.path}>
                      {pageLabel(r.path)}
                    </span>
                    {/* Share of the top page, so the drop off is visible at a glance. */}
                    <span aria-hidden="true" className="bg-sea-glass/40 mt-1 block h-1 rounded-full" style={{ width: `${Math.max(2, (r.views / max) * 100)}%` }} />
                  </td>
                  <td className="py-2 pl-3 text-right tabular-nums">{num(r.views)}</td>
                  <td className={cn("py-2 pl-3 text-right tabular-nums", r.calls ? "text-primary font-semibold" : "text-muted-foreground")}>{num(r.calls)}</td>
                  <td className={cn("py-2 pl-3 text-right tabular-nums", r.forms ? "text-primary font-semibold" : "text-muted-foreground")}>{num(r.forms)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
