import { Suspense } from "react";
import type { Metadata } from "next";
import { settingsPage } from "@/content/admin";
import { requireAdmin } from "@/lib/admin/auth";
import { getAlertStats, getConnections, getTeam } from "@/lib/admin/settings";
import { inviteAdmin, removeAdmin, resendInvite, revokeInvite, sendTestAlert, setLeadAlerts } from "@/lib/admin/settings-actions";
import { Card, CardContent, CardHeader } from "@/components/admin/ui/card";
import { Skeleton } from "@/components/admin/ui/skeleton";
import { PageHeader } from "@/components/admin/PageHeader";
import { AlertsCard } from "@/components/admin/settings/AlertsCard";
import { ConnectionCard } from "@/components/admin/settings/ConnectionsCard";
import { RecheckButton } from "@/components/admin/settings/SettingsBits";
import { TeamCard } from "@/components/admin/settings/TeamCard";

export const metadata: Metadata = { title: settingsPage.meta.title };

export default async function SettingsPage() {
  const me = await requireAdmin();
  const [team, stats] = await Promise.all([getTeam(), getAlertStats()]);
  const mine = team.ok ? team.data.members.find((m) => m.id === me.id) : undefined;
  const othersOff = team.ok ? team.data.members.filter((m) => m.id !== me.id && !m.leadAlerts).length : 0;
  const c = settingsPage.connections;

  return (
    <>
      <PageHeader title={settingsPage.title} description={settingsPage.description} />

      <div className="grid grid-cols-1 items-start gap-4 sm:gap-6 xl:grid-cols-5">
        <div className="min-w-0 xl:col-span-3">
          <TeamCard
            team={team}
            meId={me.id}
            isOwner={me.role === "owner"}
            inviteAction={inviteAdmin}
            removeAction={(id) => removeAdmin.bind(null, id)}
            resendAction={(id) => resendInvite.bind(null, id)}
            revokeAction={(id) => revokeInvite.bind(null, id)}
          />
        </div>
        <div className="min-w-0 xl:col-span-2">
          <AlertsCard me={{ email: me.email }} on={mine?.leadAlerts ?? true} othersOff={othersOff} stats={stats} toggleAction={setLeadAlerts} testAction={sendTestAlert} />
        </div>
      </div>

      <section aria-labelledby="connections" className="flex flex-col gap-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 id="connections" className="font-display text-xl font-semibold tracking-tight">
              {c.title}
            </h2>
            <p className="text-muted-foreground text-sm">{c.description}</p>
          </div>
          <RecheckButton />
        </div>
        <Suspense fallback={<ConnectionsSkeleton />}>
          <Connections />
        </Suspense>
      </section>
    </>
  );
}

async function Connections() {
  const list = await getConnections();
  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
      {list.map((x) => (
        <ConnectionCard key={x.id} c={x} />
      ))}
    </div>
  );
}

function ConnectionsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Checking connections" className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
      {[0, 1].map((i) => (
        <Card key={i} className="gap-4">
          <CardHeader className="flex flex-row items-center gap-3">
            <Skeleton className="size-9 rounded-lg" />
            <Skeleton className="h-5 w-24" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {[0, 1, 2].map((j) => (
              <Skeleton key={j} className="h-9 w-full" />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
