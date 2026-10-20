"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { TbLoader2, TbTrash } from "react-icons/tb";
import { tasksPage } from "@/content/admin";
import type { FormState } from "@/lib/admin/client-actions";
import { deleteTodo, updateTask } from "@/lib/admin/task-actions";
import type { Ref } from "@/lib/admin/task-parse";
import type { Todo } from "@/lib/admin/task-view";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/admin/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/admin/ui/sheet";
import { Textarea } from "@/components/admin/ui/textarea";
import { useResultToast } from "@/components/admin/clients/ActionButtons";

/** Edit a standalone task. Bottom sheet on a phone, side panel on desktop. */
export function TaskSheet({ task, refs, onClose }: { task: Todo | null; refs: Ref[]; onClose: () => void }) {
  const isMobile = useIsMobile();
  const [state, action, pending] = useActionState<FormState, FormData>(updateTask, {});
  const [deleting, startDelete] = useTransition();
  // Hold on to the last task so the sheet keeps its content while it animates closed.
  const [last, setLast] = useState(task);
  if (task && task !== last) setLast(task);
  const t = task ?? last;
  useResultToast(state);

  useEffect(() => {
    if (state.ok) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (!t) return null;
  const e = tasksPage.edit;
  const clients = refs.filter((r) => r.kind === "client");
  const projects = refs.filter((r) => r.kind === "project");

  return (
    <Sheet open={Boolean(task)} onOpenChange={(o: boolean) => !o && onClose()}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className="max-h-[90svh] gap-0 overflow-y-auto rounded-t-2xl pb-[env(safe-area-inset-bottom)] sm:max-h-none sm:max-w-md sm:rounded-none"
      >
        <SheetHeader className="border-b">
          <SheetTitle className="font-display text-lg">{e.title}</SheetTitle>
          <SheetDescription className="sr-only">{t.title}</SheetDescription>
        </SheetHeader>
        <form key={t.key} action={action} className="flex flex-col gap-4 p-4">
          <input type="hidden" name="id" value={t.id} />
          <div className="flex flex-col gap-2">
            <Label htmlFor="ts-title">{e.titleLabel}</Label>
            <Input id="ts-title" name="title" defaultValue={t.title} required className="h-10 text-base sm:text-sm" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="ts-due">{e.due}</Label>
            <Input id="ts-due" name="due_date" type="date" defaultValue={t.dueDate ?? ""} className="h-10 text-base sm:text-sm" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="ts-client">{e.client}</Label>
              <Select name="client_id" defaultValue={t.client?.id ?? "none"}>
                <SelectTrigger id="ts-client" className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{e.none}</SelectItem>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ts-project">{e.project}</Label>
              <Select name="project_id" defaultValue={t.project?.id ?? "none"}>
                <SelectTrigger id="ts-project" className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{e.none}</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="ts-notes">{e.notes}</Label>
            <Textarea id="ts-notes" name="notes" rows={4} defaultValue={t.notes ?? ""} placeholder={e.notesPlaceholder} className="text-base sm:text-sm" />
          </div>
          {state.error ? <p className="text-negative text-sm">{state.error}</p> : null}
          <div className="flex items-center justify-between gap-2 pt-2">
            <Button type="submit" disabled={pending}>
              {pending ? <TbLoader2 aria-hidden="true" className="animate-spin" /> : null}
              {pending ? e.saving : e.save}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="text-negative hover:bg-negative-soft hover:text-negative"
              disabled={deleting}
              onClick={() =>
                startDelete(async () => {
                  const res = await deleteTodo(t.id);
                  if (res.ok) {
                    toast.success(e.deleted);
                    onClose();
                  } else toast.error(res.error);
                })
              }
            >
              <TbTrash aria-hidden="true" />
              {e.delete}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
