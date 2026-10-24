"use client";

import { useActionState, useEffect, useState } from "react";
import { TbDownload, TbEye, TbLoader2, TbSend } from "react-icons/tb";
import { reportPage } from "@/content/admin";
import type { FormState } from "@/lib/admin/client-actions";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/admin/ui/sheet";
import { Textarea } from "@/components/admin/ui/textarea";
import { useResultToast } from "@/components/admin/clients/ActionButtons";

type Action = (prev: FormState, fd: FormData) => Promise<FormState>;

/** Preview, download, email. The PDF is built fresh each time, so it always matches the page. */
export function ReportActions({
  pdfHref,
  monthLabel,
  suggestedTo,
  sentThisMonth,
  emailReady,
  disabled,
  sendAction,
}: {
  pdfHref: string;
  monthLabel: string;
  suggestedTo: string | null;
  /** "Oct 3" if this month already went out. */
  sentThisMonth: string | null;
  emailReady: boolean;
  disabled?: boolean;
  sendAction: Action;
}) {
  const a = reportPage.actions;
  const [open, setOpen] = useState(false);
  const join = pdfHref.includes("?") ? "&" : "?";

  return (
    <>
      <div className="grid grid-cols-3 gap-2 sm:flex">
        <Button asChild variant="outline" disabled={disabled}>
          <a href={`${pdfHref}${join}inline=1`} target="_blank" rel="noopener noreferrer" aria-disabled={disabled}>
            <TbEye aria-hidden="true" />
            {a.preview}
          </a>
        </Button>
        <Button asChild variant="outline" disabled={disabled}>
          <a href={pdfHref} download aria-disabled={disabled}>
            <TbDownload aria-hidden="true" />
            <span className="sm:hidden">PDF</span>
            <span className="hidden sm:inline">{a.download}</span>
          </a>
        </Button>
        <Button onClick={() => setOpen(true)} disabled={disabled}>
          <TbSend aria-hidden="true" />
          <span className="sm:hidden">Email</span>
          <span className="hidden sm:inline">{a.email}</span>
        </Button>
      </div>
      <EmailSheet
        open={open}
        onClose={() => setOpen(false)}
        monthLabel={monthLabel}
        suggestedTo={suggestedTo}
        sentThisMonth={sentThisMonth}
        emailReady={emailReady}
        action={sendAction}
      />
    </>
  );
}

function EmailSheet({
  open,
  onClose,
  monthLabel,
  suggestedTo,
  sentThisMonth,
  emailReady,
  action,
}: {
  open: boolean;
  onClose: () => void;
  monthLabel: string;
  suggestedTo: string | null;
  sentThisMonth: string | null;
  emailReady: boolean;
  action: Action;
}) {
  const isMobile = useIsMobile();
  const [state, run, pending] = useActionState<FormState, FormData>(action, {});
  const e = reportPage.emailSheet;
  useResultToast(state);

  useEffect(() => {
    if (state.ok) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <Sheet open={open} onOpenChange={(o: boolean) => !o && onClose()}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className="max-h-[90svh] gap-0 overflow-y-auto rounded-t-2xl pb-[env(safe-area-inset-bottom)] sm:max-h-none sm:max-w-md sm:rounded-none"
      >
        <SheetHeader className="border-b">
          <SheetTitle className="font-display text-lg">{e.title}</SheetTitle>
          <SheetDescription>{e.description(monthLabel)}</SheetDescription>
        </SheetHeader>
        <form action={run} className="flex flex-col gap-4 p-4">
          {!emailReady ? <p className="bg-warning-soft text-warning rounded-lg px-3 py-2.5 text-sm">{e.notConfigured}</p> : null}
          {sentThisMonth ? <p className="bg-secondary text-secondary-foreground rounded-lg px-3 py-2.5 text-sm">{e.already(sentThisMonth)}</p> : null}
          <div className="flex flex-col gap-2">
            <Label htmlFor="rs-to">{e.to}</Label>
            <Input
              id="rs-to"
              name="to"
              type="email"
              required
              autoComplete="off"
              defaultValue={state.values?.to ?? suggestedTo ?? ""}
              aria-invalid={Boolean(state.fields?.to)}
              aria-describedby="rs-to-hint"
              className="h-10 text-base sm:text-sm"
            />
            <p id="rs-to-hint" className={state.fields?.to ? "text-negative text-xs" : "text-muted-foreground text-xs"}>
              {state.fields?.to ?? e.toHint}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="rs-note">{e.note}</Label>
            <Textarea
              id="rs-note"
              name="note"
              rows={4}
              defaultValue={state.values?.note ?? ""}
              placeholder={e.notePlaceholder}
              className="text-base sm:text-sm"
            />
          </div>
          {state.error && !state.fields ? <p className="text-negative text-sm">{state.error}</p> : null}
          <Button type="submit" disabled={pending || !emailReady} className="w-full sm:w-fit">
            {pending ? <TbLoader2 aria-hidden="true" className="animate-spin" /> : <TbSend aria-hidden="true" />}
            {pending ? e.sending : e.send}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
