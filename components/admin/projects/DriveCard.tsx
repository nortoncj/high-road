"use client";

import { useActionState, useState } from "react";
import { TbBrandGoogleDrive, TbExternalLink, TbLoader2 } from "react-icons/tb";
import { projectPage } from "@/content/admin";
import type { FormState } from "@/lib/admin/client-actions";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Input } from "@/components/admin/ui/input";
import { useResultToast } from "@/components/admin/clients/ActionButtons";

/** The client's asset folder: one big button when it's set, a paste box when it isn't. */
export function DriveCard({
  url,
  action,
}: {
  url: string | null;
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
}) {
  const d = projectPage.drive;
  const [editing, setEditing] = useState(!url);
  const [state, run, pending] = useActionState<FormState, FormData>(action, {});
  useResultToast(state);
  const [seen, setSeen] = useState(state);
  if (state !== seen) {
    setSeen(state);
    if (state.ok) setEditing(false);
  }

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="font-display flex items-center gap-2 text-lg">
          <TbBrandGoogleDrive aria-hidden="true" className="text-primary size-5" />
          {d.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {url && !editing ? (
          <>
            <Button asChild size="lg" className="w-full">
              <a href={url} target="_blank" rel="noopener noreferrer">
                <TbExternalLink aria-hidden="true" />
                {d.open}
              </a>
            </Button>
            <div className="flex items-center justify-between gap-2">
              <p className="text-muted-foreground truncate font-mono text-xs">{url.replace(/^https?:\/\//, "")}</p>
              <Button type="button" variant="link" size="sm" className="h-auto px-0" onClick={() => setEditing(true)}>
                {d.change}
              </Button>
            </div>
          </>
        ) : (
          <form action={run} className="flex flex-col gap-2">
            {!url ? <p className="text-muted-foreground text-sm">{d.empty}</p> : null}
            <label htmlFor="drive-url" className="sr-only">
              {d.title}
            </label>
            <Input
              id="drive-url"
              name="drive_url"
              type="url"
              inputMode="url"
              defaultValue={state.values?.drive_url ?? url ?? ""}
              placeholder={d.placeholder}
              className="bg-card h-10 text-base sm:text-sm"
            />
            {state.error ? <p className="text-negative text-xs">{state.error}</p> : null}
            <div className="flex gap-2">
              <Button type="submit" disabled={pending}>
                {pending ? <TbLoader2 aria-hidden="true" className="animate-spin" /> : null}
                {d.save}
              </Button>
              {url ? (
                <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
