import Link from "next/link";
import { TbArrowRight, TbPlayerPause, TbPlayerPlay } from "react-icons/tb";
import { trackingCard } from "@/content/admin";
import type { Loaded } from "@/lib/admin/data";
import type { FormState } from "@/lib/admin/client-actions";
import { daysFrom } from "@/lib/admin/format";
import type { SiteInfo } from "@/lib/admin/reports";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { ActionButton } from "@/components/admin/clients/ActionButtons";
import { IssueNote } from "../States";
import { SiteStatusLabel } from "./ReportBits";
import { AddSiteForm, CopySnippet } from "./TrackingBits";

type Action = (prev: FormState, fd: FormData) => Promise<FormState>;

/** On the client page: their tracked sites, the snippet to paste, and whether it's working. */
export function TrackingCard({
  clientId,
  sites,
  snippets,
  addAction,
  toggleAction,
}: {
  clientId: string;
  sites: Loaded<SiteInfo[]>;
  /** site id → the <script> tag. Built on the server so the domain comes from env. */
  snippets: Record<string, string>;
  addAction: Action;
  toggleAction: (siteId: string, active: boolean) => Action;
}) {
  const t = trackingCard;
  const now = new Date();
  return (
    <Card id="tracking" className="scroll-mt-24 gap-4">
      <CardHeader>
        <CardTitle className="font-display text-lg">{t.title}</CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {!sites.ok ? (
          <div className="-mx-4 sm:-mx-6">
            <IssueNote issue={sites.issue} />
          </div>
        ) : (
          <>
            {sites.data.map((s) => (
              <div key={s.id} className="flex flex-col gap-2.5 rounded-lg border p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{s.domain}</p>
                    <SiteStatusLabel status={s.status} />
                    {s.lastEventAt && s.status !== "paused" ? (
                      <p className="text-muted-foreground text-xs">{t.lastSeen(daysFrom(s.lastEventAt.slice(0, 10), now))}</p>
                    ) : null}
                  </div>
                  <ActionButton
                    action={toggleAction(s.id, !s.active)}
                    pendingLabel="..."
                    variant="ghost"
                    className="text-muted-foreground -mr-2 shrink-0"
                  >
                    {s.active ? <TbPlayerPause aria-hidden="true" /> : <TbPlayerPlay aria-hidden="true" />}
                    {s.active ? t.pause : t.resume}
                  </ActionButton>
                </div>
                {s.active ? <CopySnippet code={snippets[s.id]} /> : null}
              </div>
            ))}
            {sites.data.some((s) => s.status === "waiting") ? (
              <ul className="text-muted-foreground flex list-disc flex-col gap-1 pl-4 text-xs leading-relaxed">
                {t.install.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            ) : null}
            <AddSiteForm action={addAction} first={sites.data.length === 0} />
            {sites.data.length ? (
              <Link href={`/admin/reports/${clientId}`} className="text-primary inline-flex w-fit items-center gap-1 text-sm font-medium hover:underline">
                {t.viewReport}
                <TbArrowRight aria-hidden="true" className="size-4" />
              </Link>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
