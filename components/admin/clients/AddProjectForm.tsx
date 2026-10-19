"use client";

import { useActionState, useEffect, useState } from "react";
import { TbLoader2, TbPlus } from "react-icons/tb";
import { clientPage } from "@/content/admin";
import type { FormState } from "@/lib/admin/client-actions";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { useResultToast } from "./ActionButtons";

/** Collapsed to one button until you need it, so the card stays short on a phone. */
export function AddProjectForm({ action }: { action: (prev: FormState, fd: FormData) => Promise<FormState> }) {
  const [open, setOpen] = useState(false);
  const [state, run, pending] = useActionState<FormState, FormData>(action, {});
  useResultToast(state);
  const p = clientPage.projects;

  useEffect(() => {
    if (state.ok) setOpen(false);
  }, [state]);

  if (!open) {
    return (
      <Button type="button" variant="outline" size="sm" className="self-start" onClick={() => setOpen(true)}>
        <TbPlus aria-hidden="true" />
        {p.add}
      </Button>
    );
  }

  return (
    <form action={run} className="grid gap-3 rounded-lg border border-dashed p-3 sm:grid-cols-[1fr_1fr_auto]">
      <div className="flex flex-col gap-1.5 sm:col-span-3">
        <Label htmlFor="np-name">{p.name}</Label>
        <Input id="np-name" name="name" required autoFocus placeholder={p.namePlaceholder} className="h-10 text-base sm:text-sm" />
        {state.fields?.name ? <p className="text-negative text-xs">{state.fields.name}</p> : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="np-service">{p.service}</Label>
        <Input id="np-service" name="service" placeholder={p.servicePlaceholder} className="h-10 text-base sm:text-sm" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="np-due">{p.due}</Label>
        <Input id="np-due" name="due_date" type="date" className="h-10 text-base sm:text-sm" />
      </div>
      <div className="flex items-end gap-2">
        <Button type="submit" disabled={pending} className="h-10 flex-1 sm:flex-none">
          {pending ? <TbLoader2 aria-hidden="true" className="animate-spin" /> : null}
          {p.save}
        </Button>
        <Button type="button" variant="ghost" className="h-10" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
