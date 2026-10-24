"use client";

import { useActionState, useState } from "react";
import { TbCheck, TbCopy, TbLoader2, TbPlus } from "react-icons/tb";
import { trackingCard } from "@/content/admin";
import type { FormState } from "@/lib/admin/client-actions";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { useResultToast } from "@/components/admin/clients/ActionButtons";

export function CopySnippet({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="bg-secondary/70 flex items-start gap-2 rounded-md p-2">
      <code className="text-foreground min-w-0 flex-1 font-mono text-[11px] leading-relaxed break-all select-all">{code}</code>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="bg-card shrink-0"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          } catch {
            // Clipboard blocked (http, old browser): the code is select-all, so a tap selects it.
          }
        }}
      >
        {copied ? <TbCheck aria-hidden="true" /> : <TbCopy aria-hidden="true" />}
        <span aria-live="polite">{copied ? trackingCard.copied : trackingCard.copy}</span>
      </Button>
    </div>
  );
}

export function AddSiteForm({ action, first }: { action: (prev: FormState, fd: FormData) => Promise<FormState>; first: boolean }) {
  const [state, run, pending] = useActionState<FormState, FormData>(action, {});
  useResultToast(state);
  const t = trackingCard;
  const err = state.fields?.domain;
  return (
    <form action={run} className="flex flex-col gap-1.5">
      <Label htmlFor="site-domain" className={first ? "" : "sr-only"}>
        {t.addLabel}
      </Label>
      <div className="flex gap-2">
        <Input
          id="site-domain"
          name="domain"
          inputMode="url"
          autoCapitalize="none"
          autoCorrect="off"
          placeholder={t.addPlaceholder}
          defaultValue={state.ok ? "" : (state.values?.domain ?? "")}
          aria-invalid={Boolean(err)}
          aria-describedby={err ? "site-domain-err" : undefined}
          className="h-9"
        />
        <Button type="submit" variant={first ? "default" : "outline"} size="sm" disabled={pending} className="h-9 shrink-0">
          {pending ? <TbLoader2 aria-hidden="true" className="animate-spin" /> : <TbPlus aria-hidden="true" />}
          {pending ? t.adding : t.add}
        </Button>
      </div>
      {err ? (
        <p id="site-domain-err" className="text-negative text-xs">
          {err}
        </p>
      ) : null}
    </form>
  );
}
