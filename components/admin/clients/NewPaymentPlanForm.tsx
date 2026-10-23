"use client";

import { useActionState, useState } from "react";
import { TbAlertTriangle, TbCheck, TbLoader2, TbPlus } from "react-icons/tb";
import posthog from "posthog-js";
import { clientPage } from "@/content/admin";
import type { FormState } from "@/lib/admin/client-actions";
import { usdExact } from "@/lib/admin/format";
import { MAX_INSTALLMENTS, frequencies, parseDollars, splitSchedule, type Frequency } from "@/lib/admin/payment-plan-logic";
import { cn } from "@/lib/admin/utils";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/admin/ui/select";
import { useResultToast } from "./ActionButtons";

type Action = (prev: FormState, fd: FormData) => Promise<FormState>;
type Row = { label: string; amount: string; due: string };
type Setup = { total: string; count: string; deposit: string; firstDue: string; every: Frequency };

const NO_PROJECT = "none";
const dollars = (cents: number) => (cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2));

function build(s: Setup): Row[] {
  const total = parseDollars(s.total);
  const deposit = parseDollars(s.deposit);
  if (!total || Number.isNaN(total)) return [];
  return splitSchedule({
    totalCents: total,
    count: Number(s.count) || 1,
    depositCents: deposit && !Number.isNaN(deposit) ? deposit : 0,
    firstDue: s.firstDue || null,
    every: s.every,
  }).map((r) => ({ label: r.label, amount: dollars(r.amountCents), due: r.dueOn ?? "" }));
}

/**
 * "$2,000, half now, half at launch." Fill in the price and how many payments, and the schedule
 * builds itself; tweak any row after. Collapsed to one button until you need it.
 */
export function NewPaymentPlanForm({ action, projects, today }: { action: Action; projects: { id: string; name: string }[]; today: string }) {
  const t = clientPage.paymentPlans;
  const f = t.form;
  const [open, setOpen] = useState(false);
  const [state, run, pending] = useActionState<FormState, FormData>(action, {});
  useResultToast(state);

  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState(projects[0]?.id ?? NO_PROJECT);
  const [setup, setSetup] = useState<Setup>({ total: "", count: "2", deposit: "", firstDue: today, every: "month" });
  const [rows, setRows] = useState<Row[]>([]);

  const [seen, setSeen] = useState(state);
  if (state !== seen) {
    setSeen(state);
    if (state.ok) {
      setOpen(false);
      setTitle("");
      setSetup({ total: "", count: "2", deposit: "", firstDue: today, every: "month" });
      setRows([]);
    }
  }

  const change = (patch: Partial<Setup>) => {
    const next = { ...setup, ...patch };
    setSetup(next);
    setRows(build(next));
  };
  const editRow = (i: number, patch: Partial<Row>) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  const totalCents = parseDollars(setup.total);
  const sum = rows.reduce((acc, r) => acc + (parseDollars(r.amount) || 0), 0);
  const balanced = Boolean(totalCents) && sum === totalCents;
  const err = state.fields ?? {};

  if (!open) {
    return (
      <Button type="button" variant="outline" size="sm" className="self-start" onClick={() => setOpen(true)}>
        <TbPlus aria-hidden="true" />
        {t.add}
      </Button>
    );
  }

  const input = "h-10 text-base sm:text-sm";

  return (
    <form
      action={run}
      onSubmit={() =>
        posthog.capture("payment_plan_create_submitted", {
          installment_count: rows.length,
          frequency: setup.every,
          linked_to_project: projectId !== NO_PROJECT,
        })
      }
      className="flex flex-col gap-4 rounded-lg border border-dashed p-3 sm:p-4"
      noValidate
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pp-title">{f.title}</Label>
          <Input
            id="pp-title"
            name="title"
            required
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={f.titlePlaceholder}
            aria-invalid={err.title ? true : undefined}
            className={input}
          />
          {err.title ? <p className="text-negative text-xs">{err.title}</p> : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pp-project">{f.project}</Label>
          <Select value={projectId} onValueChange={setProjectId}>
            <SelectTrigger id="pp-project" className="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_PROJECT}>{f.noProject}</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {projectId !== NO_PROJECT ? <input type="hidden" name="project_id" value={projectId} /> : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pp-total">{f.total}</Label>
          <Input
            id="pp-total"
            name="total"
            inputMode="decimal"
            value={setup.total}
            onChange={(e) => change({ total: e.target.value })}
            placeholder={f.totalPlaceholder}
            aria-invalid={err.total ? true : undefined}
            className={input}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pp-count">{f.count}</Label>
          <Input
            id="pp-count"
            type="number"
            min={1}
            max={MAX_INSTALLMENTS}
            inputMode="numeric"
            value={setup.count}
            onChange={(e) => change({ count: e.target.value })}
            className={input}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pp-deposit">{f.deposit}</Label>
          <Input
            id="pp-deposit"
            inputMode="decimal"
            value={setup.deposit}
            onChange={(e) => change({ deposit: e.target.value })}
            placeholder={f.depositPlaceholder}
            className={input}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pp-first">{f.firstDue}</Label>
          <Input id="pp-first" type="date" value={setup.firstDue} onChange={(e) => change({ firstDue: e.target.value })} className={input} />
        </div>
        <div className="col-span-2 flex flex-col gap-1.5 sm:col-span-1">
          <Label htmlFor="pp-every">{f.every}</Label>
          <Select value={setup.every} onValueChange={(v) => change({ every: v as Frequency })}>
            <SelectTrigger id="pp-every" className="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {frequencies.map((fr) => (
                <SelectItem key={fr.value} value={fr.value}>
                  {fr.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {err.total ? <p className="text-negative -mt-2 text-xs">{err.total}</p> : null}

      {rows.length ? (
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium">{f.schedule}</legend>
          <p className="text-muted-foreground -mt-1 text-xs">{f.scheduleHint}</p>
          <div className="text-muted-foreground hidden grid-cols-[minmax(0,1fr)_7rem_10rem] gap-2 text-xs font-medium sm:grid">
            <span>{f.label}</span>
            <span>{f.amount}</span>
            <span>{f.dueOn}</span>
          </div>
          <ol className="flex flex-col gap-2">
            {rows.map((r, i) => (
              <li key={i} className="grid grid-cols-2 gap-2 sm:grid-cols-[minmax(0,1fr)_7rem_10rem]">
                <Input
                  name="row_label"
                  aria-label={`${f.label} ${i + 1}`}
                  value={r.label}
                  onChange={(e) => editRow(i, { label: e.target.value })}
                  className={cn(input, "col-span-2 sm:col-span-1")}
                />
                <Input
                  name="row_amount"
                  aria-label={`${f.amount} ${i + 1}`}
                  inputMode="decimal"
                  value={r.amount}
                  onChange={(e) => editRow(i, { amount: e.target.value })}
                  className={cn(input, "tabular-nums")}
                />
                <Input
                  name="row_due"
                  type="date"
                  aria-label={`${f.dueOn} ${i + 1}`}
                  value={r.due}
                  onChange={(e) => editRow(i, { due: e.target.value })}
                  className={input}
                />
              </li>
            ))}
          </ol>
          <p className={cn("flex items-center gap-1.5 text-xs tabular-nums", balanced ? "text-positive" : "text-negative font-medium")}>
            {balanced ? <TbCheck aria-hidden="true" className="size-4" /> : <TbAlertTriangle aria-hidden="true" className="size-4" />}
            {balanced ? f.matches(usdExact(totalCents!)) : f.sum(usdExact(sum), usdExact(totalCents || 0))}
          </p>
        </fieldset>
      ) : null}
      {err.schedule ? <p className="text-negative text-xs">{err.schedule}</p> : null}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending || !rows.length} className="h-10 flex-1 sm:flex-none">
          {pending ? <TbLoader2 aria-hidden="true" className="animate-spin" /> : null}
          {pending ? f.saving : f.save}
        </Button>
        <Button type="button" variant="ghost" className="h-10" onClick={() => setOpen(false)}>
          {t.cancel}
        </Button>
      </div>
    </form>
  );
}
