"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TbLoader2, TbRefresh, TbSend } from "react-icons/tb";
import { settingsPage } from "@/content/admin";
import type { FormState } from "@/lib/admin/client-actions";
import { cn } from "@/lib/admin/utils";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { useResultToast } from "@/components/admin/clients/ActionButtons";

type Action = (prev: FormState, fd: FormData) => Promise<FormState>;

/** Two taps to do something you can't undo with one: "Remove" turns into "Sure?" for a few seconds. */
export function ConfirmButton({ action, label, confirmLabel, pendingLabel, title }: { action: Action; label: string; confirmLabel: string; pendingLabel: string; title?: string }) {
  const [state, run, pending] = useActionState<FormState, FormData>(action, {});
  const [armed, setArmed] = useState(false);
  useResultToast(state);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(t);
  }, [armed]);
  return (
    <form action={run}>
      <Button
        type={armed ? "submit" : "button"}
        size="sm"
        variant={armed ? "default" : "ghost"}
        title={title}
        disabled={pending}
        onClick={armed ? undefined : () => setArmed(true)}
        className={cn(armed ? "bg-negative hover:bg-negative/90 text-white" : "text-muted-foreground hover:text-negative")}
      >
        {pending ? <TbLoader2 aria-hidden="true" className="animate-spin" /> : null}
        {pending ? pendingLabel : armed ? confirmLabel : label}
      </Button>
    </form>
  );
}

export function InviteForm({ action }: { action: Action }) {
  const [state, run, pending] = useActionState<FormState, FormData>(action, {});
  const t = settingsPage.invite;
  useResultToast(state);
  const err = state.fields?.email;
  return (
    <form action={run} className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="inv-email">{t.email}</Label>
          <Input
            id="inv-email"
            name="email"
            type="email"
            required
            autoComplete="off"
            placeholder={t.emailPlaceholder}
            defaultValue={state.ok ? "" : (state.values?.email ?? "")}
            aria-invalid={Boolean(err)}
            aria-describedby={err ? "inv-email-err" : "inv-hint"}
            className="h-10 text-base sm:text-sm"
          />
          {err ? (
            <p id="inv-email-err" className="text-negative text-xs">
              {err}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="inv-name">{t.name}</Label>
          <Input id="inv-name" name="name" autoComplete="off" placeholder={t.namePlaceholder} defaultValue={state.ok ? "" : (state.values?.name ?? "")} className="h-10 text-base sm:text-sm" />
        </div>
      </div>
      <p id="inv-hint" className="text-muted-foreground text-xs leading-relaxed">
        {t.hint}
      </p>
      {state.error && !state.fields ? <p className="text-negative text-sm">{state.error}</p> : null}
      <Button type="submit" disabled={pending} className="w-full sm:w-fit">
        {pending ? <TbLoader2 aria-hidden="true" className="animate-spin" /> : <TbSend aria-hidden="true" />}
        {pending ? t.sending : t.submit}
      </Button>
    </form>
  );
}

/** A real switch (role="switch"), saved the moment you flip it. Flips back if the save fails. */
export function AlertSwitch({ on, action }: { on: boolean; action: (on: boolean) => Promise<FormState> }) {
  const a = settingsPage.alerts;
  const [value, setValue] = useState(on);
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={a.toggle}
      disabled={pending}
      onClick={() => {
        const next = !value;
        setValue(next);
        start(async () => {
          const r = await action(next);
          if (r.error) {
            setValue(!next);
            toast.error(r.error);
          } else if (r.message) toast.success(r.message);
        });
      }}
      className={cn(
        "focus-visible:ring-ring relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-70",
        value ? "bg-primary" : "bg-input",
      )}
    >
      <span className={cn("bg-card inline-block size-5 rounded-full shadow transition-transform", value ? "translate-x-[22px]" : "translate-x-0.5")} />
    </button>
  );
}

export function RecheckButton() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const c = settingsPage.connections;
  return (
    <Button variant="outline" size="sm" disabled={pending} onClick={() => start(() => router.refresh())}>
      <TbRefresh aria-hidden="true" className={pending ? "animate-spin" : undefined} />
      {pending ? c.checking : c.recheck}
    </Button>
  );
}
