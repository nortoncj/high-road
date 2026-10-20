"use client";

import { useActionState, useEffect, type ReactNode } from "react";
import { toast } from "sonner";
import { TbLoader2 } from "react-icons/tb";
import type { FormState } from "@/lib/admin/client-actions";
import { Button } from "@/components/admin/ui/button";

type Action = (prev: FormState, fd: FormData) => Promise<FormState>;

/** Toasts whatever a server action said, once per result. */
export function useResultToast(state: FormState) {
  useEffect(() => {
    if (state.ok && state.message) toast.success(state.message);
    else if (state.error && !state.fields) toast.error(state.error);
  }, [state]);
}

/**
 * A one-button form for actions with no fields: "Sync Stripe", "Sync now", "Create in Stripe".
 * Pass a server action (bind any ids on the server first), or send ids as hidden `fields`.
 * `confirm` asks first, for anything destructive.
 */
export function ActionButton({
  action,
  children,
  pendingLabel,
  variant = "outline",
  size = "sm",
  className,
  fields,
  confirm,
}: {
  action: Action;
  children: ReactNode;
  pendingLabel: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "sm" | "default";
  className?: string;
  fields?: Record<string, string>;
  confirm?: string;
}) {
  const [state, run, pending] = useActionState<FormState, FormData>(action, {});
  useResultToast(state);
  return (
    <form action={run} onSubmit={confirm ? (e) => void (window.confirm(confirm) || e.preventDefault()) : undefined}>
      {fields ? Object.entries(fields).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />) : null}
      <Button type="submit" variant={variant} size={size} disabled={pending} className={className}>
        {pending ? (
          <>
            <TbLoader2 aria-hidden="true" className="animate-spin" />
            {pendingLabel}
          </>
        ) : (
          children
        )}
      </Button>
    </form>
  );
}
