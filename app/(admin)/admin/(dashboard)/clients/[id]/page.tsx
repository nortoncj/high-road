import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TbArrowLeft, TbArrowUpRight, TbCalendarEvent, TbMail, TbMessage, TbPencil, TbPhone, TbWorld } from "react-icons/tb";
import { clientPage } from "@/content/admin";
import { requireAdmin } from "@/lib/admin/auth";
import { addProject, createStripeCustomer, linkStripe, syncClientStripe } from "@/lib/admin/client-actions";
import { getClient } from "@/lib/admin/clients";
import { createPaymentPlan } from "@/lib/admin/payment-plan-actions";
import { today } from "@/lib/admin/projects";
import { taskRefs, todosForClient } from "@/lib/admin/tasks";
import { initials, shortDate, toDate } from "@/lib/admin/format";
import { leadSourceLabel } from "@/lib/admin/schema";
import { stripeConfigured, stripeDashboardUrl } from "@/lib/admin/stripe-sync";
import { Avatar, AvatarFallback } from "@/components/admin/ui/avatar";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { BillingCard } from "@/components/admin/clients/BillingCard";
import { ClientStatusBadge, HealthNote } from "@/components/admin/clients/ClientBits";
import { PaymentPlansCard } from "@/components/admin/clients/PaymentPlansCard";
import { PaymentsCard } from "@/components/admin/clients/PaymentsCard";
import { ProjectsCard } from "@/components/admin/clients/ProjectsCard";
import { ClientTasksCard } from "@/components/admin/tasks/ClientTasksCard";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const detail = await getClient((await params).id);
  return { title: detail?.client.name ?? "Client" };
}

export default async function ClientDetailPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const [detail, todos, refs] = await Promise.all([getClient(id), todosForClient(id), taskRefs()]);
  if (!detail) notFound();
  const { client: c, origin } = detail;
  const now = new Date();
  const cp = clientPage;
  const site = c.website ? (/^https?:\/\//.test(c.website) ? c.website : `https://${c.website}`) : null;

  return (
    <>
      <Link href="/admin/clients" className="text-muted-foreground hover:text-foreground -mb-2 inline-flex w-fit items-center gap-1 text-sm">
        <TbArrowLeft aria-hidden="true" className="size-4" />
        Clients
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="size-12 rounded-xl">
            <AvatarFallback className="bg-sea-foam text-primary font-display rounded-xl text-base font-semibold">
              {initials(c.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h1 className="font-display truncate text-2xl font-semibold tracking-tight sm:text-3xl">{c.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <ClientStatusBadge status={c.status} />
              <HealthNote health={c.health} />
              {c.onboardedOn ? (
                <span className="text-muted-foreground text-xs">Client since {shortDate(toDate(c.onboardedOn), now)}</span>
              ) : null}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:flex">
          {c.email ? (
            <Button asChild variant="outline">
              <a href={`mailto:${c.email}`}>
                <TbMail aria-hidden="true" />
                {cp.email}
              </a>
            </Button>
          ) : null}
          {c.phone ? (
            <Button asChild variant="outline">
              <a href={`tel:${c.phone.replace(/[^\d+]/g, "")}`}>
                <TbPhone aria-hidden="true" />
                {cp.call}
              </a>
            </Button>
          ) : null}
          <Button asChild>
            <Link href={`/admin/clients/${c.id}/edit`}>
              <TbPencil aria-hidden="true" />
              {cp.edit}
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-4 sm:gap-6 lg:col-span-2">
          <BillingCard
            client={c}
            stripeReady={stripeConfigured()}
            stripeUrl={c.stripeCustomerId ? stripeDashboardUrl(`customers/${c.stripeCustomerId}`) : null}
            linkAction={linkStripe.bind(null, c.id)}
            createAction={createStripeCustomer.bind(null, c.id)}
            syncAction={syncClientStripe.bind(null, c.id)}
          />
          <PaymentPlansCard
            plans={detail.paymentPlans}
            projects={detail.projects.ok ? detail.projects.data.filter((p) => p.status !== "cancelled").map((p) => ({ id: p.id, name: p.name })) : []}
            canInvoice={stripeConfigured() && Boolean(c.stripeCustomerId)}
            stripeReady={stripeConfigured()}
            today={today()}
            createAction={createPaymentPlan.bind(null, c.id)}
          />
          <ProjectsCard projects={detail.projects} addAction={addProject.bind(null, c.id)} />
        </div>

        <div className="flex min-w-0 flex-col gap-4 sm:gap-6">
          <ClientTasksCard client={{ id: c.id, name: c.name }} todos={todos} refs={refs} today={today()} />

          <Card className="gap-4">
            <CardHeader>
              <CardTitle className="font-display text-lg">{cp.contact}</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-3 gap-y-2 text-sm">
                <dt className="text-muted-foreground">Name</dt>
                <dd className="truncate">{c.contactName ?? "—"}</dd>
                <dt className="text-muted-foreground">Email</dt>
                <dd className="truncate">{c.email ?? "—"}</dd>
                <dt className="text-muted-foreground">Phone</dt>
                <dd className="truncate">{c.phone ?? "—"}</dd>
                <dt className="text-muted-foreground">Website</dt>
                <dd className="truncate">
                  {site ? (
                    <a href={site} target="_blank" rel="noopener noreferrer" className="text-primary inline-flex items-center gap-1 hover:underline">
                      <TbWorld aria-hidden="true" className="size-3.5" />
                      {c.website!.replace(/^https?:\/\//, "")}
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>
              </dl>
            </CardContent>
          </Card>

          <Card className="gap-4">
            <CardHeader>
              <CardTitle className="font-display text-lg">{cp.origin.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {origin ? (
                <Link
                  href={`/admin/leads?lead=${encodeURIComponent(origin.id)}`}
                  className="hover:bg-accent focus-visible:ring-ring -m-2 flex items-start gap-3 rounded-lg p-2 transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  <span className="bg-brass-soft text-brass-ink grid size-8 shrink-0 place-items-center rounded-full">
                    {origin.source === "calendly" ? (
                      <TbCalendarEvent aria-hidden="true" className="size-4" />
                    ) : (
                      <TbMessage aria-hidden="true" className="size-4" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{cp.origin.lead(origin.name)}</span>
                    <span className="text-muted-foreground block text-xs">
                      {[leadSourceLabel[origin.source], origin.service, shortDate(toDate(origin.createdAt), now)].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                  <TbArrowUpRight aria-hidden="true" className="text-muted-foreground size-4 shrink-0" />
                  <span className="sr-only">{cp.origin.view}</span>
                </Link>
              ) : (
                <p className="text-muted-foreground text-sm">{cp.origin.manual}</p>
              )}
            </CardContent>
          </Card>

          <PaymentsCard payments={detail.payments} />

          <Card className="gap-4">
            <CardHeader>
              <CardTitle className="font-display text-lg">{cp.notes.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {c.notes ? (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{c.notes}</p>
              ) : (
                <p className="text-muted-foreground text-sm">{cp.notes.empty}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
