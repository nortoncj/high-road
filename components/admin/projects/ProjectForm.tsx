"use client";

import Link from "next/link";
import { useActionState, type ReactNode } from "react";
import { TbLoader2 } from "react-icons/tb";
import posthog from "posthog-js";
import { projectForm as copy } from "@/content/admin";
import type { FormState } from "@/lib/admin/client-actions";
import { projectStatuses, projectStatusMeta, type ProjectStatus } from "@/lib/admin/schema";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent } from "@/components/admin/ui/card";
import { Checkbox } from "@/components/admin/ui/checkbox";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/admin/ui/select";
import { Textarea } from "@/components/admin/ui/textarea";
import { useResultToast } from "@/components/admin/clients/ActionButtons";

export type ProjectFormValues = {
  name?: string;
  clientId?: string;
  service?: string;
  status?: ProjectStatus;
  startDate?: string;
  dueDate?: string;
  driveUrl?: string;
  notes?: string;
};

/** New and edit. New gets the "start with the checklist" box; edit gets "shift dates with the launch date". */
export function ProjectForm({
  action,
  values,
  clients,
  mode,
  cancelHref,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  values: ProjectFormValues;
  clients: { id: string; name: string }[];
  mode: "new" | "edit";
  cancelHref: string;
}) {
  const [state, run, pending] = useActionState<FormState, FormData>(action, {});
  useResultToast(state);
  const f = copy.fields;
  const v = (k: string, fallback?: string) => state.values?.[k] ?? fallback;

  const input = (key: keyof typeof f, type = "text", def?: string) => {
    const meta = f[key] as { label: string; placeholder?: string };
    const err = state.fields?.[key];
    return (
      <Field id={`pf-${key}`} label={meta.label} error={err}>
        <Input
          id={`pf-${key}`}
          name={key}
          type={type}
          defaultValue={v(key, def)}
          placeholder={meta.placeholder}
          aria-invalid={err ? true : undefined}
          className="h-10 text-base sm:text-sm"
        />
      </Field>
    );
  };

  return (
    <form
      action={run}
      onSubmit={() => posthog.capture("project_save_submitted", { mode })}
      className="flex w-full max-w-3xl flex-col gap-4 sm:gap-6"
      noValidate
    >
      <Card>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">{input("name", "text", values.name)}</div>
          <Field id="pf-client" label={f.client_id.label}>
            <Select key={state.values?.client_id} name="client_id" defaultValue={v("client_id", values.clientId ?? "none")}>
              <SelectTrigger id="pf-client" className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{f.client_id.none}</SelectItem>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          {input("service", "text", values.service)}
          <Field id="pf-status" label={f.status.label}>
            <Select key={state.values?.status} name="status" defaultValue={v("status", values.status ?? "planning")}>
              <SelectTrigger id="pf-status" className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {projectStatuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {projectStatusMeta[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="hidden sm:block" />
          {input("start_date", "date", values.startDate)}
          {input("due_date", "date", values.dueDate)}
          <div className="sm:col-span-2">{input("drive_url", "url", values.driveUrl)}</div>
          <div className="sm:col-span-2">
            <Field id="pf-notes" label={f.notes.label}>
              <Textarea
                id="pf-notes"
                name="notes"
                rows={4}
                defaultValue={v("notes", values.notes)}
                placeholder={f.notes.placeholder}
                className="text-base sm:text-sm"
              />
            </Field>
          </div>

          <label className="bg-secondary/60 flex cursor-pointer items-start gap-3 rounded-lg p-3 sm:col-span-2">
            <Checkbox name={mode === "new" ? "template" : "shift"} defaultChecked className="mt-0.5 size-5" />
            <span>
              <span className="block text-sm font-medium">{mode === "new" ? copy.template : copy.shift}</span>
              {mode === "new" ? <span className="text-muted-foreground block text-xs">{copy.templateHint}</span> : null}
            </span>
          </label>
        </CardContent>
      </Card>

      {state.error && state.fields ? (
        <p role="alert" className="text-negative text-sm">
          {state.error}
        </p>
      ) : null}

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
        <p role="alert" className="text-negative text-xs">
          {error}
        </p>
      ) : null}
    </div>
  );
}
