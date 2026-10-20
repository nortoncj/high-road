"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { projectsPage } from "@/content/admin";
import { moveProject } from "@/lib/admin/project-actions";
import { projectStatuses, projectStatusMeta, type ProjectStatus } from "@/lib/admin/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/admin/ui/select";

export function ProjectStatusSelect({ id, status }: { id: string; status: ProjectStatus }) {
  const [value, setValue] = useState<ProjectStatus>(status);
  const [pending, startTransition] = useTransition();

  return (
    <Select
      value={value}
      disabled={pending}
      onValueChange={(v) => {
        const prev = value;
        const next = v as ProjectStatus;
        setValue(next);
        startTransition(async () => {
          const res = await moveProject(id, next);
          if (!res.ok) {
            setValue(prev);
            toast.error(projectsPage.moveFailed, { description: res.error });
          } else if (res.warning) toast.warning(res.warning);
          else toast.success(projectsPage.movedTo(projectStatusMeta[next].label));
        });
      }}
    >
      <SelectTrigger aria-label="Status" className="bg-card h-10 w-full sm:w-44">
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
  );
}
