import { TbAlertTriangle, TbBellRinging } from "react-icons/tb";
import { settingsPage } from "@/content/admin";
import type { FormState } from "@/lib/admin/client-actions";
import { daysFrom } from "@/lib/admin/format";
import type { AlertStats } from "@/lib/admin/settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { ActionButton } from "@/components/admin/clients/ActionButtons";
import { AlertSwitch } from "./SettingsBits";

export function AlertsCard({
  me,
  on,
  othersOff,
  stats,
  toggleAction,
  testAction,
}: {
  me: { email: string };
  on: boolean;
  othersOff: number;
  stats: AlertStats;
  toggleAction: (on: boolean) => Promise<FormState>;
  testAction: (prev: FormState, fd: FormData) => Promise<FormState>;
}) {
  const a = settingsPage.alerts;
  return (
    <Card className="gap-5">
      <CardHeader>
        <CardTitle className="font-display text-lg">{a.title}</CardTitle>
        <CardDescription>{a.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4 rounded-xl border p-4">
          <div className="min-w-0">
            <p className="text-sm font-medium">{a.toggle}</p>
            <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed break-words">{a.toggleHint(me.email)}</p>
          </div>
          <AlertSwitch on={on} action={toggleAction} />
        </div>

        {stats.webhookReady ? (
          <p className="text-muted-foreground flex items-start gap-2 text-sm">
            <TbBellRinging aria-hidden="true" className="text-sea-glass mt-0.5 size-4 shrink-0" />
            {stats.lastSentAt ? a.last(daysFrom(stats.lastSentAt.slice(0, 10)), stats.last30) : a.none}
          </p>
        ) : (
          <p className="bg-warning-soft text-warning flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm leading-relaxed">
            <TbAlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {a.notReady}
          </p>
        )}
        {othersOff > 0 ? <p className="text-muted-foreground text-xs">{a.othersOff(othersOff)}</p> : null}

        <ActionButton action={testAction} pendingLabel={a.testing} className="w-fit">
          {a.test}
        </ActionButton>
      </CardContent>
    </Card>
  );
}
