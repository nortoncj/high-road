"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { TbBuildingStore, TbMail, TbPhone, TbUserCheck } from "react-icons/tb";
import { leadsPage } from "@/content/admin";
import type { Lead } from "@/lib/admin/data";
import { fullDateTime, initials } from "@/lib/admin/format";
import { updateLeadStatus } from "@/lib/admin/lead-actions";
import { leadSourceLabel, leadStatuses, leadStatusMeta, type LeadStatus } from "@/lib/admin/schema";
import { cn } from "@/lib/admin/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback } from "@/components/admin/ui/avatar";
import { Button } from "@/components/admin/ui/button";
import { Label } from "@/components/admin/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/admin/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/admin/ui/sheet";

/**
 * Lead details. Opens from `?lead=<id>` so it works from any link (overview rows, activity),
 * survives a refresh, and the back button closes it. Side panel on desktop, bottom sheet on a phone.
 */
export function LeadSheet({ lead, closeHref }: { lead: Lead | null; closeHref: string }) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [dismissed, setDismissed] = useState<string | null>(null);

  // Keep the last lead around so the sheet can animate out after the URL drops it.
  // Adjusting state during render (not in an effect) is React's pattern for "reset when a prop changes".
  const [shown, setShown] = useState<Lead | null>(lead);
  if (lead && lead !== shown) setShown(lead);
  if (!lead && dismissed !== null) setDismissed(null);

  if (!shown) return null;
  const open = Boolean(lead) && dismissed !== lead?.id;
  const s = leadsPage.sheet;

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        if (o || !lead) return;
        setDismissed(lead.id);
        router.replace(closeHref, { scroll: false });
      }}
    >
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className="max-h-[88svh] gap-0 overflow-y-auto rounded-t-2xl pb-[env(safe-area-inset-bottom)] sm:max-h-none sm:max-w-md sm:rounded-none"
      >
        <SheetHeader className="border-b pr-12">
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarFallback className="bg-secondary text-secondary-foreground text-sm font-semibold">
                {initials(shown.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <SheetTitle className="font-display truncate text-lg">{shown.name}</SheetTitle>
              <SheetDescription className="truncate">{shown.email}</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex flex-col gap-6 p-4">
          <div className="grid grid-cols-2 gap-2">
            <Button asChild className={shown.phone ? undefined : "col-span-2"}>
              <a href={`mailto:${shown.email}`}>
                <TbMail aria-hidden="true" />
                {s.email}
              </a>
            </Button>
            {shown.phone ? (
              <Button asChild variant="outline">
                <a href={`tel:${shown.phone.replace(/[^\d+]/g, "")}`}>
                  <TbPhone aria-hidden="true" />
                  {s.call}
                </a>
              </Button>
            ) : null}
          </div>

          {shown.client ? (
            <Button asChild variant="secondary" className="justify-start">
              <Link href={`/admin/clients/${shown.client.id}`}>
                <TbBuildingStore aria-hidden="true" />
                <span className="truncate">{leadsPage.viewClient(shown.client.name)}</span>
              </Link>
            </Button>
          ) : (
            <div className="bg-sea-foam/60 flex flex-col gap-2 rounded-lg p-3">
              <Button asChild variant="outline" className="bg-card">
                <Link href={`/admin/clients/new?lead=${encodeURIComponent(shown.id)}`}>
                  <TbUserCheck aria-hidden="true" />
                  {leadsPage.convert}
                </Link>
              </Button>
              <p className="text-muted-foreground text-xs leading-relaxed">{leadsPage.convertHint}</p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="lead-status">{s.statusLabel}</Label>
            <StatusSelect key={shown.id} id={shown.id} status={shown.status} />
          </div>

          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold">{s.message}</h3>
            <p
              className={cn(
                "bg-muted rounded-lg p-3 text-sm leading-relaxed whitespace-pre-wrap",
                !shown.message && "text-muted-foreground italic",
              )}
            >
              {shown.message ?? s.noMessage}
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold">{s.details}</h3>
            <dl className="grid grid-cols-[7rem_minmax(0,1fr)] gap-x-3 gap-y-2 text-sm">
              <Detail label="Service" value={shown.service} />
              <Detail label="Came in as" value={leadSourceLabel[shown.source]} />
              <Detail label="Phone" value={shown.phone} />
              <Detail
                label="Website"
                value={
                  shown.website ? (
                    <a
                      className="text-primary underline-offset-2 hover:underline"
                      href={/^https?:\/\//.test(shown.website) ? shown.website : `https://${shown.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {shown.website.replace(/^https?:\/\//, "")}
                    </a>
                  ) : null
                }
              />
              <Detail label="Received" value={fullDateTime(new Date(shown.createdAt))} />
            </dl>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Detail({ label, value }: { label: string; value: ReactNode }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate">{value ?? <span className="text-muted-foreground">—</span>}</dd>
    </>
  );
}

function StatusSelect({ id, status }: { id: string; status: LeadStatus }) {
  const [value, setValue] = useState<LeadStatus>(status);
  const [pending, startTransition] = useTransition();

  return (
    <Select
      value={value}
      disabled={pending}
      onValueChange={(v) => {
        const prev = value;
        const next = v as LeadStatus;
        setValue(next); // optimistic: feels instant, rolls back if Supabase says no
        startTransition(async () => {
          const res = await updateLeadStatus(id, next);
          if (res.ok) toast.success(leadsPage.sheet.saved(leadStatusMeta[next].label));
          else {
            setValue(prev);
            toast.error(leadsPage.sheet.failed, { description: res.error });
          }
        });
      }}
    >
      <SelectTrigger id="lead-status" className="h-10 w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {leadStatuses.map((st) => (
          <SelectItem key={st} value={st}>
            <span aria-hidden="true" className={cn("size-2 rounded-full", leadStatusMeta[st].dot)} />
            {leadStatusMeta[st].label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
