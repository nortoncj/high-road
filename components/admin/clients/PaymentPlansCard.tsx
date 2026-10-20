import Link from "next/link";
import { TbTrash } from "react-icons/tb";
import { clientPage } from "@/content/admin";
import type { FormState } from "@/lib/admin/client-actions";
import type { Loaded } from "@/lib/admin/data";
import { shortDate, toDate, usdExact } from "@/lib/admin/format";
import { removePaymentPlan } from "@/lib/admin/payment-plan-actions";
import type { PaymentPlan } from "@/lib/admin/payment-plans";
import { cn } from "@/lib/admin/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { IssueNote } from "../States";
import { ActionButton } from "./ActionButtons";
import { InstallmentRow } from "./InstallmentRow";
import { NewPaymentPlanForm } from "./NewPaymentPlanForm";

type Action = (prev: FormState, fd: FormData) => Promise<FormState>;

/**
 * One-off work paid over time ($2,000 website, half up front). Open plans show every installment
 * with what to do next; paid-off and cancelled ones fold away at the bottom.
 */
export function PaymentPlansCard({
  plans,
  projects,
  canInvoice,
  stripeReady,
  today,
  createAction,
}: {
  plans: Loaded<PaymentPlan[]>;
  projects: { id: string; name: string }[];
  canInvoice: boolean;
  stripeReady: boolean;
  today: string;
  createAction: Action;
}) {
  const t = clientPage.paymentPlans;
  const live = plans.ok ? plans.data.filter((p) => !p.cancelled && !p.paidOff) : [];
  const closed = plans.ok ? plans.data.filter((p) => p.cancelled || p.paidOff) : [];

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="font-display text-lg">{t.title}</CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {!plans.ok ? (
          <div className="-mx-4 sm:-mx-6">
            <IssueNote issue={plans.issue} />
          </div>
        ) : plans.data.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t.empty}</p>
        ) : null}

        {live.map((p) => (
          <PlanBlock key={p.id} plan={p} canInvoice={canInvoice} today={today} />
        ))}

        {live.length && stripeReady && !canInvoice ? <p className="text-muted-foreground text-xs">{t.connectStripe}</p> : null}

        {closed.length ? (
          <details className="group">
            <summary className="text-muted-foreground hover:text-foreground cursor-pointer text-xs font-medium">{t.closed(closed.length)}</summary>
            <div className="mt-3 flex flex-col gap-5">
              {closed.map((p) => (
                <PlanBlock key={p.id} plan={p} canInvoice={false} today={today} />
              ))}
            </div>
          </details>
        ) : null}

        {plans.ok ? <NewPaymentPlanForm action={createAction} projects={projects} today={today} /> : null}
      </CardContent>
    </Card>
  );
}

function PlanBlock({ plan, canInvoice, today }: { plan: PaymentPlan; canInvoice: boolean; today: string }) {
  const t = clientPage.paymentPlans;
  const pct = plan.totalCents ? Math.min(100, Math.round((plan.paidCents / plan.totalCents) * 100)) : 0;
  const now = toDate(today);

  return (
    <section className="flex flex-col gap-3 rounded-lg border p-3 sm:p-4" aria-label={plan.title}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold">{plan.title}</h3>
          <p className="text-muted-foreground truncate text-xs">
            {plan.project ? (
              <Link href={`/admin/projects/${plan.project.id}`} className="hover:text-foreground hover:underline">
                {plan.project.name}
              </Link>
            ) : null}
            {plan.project ? " · " : null}
            {t.started(shortDate(toDate(plan.createdAt), now))}
          </p>
        </div>
        <p className="shrink-0 text-right">
          <span className="font-display block text-lg leading-tight font-semibold tabular-nums">{usdExact(plan.totalCents)}</span>
          <span
            className={cn(
              "text-xs font-medium",
              plan.cancelled ? "text-muted-foreground" : plan.paidOff ? "text-positive" : "text-muted-foreground",
            )}
          >
            {plan.cancelled ? t.cancelled : plan.paidOff ? t.paidOff : t.paidOf(usdExact(plan.paidCents), usdExact(plan.totalCents))}
          </span>
        </p>
      </div>

      <div
        className="bg-muted h-1.5 overflow-hidden rounded-full"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t.paidOf(usdExact(plan.paidCents), usdExact(plan.totalCents))}
      >
        <div className={cn("h-full rounded-full", plan.paidOff ? "bg-positive" : "bg-primary")} style={{ width: `${pct}%` }} />
      </div>

      <ul className="divide-y">
        {plan.installments.map((i) => (
          <InstallmentRow key={i.id} item={i} canInvoice={canInvoice} today={today} />
        ))}
      </ul>

      {!plan.cancelled && !plan.paidOff ? (
        <ActionButton
          action={removePaymentPlan}
          fields={{ id: plan.id }}
          confirm={t.removeConfirm}
          pendingLabel={t.removing}
          variant="ghost"
          className="text-muted-foreground hover:text-negative -ml-2 self-start text-xs"
        >
          <TbTrash aria-hidden="true" />
          {t.remove}
        </ActionButton>
      ) : null}
    </section>
  );
}
