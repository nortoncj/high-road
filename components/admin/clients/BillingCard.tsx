import { TbBrandStripe, TbExternalLink, TbRefresh, TbUserPlus } from "react-icons/tb";
import { clientPage } from "@/content/admin";
import type { Client, ClientPlan } from "@/lib/admin/clients";
import type { FormState } from "@/lib/admin/client-actions";
import { shortDate, toDate, usd } from "@/lib/admin/format";
import { liveSubscriptionStatuses } from "@/lib/admin/schema";
import { cn } from "@/lib/admin/utils";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { ActionButton } from "./ActionButtons";
import { PlanTag } from "./ClientBits";
import { LinkStripeForm } from "./LinkStripeForm";

type Action = (prev: FormState, fd: FormData) => Promise<FormState>;

const MONTH = 30.44 * 86_400_000;

/** "Payment 7 of 12" for payment plans, from start date and scheduled end. */
function paymentOf(plan: ClientPlan, now: number): string | null {
  if (plan.kind !== "build" || !plan.startedAt || !plan.endsAt) return null;
  const start = Date.parse(plan.startedAt);
  const total = Math.max(1, Math.round((Date.parse(plan.endsAt) - start) / MONTH));
  const n = Math.min(total, Math.max(1, Math.floor((now - start) / MONTH) + 1));
  return clientPage.billing.month(n, total);
}

function PlanLine({ plan, now }: { plan: ClientPlan; now: Date }) {
  const b = clientPage.billing;
  const bits: { text: string; tone?: string }[] = [];
  if (plan.status === "past_due" || plan.status === "unpaid") bits.push({ text: "Payment failed", tone: "text-negative font-medium" });
  else if (plan.status === "paused") bits.push({ text: "Paused", tone: "text-warning font-medium" });
  if (plan.cancelAtPeriodEnd && plan.nextChargeAt)
    bits.push({ text: `Cancels ${shortDate(toDate(plan.nextChargeAt), now)}`, tone: "text-warning font-medium" });
  const of = paymentOf(plan, now.getTime());
  if (of) bits.push({ text: of });
  if (plan.endsAt && plan.kind === "build") bits.push({ text: `${b.ends} ${shortDate(toDate(plan.endsAt), now)}`, tone: "text-brass-ink font-medium" });
  else if (plan.nextChargeAt && !plan.cancelAtPeriodEnd) bits.push({ text: `${b.nextCharge} ${shortDate(toDate(plan.nextChargeAt), now)}` });
  if (plan.source === "manual") bits.push({ text: b.manualNote });

  return (
    <li className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <PlanTag plan={plan} />
        <p className="text-muted-foreground mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-xs">
          {bits.map((bit, i) => (
            <span key={i} className={bit.tone}>
              {i > 0 ? <span aria-hidden="true" className="text-muted-foreground mr-2 font-normal">·</span> : null}
              {bit.text}
            </span>
          ))}
        </p>
      </div>
      <p className="shrink-0 text-right text-sm font-semibold tabular-nums">
        {usd(plan.amountCents)}
        <span className="text-muted-foreground font-normal">/{plan.interval === "year" ? "yr" : plan.interval === "month" ? "mo" : plan.interval}</span>
      </p>
    </li>
  );
}

export function BillingCard({
  client,
  stripeReady,
  stripeUrl,
  linkAction,
  createAction,
  syncAction,
}: {
  client: Client;
  stripeReady: boolean;
  stripeUrl: string | null;
  linkAction: Action;
  createAction: Action;
  syncAction: Action;
}) {
  const b = clientPage.billing;
  const now = new Date();
  const past = client.history.filter((p) => !(liveSubscriptionStatuses as readonly string[]).includes(p.status));

  return (
    <Card className="gap-5">
      <CardHeader>
        <CardTitle className="font-display text-lg">{b.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-muted-foreground text-xs font-medium">{b.monthly}</p>
            <p className={cn("font-display text-3xl font-semibold tracking-tight tabular-nums", client.monthlyCents && "text-brass")}>
              {client.monthlyCents ? usd(client.monthlyCents) : "—"}
            </p>
          </div>
          {client.nextChargeAt ? (
            <p className="text-muted-foreground text-sm">
              {b.nextCharge}{" "}
              <span className="text-foreground font-medium">{shortDate(toDate(client.nextChargeAt), now)}</span>
            </p>
          ) : null}
        </div>

        {client.plans.length ? (
          <ul className="divide-y">
            {client.plans.map((p) => (
              <PlanLine key={p.id} plan={p} now={now} />
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">{b.noPlan}</p>
        )}

        <div className="bg-muted/60 flex flex-col gap-3 rounded-lg p-3">
          {!stripeReady ? (
            <p className="text-muted-foreground text-sm">{b.noStripe}</p>
          ) : client.stripeCustomerId ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="flex min-w-0 items-center gap-2 text-sm">
                <TbBrandStripe aria-hidden="true" className="text-primary size-5 shrink-0" />
                <span className="text-muted-foreground">{b.linked}</span>
                <code className="truncate font-mono text-xs">{client.stripeCustomerId}</code>
              </p>
              <div className="flex gap-2">
                <ActionButton action={syncAction} pendingLabel="Syncing...">
                  <TbRefresh aria-hidden="true" />
                  {b.syncNow}
                </ActionButton>
                {stripeUrl ? (
                  <Button asChild variant="ghost" size="sm">
                    <a href={stripeUrl} target="_blank" rel="noopener noreferrer">
                      <TbExternalLink aria-hidden="true" />
                      <span className="sr-only sm:not-sr-only">Stripe</span>
                    </a>
                  </Button>
                ) : null}
              </div>
            </div>
          ) : (
            <>
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <TbBrandStripe aria-hidden="true" className="text-primary size-5" />
                  {b.linkTitle}
                </p>
                <p className="text-muted-foreground mt-1 text-xs leading-relaxed">{b.linkBody}</p>
              </div>
              <LinkStripeForm action={linkAction} defaultValue={client.email ?? ""} />
              <ActionButton action={createAction} pendingLabel="Creating..." variant="ghost" className="self-start">
                <TbUserPlus aria-hidden="true" />
                {b.create}
              </ActionButton>
            </>
          )}
        </div>

        {past.length ? (
          <details className="group text-sm">
            <summary className="text-muted-foreground hover:text-foreground cursor-pointer text-xs font-medium">
              {b.history} ({past.length})
            </summary>
            <ul className="mt-2 flex flex-col gap-1.5">
              {past.map((p) => (
                <li key={p.id} className="text-muted-foreground flex justify-between gap-3 text-xs">
                  <span className="truncate">{p.name}</span>
                  <span className="shrink-0 tabular-nums">
                    {p.canceledAt ? `Ended ${shortDate(toDate(p.canceledAt), now)}` : p.status}
                  </span>
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </CardContent>
    </Card>
  );
}
