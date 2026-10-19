import type { ReactNode } from "react";
import { TbDatabaseOff, TbInbox } from "react-icons/tb";
import type { Issue } from "@/lib/admin/data";

/** Nothing to show, and that's fine. */
export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="text-muted-foreground flex flex-col items-center gap-2 px-4 py-10 text-center text-sm">
      <TbInbox aria-hidden="true" className="size-8 opacity-60" />
      <p className="max-w-xs">{children}</p>
    </div>
  );
}

/** A table is missing or a query broke. Says which and what to do, instead of a blank card. */
export function IssueNote({ issue }: { issue: Issue }) {
  return (
    <div className="mx-4 flex items-start gap-3 rounded-lg border border-dashed p-4 text-sm sm:mx-6">
      <TbDatabaseOff aria-hidden="true" className="text-muted-foreground mt-0.5 size-5 shrink-0" />
      <div className="min-w-0">
        <p className="font-medium">{issue.missing ? `No ${issue.table} table yet` : `Couldn't load ${issue.table}`}</p>
        <p className="text-muted-foreground mt-0.5 text-xs break-words">
          {issue.missing
            ? "Run the migration in supabase/migrations to create it."
            : `${issue.message}. If a column name is off, fix it in lib/admin/schema.ts.`}
        </p>
      </div>
    </div>
  );
}
