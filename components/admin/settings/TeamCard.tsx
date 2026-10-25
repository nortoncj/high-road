import { TbClockHour4, TbCrown } from "react-icons/tb";
import { settingsPage } from "@/content/admin";
import type { Loaded } from "@/lib/admin/data";
import type { FormState } from "@/lib/admin/client-actions";
import { initials, shortDate, toDate } from "@/lib/admin/format";
import type { Team } from "@/lib/admin/settings";
import { cn } from "@/lib/admin/utils";
import { Avatar, AvatarFallback } from "@/components/admin/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { ActionButton } from "@/components/admin/clients/ActionButtons";
import { IssueNote } from "../States";
import { ConfirmButton, InviteForm } from "./SettingsBits";

type Action = (prev: FormState, fd: FormData) => Promise<FormState>;

export function TeamCard({
  team,
  meId,
  isOwner,
  inviteAction,
  removeAction,
  resendAction,
  revokeAction,
}: {
  team: Loaded<Team>;
  meId: string;
  isOwner: boolean;
  inviteAction: Action;
  removeAction: (userId: string) => Action;
  resendAction: (inviteId: string) => Action;
  revokeAction: (inviteId: string) => Action;
}) {
  const t = settingsPage.team;
  const now = new Date();
  return (
    <Card className="gap-5">
      <CardHeader>
        <CardTitle className="font-display text-lg">{t.title}</CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {!team.ok ? (
          <div className="-mx-4 sm:-mx-6">
            <IssueNote issue={team.issue} />
          </div>
        ) : (
          <ul className="divide-y">
            {team.data.members.map((m) => {
              const me = m.id === meId;
              return (
                <li key={m.id} className="flex items-center gap-3 py-3 first:pt-0">
                  <Avatar className="size-9 rounded-lg">
                    <AvatarFallback className={cn("rounded-lg text-xs font-semibold", m.role === "owner" ? "bg-brass-soft text-brass-ink" : "bg-sea-foam text-primary")}>
                      {initials(m.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 text-sm font-medium">
                      <span className="truncate">{m.name}</span>
                      {me ? <span className="bg-secondary text-secondary-foreground rounded px-1.5 text-[11px] font-medium">{t.you}</span> : null}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">{m.email ?? "No email on file"}</p>
                  </div>
                  <span className={cn("inline-flex shrink-0 items-center gap-1 text-xs font-medium", m.role === "owner" ? "text-brass-ink" : "text-muted-foreground")}>
                    {m.role === "owner" ? <TbCrown aria-hidden="true" className="size-3.5" /> : null}
                    {m.role === "owner" ? t.owner : t.admin}
                  </span>
                  {isOwner && !me && m.role !== "owner" ? (
                    <ConfirmButton action={removeAction(m.id)} label={t.remove} confirmLabel="Sure?" pendingLabel={t.removing} title={t.confirmRemove(m.name)} />
                  ) : null}
                </li>
              );
            })}
            {team.data.invites.map((i) => (
              <li key={i.id} className="flex items-center gap-3 py-3">
                <span className="border-border text-muted-foreground grid size-9 shrink-0 place-items-center rounded-lg border border-dashed">
                  <TbClockHour4 aria-hidden="true" className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{i.name ?? i.email}</p>
                  <p className={cn("truncate text-xs", i.expired ? "text-negative" : "text-muted-foreground")}>
                    {i.name ? `${i.email} · ` : ""}
                    {i.expired ? t.expired : t.expires(shortDate(toDate(i.expiresAt), now))}
                  </p>
                </div>
                <span className="text-muted-foreground hidden shrink-0 text-xs font-medium sm:inline">{t.pending}</span>
                {isOwner ? (
                  <div className="flex shrink-0 items-center">
                    <ActionButton action={resendAction(i.id)} pendingLabel="..." variant="ghost" className="text-primary">
                      {t.resend}
                    </ActionButton>
                    <ActionButton action={revokeAction(i.id)} pendingLabel="..." variant="ghost" className="text-muted-foreground">
                      {t.revoke}
                    </ActionButton>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}

        {isOwner ? (
          <div className="bg-secondary/50 flex flex-col gap-3 rounded-xl p-4">
            <p className="font-display text-base font-semibold">{settingsPage.invite.title}</p>
            <InviteForm action={inviteAction} />
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">{t.ownerOnly}</p>
        )}
      </CardContent>
    </Card>
  );
}
