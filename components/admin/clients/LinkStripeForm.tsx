"use client";

import { useActionState } from "react";
import { TbLink, TbLoader2 } from "react-icons/tb";
import { clientPage } from "@/content/admin";
import type { FormState } from "@/lib/admin/client-actions";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { useResultToast } from "./ActionButtons";

export function LinkStripeForm({
  action,
  defaultValue,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  defaultValue: string;
}) {
  const [state, run, pending] = useActionState<FormState, FormData>(action, {});
  useResultToast(state);
  const b = clientPage.billing;

  return (
    <form action={run} className="flex flex-col gap-2 sm:flex-row">
      <label htmlFor="stripe-customer" className="sr-only">
        {b.linkPlaceholder}
      </label>
      <Input
        id="stripe-customer"
        name="customer"
        defaultValue={state.values?.customer ?? defaultValue}
        placeholder={b.linkPlaceholder}
        autoCapitalize="none"
        spellCheck={false}
        className="bg-card h-10 flex-1 font-mono text-base sm:text-sm"
      />
      <Button type="submit" disabled={pending} className="h-10">
        {pending ? <TbLoader2 aria-hidden="true" className="animate-spin" /> : <TbLink aria-hidden="true" />}
        {b.link}
      </Button>
    </form>
  );
}
