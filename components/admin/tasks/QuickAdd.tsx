"use client";

import { useActionState, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import { TbCalendar, TbFolders, TbLoader2, TbPlus, TbUsers, TbX } from "react-icons/tb";
import { tasksPage } from "@/content/admin";
import type { FormState } from "@/lib/admin/client-actions";
import { quickAdd } from "@/lib/admin/task-actions";
import { parseQuickAdd, type Ref } from "@/lib/admin/task-parse";
import { cn } from "@/lib/admin/utils";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { useResultToast } from "@/components/admin/clients/ActionButtons";

const chipDate = (key: string) =>
  new Date(`${key}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });

/**
 * One line, type and hit enter. Chips under the box show what got picked up ("Fri, Oct 23",
 * "Ruiz Heating & Air"); tap a chip's × to keep those words in the title instead.
 *
 * `dock`: on a phone the box sits at the bottom of the screen, in thumb reach, above the
 * home bar. On bigger screens it's inline at the top of the list.
 * Press N anywhere on the page to jump into it.
 */
export function QuickAdd({
  refs,
  today,
  lockedClient,
  autoFocus,
  initialText = "",
  dock = false,
}: {
  refs: Ref[];
  today: string;
  lockedClient?: { id: string; name: string };
  autoFocus?: boolean;
  /** Prefill, e.g. from an iPhone Shortcut that dictates into /admin/tasks?add=... */
  initialText?: string;
  dock?: boolean;
}) {
  const [text, setText] = useState(initialText);
  const [skipDate, setSkipDate] = useState(false);
  const [skipRef, setSkipRef] = useState(false);
  const [state, action, pending] = useActionState<FormState, FormData>(quickAdd, {});
  const input = useRef<HTMLInputElement>(null);
  useResultToast(state);

  const parsed = useMemo(
    () => parseQuickAdd(text, today, lockedClient ? [] : refs, { date: !skipDate, ref: !skipRef && !lockedClient }),
    [text, today, refs, lockedClient, skipDate, skipRef],
  );

  // After a successful add: clear the box, keep the keyboard up for the next one.
  const [seen, setSeen] = useState(state);
  if (state !== seen) {
    setSeen(state);
    if (state.ok) {
      setText("");
      setSkipDate(false);
      setSkipRef(false);
    }
  }
  useEffect(() => {
    if (state.ok) input.current?.focus();
  }, [state]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(input|textarea|select)$/i.test(el.tagName))) return;
      if (e.key.toLowerCase() === "n" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const clientId = lockedClient?.id ?? (parsed.ref?.kind === "client" ? parsed.ref.id : parsed.ref?.clientId ?? null);
  const projectId = parsed.ref?.kind === "project" ? parsed.ref.id : null;
  const q = tasksPage.quickAdd;

  return (
    <form
      action={action}
      className={cn(
        "flex flex-col gap-2",
        dock &&
          "bg-background/90 fixed inset-x-0 bottom-0 z-30 border-t p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-12px_rgb(0_0_0/0.25)] backdrop-blur-md sm:static sm:z-auto sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-none",
      )}
    >
      <input type="hidden" name="title" value={parsed.title} />
      <input type="hidden" name="due_date" value={parsed.dueDate ?? ""} />
      <input type="hidden" name="client_id" value={clientId ?? ""} />
      <input type="hidden" name="project_id" value={projectId ?? ""} />

      <div className="flex gap-2">
        <div className="relative flex-1">
          <TbPlus aria-hidden="true" className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            ref={input}
            value={text}
            onChange={(e: { target: { value: string } }) => setText(e.target.value)}
            onKeyDown={(e: ReactKeyboardEvent) => e.key === "Escape" && input.current?.blur()}
            autoFocus={autoFocus}
            enterKeyHint="done"
            autoComplete="off"
            aria-label={q.label}
            placeholder={lockedClient ? q.label : q.placeholder}
            className="bg-card h-11 pr-12 pl-9 text-base sm:text-sm"
          />
          <kbd className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 rounded border px-1.5 font-mono text-[10px] sm:block">
            {q.shortcut}
          </kbd>
        </div>
        <Button type="submit" className="h-11 px-4" disabled={pending || !text.trim()}>
          {pending ? <TbLoader2 aria-hidden="true" className="animate-spin" /> : null}
          {q.add}
        </Button>
      </div>

      {parsed.dueDate || parsed.ref || skipDate || skipRef ? (
        <div className="flex flex-wrap items-center gap-1.5" aria-live="polite">
          {parsed.dueDate ? (
            <Chip icon={<TbCalendar aria-hidden="true" className="size-3.5" />} label={chipDate(parsed.dueDate)} onRemove={() => setSkipDate(true)} removeLabel={`Keep "${parsed.dueText}" as text`} />
          ) : null}
          {parsed.ref ? (
            <Chip
              icon={parsed.ref.kind === "client" ? <TbUsers aria-hidden="true" className="size-3.5" /> : <TbFolders aria-hidden="true" className="size-3.5" />}
              label={parsed.ref.name}
              onRemove={() => setSkipRef(true)}
              removeLabel={`Don't link ${parsed.ref.name}`}
            />
          ) : null}
        </div>
      ) : null}

      {!lockedClient ? <p className="text-muted-foreground hidden text-xs sm:block">{q.hint}</p> : null}
      {state.error ? <p className="text-negative text-xs">{state.error}</p> : null}
    </form>
  );
}

function Chip({ icon, label, onRemove, removeLabel }: { icon: ReactNode; label: string; onRemove: () => void; removeLabel: string }) {
  return (
    <span className="bg-sea-foam text-primary inline-flex items-center gap-1 rounded-full py-0.5 pr-0.5 pl-2 text-xs font-medium">
      {icon}
      {label}
      <button type="button" onClick={onRemove} aria-label={removeLabel} className="hover:bg-primary/10 grid size-5 place-items-center rounded-full">
        <TbX aria-hidden="true" className="size-3" />
      </button>
    </span>
  );
}
