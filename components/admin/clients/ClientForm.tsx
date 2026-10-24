"use client";

import Link from "next/link";
import { useActionState, type ReactNode } from "react";
import { TbInfoCircle, TbLoader2 } from "react-icons/tb";
import { clientForm as copy } from "@/content/admin";
import { saveClient, type FormState } from "@/lib/admin/client-actions";
import { clientStatuses, clientStatusMeta, type ClientStatus } from "@/lib/admin/schema";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/admin/ui/select";
import { Textarea } from "@/components/admin/ui/textarea";
import { useResultToast } from "./ActionButtons";

export type ClientFormValues = {
  id?: string;
  leadId?: string;
  name?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
  status?: ClientStatus;
  onboardedOn?: string;
  notes?: string;
  manualPlan?: string;
  manualMonthly?: string;
  manualRenewsOn?: string;
};

type FieldKey = keyof typeof copy.fields;

/** One form for add, add-from-lead and edit. Server action validates; errors land next to the field. */
export function ClientForm({ values, cancelHref, fromLead }: { values: ClientFormValues; cancelHref: string; fromLead?: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveClient, {});
  useResultToast(state);

  const field = (
    key: FieldKey,
    opts: { defaultValue?: string; type?: string; inputMode?: "email" | "tel" | "url" | "decimal"; autoComplete?: string; required?: boolean } = {},
  ) => {
    const f = copy.fields[key] as { label: string; placeholder?: string };
    const value = state.values?.[key] ?? opts.defaultValue;
    const err = state.fields?.[key];
    return (
      <Field id={`cf-${key}`} label={f.label} error={err}>
        <Input
          id={`cf-${key}`}
          name={key}
          type={opts.type ?? "text"}
          inputMode={opts.inputMode}
          autoComplete={opts.autoComplete ?? "off"}
          required={opts.required}
          defaultValue={value}
          placeholder={f.placeholder}
          aria-invalid={err ? true : undefined}
          aria-describedby={err ? `cf-${key}-error` : undefined}
          className="h-10 text-base sm:text-sm"
        />
      </Field>
    );
  };

  return (
    <form action={action} className="flex w-full max-w-3xl flex-col gap-4 sm:gap-6" noValidate>
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}
      {values.leadId ? <input type="hidden" name="lead_id" value={values.leadId} /> : null}

      {fromLead ? (
        <p className="bg-sea-foam text-primary flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm">
          <TbInfoCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {copy.fromLeadNote}
        </p>
      ) : null}

      <Card className="gap-5">
        <CardHeader>
          <CardTitle className="font-display text-lg">{copy.sections.business}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">{field("name", { defaultValue: values.name, required: true, autoComplete: "organization" })}</div>
          {field("contact_name", { defaultValue: values.contactName, autoComplete: "name" })}
          {field("email", { defaultValue: values.email, type: "email", inputMode: "email", autoComplete: "email" })}
          {field("phone", { defaultValue: values.phone, type: "tel", inputMode: "tel", autoComplete: "tel" })}
          {field("website", { defaultValue: values.website, inputMode: "url", autoComplete: "url" })}
          <Field id="cf-status" label={copy.fields.status.label} error={state.fields?.status}>
            <Select key={state.values?.status} name="status" defaultValue={state.values?.status ?? values.status ?? "active"}>
              <SelectTrigger id="cf-status" className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {clientStatuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {clientStatusMeta[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          {field("onboarded_on", { defaultValue: values.onboardedOn, type: "date" })}
        </CardContent>
      </Card>

      <Card className="gap-5">
        <CardHeader>
          <CardTitle className="font-display text-lg">{copy.sections.billing}</CardTitle>
          <CardDescription>{copy.billingHint}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          {field("manual_plan", { defaultValue: values.manualPlan })}
          {field("manual_monthly", { defaultValue: values.manualMonthly, inputMode: "decimal" })}
          {field("manual_renews_on", { defaultValue: values.manualRenewsOn, type: "date" })}
        </CardContent>
      </Card>

      <Card className="gap-5">
        <CardHeader>
          <CardTitle className="font-display text-lg">{copy.sections.notes}</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="cf-notes" className="sr-only">
            {copy.fields.notes.label}
          </Label>
          <Textarea
            id="cf-notes"
            name="notes"
            rows={4}
            defaultValue={state.values?.notes ?? values.notes}
            placeholder={copy.fields.notes.placeholder}
            className="text-base sm:text-sm"
          />
        </CardContent>
      </Card>

      {state.error && state.fields ? (
        <p role="alert" className="text-negative text-sm">
          {state.error}
        </p>
      ) : null}

      {/* Sticky on a phone so Save is always in thumb reach. */}
      <div className="bg-background/85 sticky bottom-0 -mx-4 flex gap-2 border-t px-4 py-3 backdrop-blur-md sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <Button type="submit" size="lg" disabled={pending} className="flex-1 sm:flex-none">
          {pending ? <TbLoader2 aria-hidden="true" className="animate-spin" /> : null}
          {pending ? copy.saving : copy.save}
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href={cancelHref}>{copy.cancel}</Link>
        </Button>
      </div>
    </form>
  );
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-negative text-xs">
          {error}
        </p>
      ) : null}
    </div>
  );
}
