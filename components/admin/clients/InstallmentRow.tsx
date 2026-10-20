"use client";

import { useActionState, useState } from "react";
import { toast } from "sonner";
import { TbCheck, TbCircleDashed, TbCopy, TbLoader2, TbMailForward, TbX } from "react-icons/tb";
import { clientPage } from "@/content/admin";
import type { FormState } from "@/lib/admin/client-actions";
import { shortDate, toDate, usdExact } from "@/lib/admin/format";
import { markInstallmentPaid, markInstallmentUnpaid, sendInstallmentInvoice } from "@/lib/admin/payment-plan-actions";
import type { Installment } from "@/lib/admin/payment-plans";
import { paymentMethodLabel, paymentMethods } from "@/lib/admin/schema";
import { cn } from "@/lib/admin/utils";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/admin/ui/select";
import { ActionButton, useResultToast } from "./ActionButtons";

/**
 * One installment: what it is, where it stands, and the one or two things you'd do next.
 * Buttons sit under the row (not in a menu) so they're one tap on a phone.
 */
export function InstallmentRow({ item, canInvoice, today }: { item: Installment; canInvoice: boolean; today: string }) {
  const t = clientPage.paymentPlans;
  const [paying, setPaying] = useState(false);
  // Saved (or undone): the fresh status closes the form. Done during render, not in an effect.
  const [seenStatus, setSeenStatus] = useState(item.status);
  if (item.status !== seenStatus) {
    setSeenStatus(item.status);
    setPaying(false);
  }
  const now = toDate(today);
  const date = (d: string) => shortDate(toDate(d), now);
  const open = item.status === "pending" || item.status === "invoiced";

  let status: { text: string; tone: string };
  if (item.status === "paid")
    status = { text: t.paid(item.paidAt ? date(item.paidAt) : "", paymentMethodLabel[item.method ?? "other"]), tone: "text-positive" };
  else if (item.status === "void") status = { text: t.cancelled, tone: "text-muted-foreground" };
  else if (item.overdue) status = { text: t.overdue(date(item.dueOn!)), tone: "text-negative font-medium" };
  else status = { text: item.dueOn ? t.due(date(item.dueOn)) : t.noDate, tone: "text-muted-foreground" };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(item.invoiceUrl!);
      toast.success(t.copied);
    } catch {
      window.open(item.invoiceUrl!, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <li className="py-3 first:pt-0 last:pb-0">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full",
            item.status === "paid" ? "bg-positive text-white" : item.overdue ? "bg-negative-soft text-negative" : "text-muted-foreground",
          )}
        >
          {item.status === "paid" ? <TbCheck aria-hidden="true" className="size-3.5" /> : <TbCircleDashed aria-hidden="true" className="size-5" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-baseline justify-between gap-3">
            <span className={cn("truncate text-sm font-medium", item.status === "void" && "text-muted-foreground")}>{item.label}</span>
            <span className={cn("shrink-0 text-sm font-semibold tabular-nums", item.status === "void" && "text-muted-foreground line-through")}>
              {usdExact(item.amountCents)}
            </span>
          </p>
          <p className="mt-0.5 flex flex-wrap gap-x-2 text-xs">
            <span className={status.tone}>{status.text}</span>
            {item.status === "invoiced" ? (
              <span className="text-brass-ink font-medium">
                <span aria-hidden="true" className="text-muted-foreground mr-2 font-normal">·</span>
                {t.invoiced}
              </span>
            ) : null}
          </p>

          {open && !paying ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {item.status === "pending" && canInvoice ? (
                <ActionButton action={sendInstallmentInvoice} fields={{ id: item.id }} pendingLabel={t.sending} className="h-9">
                  <TbMailForward aria-hidden="true" />
                  {t.sendInvoice}
                </ActionButton>
              ) : null}
              {item.status === "invoiced" && item.invoiceUrl ? (
                <Button type="button" variant="outline" size="sm" className="h-9" onClick={copyLink}>
                  <TbCopy aria-hidden="true" />
                  {t.copyLink}
                </Button>
              ) : null}
              <Button type="button" variant="ghost" size="sm" className="h-9" onClick={() => setPaying(true)}>
                <TbCheck aria-hidden="true" />
                {t.markPaid}
              </Button>
            </div>
          ) : null}

          {open && paying ? <MarkPaidForm id={item.id} today={today} onCancel={() => setPaying(false)} /> : null}

          {item.manual ? (
            <ActionButton action={markInstallmentUnpaid} fields={{ id: item.id }} pendingLabel={t.undoing} variant="ghost" className="-ml-2 mt-1 h-8 text-xs">
              {t.undo}
            </ActionButton>
          ) : null}
        </div>
      </div>
    </li>
  );
}

function MarkPaidForm({ id, today, onCancel }: { id: string; today: string; onCancel: () => void }) {
  const t = clientPage.paymentPlans;
  const [state, run, pending] = useActionState<FormState, FormData>(markInstallmentPaid, {});
  useResultToast(state);

  return (
    <form action={run} className="mt-2 grid grid-cols-2 gap-2 rounded-lg border border-dashed p-3 sm:grid-cols-[1fr_1fr_auto]">
      <input type="hidden" name="id" value={id} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`pm-${id}`}>{t.method}</Label>
        <Select name="method" defaultValue="zelle">
          <SelectTrigger id={`pm-${id}`} className="h-10 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {paymentMethods.map((m) => (
              <SelectItem key={m} value={m}>
                {paymentMethodLabel[m]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`po-${id}`}>{t.paidOn}</Label>
        <Input id={`po-${id}`} name="paid_on" type="date" defaultValue={today} max={today} className="h-10 text-base sm:text-sm" />
      </div>
      <div className="col-span-2 flex items-end gap-2 sm:col-span-1">
        <Button type="submit" disabled={pending} className="h-10 flex-1 sm:flex-none">
          {pending ? <TbLoader2 aria-hidden="true" className="animate-spin" /> : null}
          {t.save}
        </Button>
        <Button type="button" variant="ghost" size="icon" className="size-10" onClick={onCancel} aria-label={t.cancel}>
          <TbX aria-hidden="true" />
        </Button>
      </div>
    </form>
  );
}
