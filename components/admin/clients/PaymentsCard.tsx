import { TbReceipt } from "react-icons/tb";
import { clientPage } from "@/content/admin";
import type { Loaded } from "@/lib/admin/data";
import type { ClientPayment } from "@/lib/admin/clients";
import { shortDate, toDate, usd } from "@/lib/admin/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { IssueNote } from "../States";

export function PaymentsCard({ payments }: { payments: Loaded<ClientPayment[]> }) {
  const p = clientPage.payments;
  const now = new Date();
  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="font-display text-lg">{p.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {!payments.ok ? (
          <div className="-mx-4 sm:-mx-6">
            <IssueNote issue={payments.issue} />
          </div>
        ) : payments.data.length === 0 ? (
          <p className="text-muted-foreground text-sm">{p.empty}</p>
        ) : (
          <ul className="divide-y">
            {payments.data.map((pay) => (
              <li key={pay.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-sm font-semibold tabular-nums">{usd(pay.amountCents)}</p>
                  <p className="text-muted-foreground truncate text-xs">
                    {[pay.paidAt ? shortDate(toDate(pay.paidAt), now) : null, pay.description ?? pay.number].filter(Boolean).join(" · ")}
                  </p>
                </div>
                {pay.url ? (
                  <a
                    href={pay.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary inline-flex shrink-0 items-center gap-1 text-xs font-medium hover:underline"
                  >
                    <TbReceipt aria-hidden="true" className="size-4" />
                    {p.receipt}
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
