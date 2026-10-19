-- WebTech Ninjas admin: Clients + Stripe sync
-- Run after 20261019000000_admin_dashboard.sql. Safe to run more than once.
--
-- Stripe is the source of truth for money. These tables are a fast, RLS-protected copy that
-- the Stripe webhook keeps current, so the dashboard never waits on Stripe's API to load.

------------------------------------------------------------------------------------------------
-- 1. Clients: the columns the Clients section needs
------------------------------------------------------------------------------------------------

alter table public.clients add column if not exists contact_name         text;
alter table public.clients add column if not exists website              text;
alter table public.clients add column if not exists notes                text;
-- text so it works whether leads.id is a uuid or a bigint (same as lead_events)
alter table public.clients add column if not exists lead_id              text;
alter table public.clients add column if not exists stripe_customer_id   text;
alter table public.clients add column if not exists onboarded_on         date;
-- For anyone you bill outside Stripe (cash, Zelle, the family discount). care_plan holds the plan name.
alter table public.clients add column if not exists care_plan            text;
alter table public.clients add column if not exists manual_monthly_cents integer check (manual_monthly_cents >= 0);
alter table public.clients add column if not exists manual_renews_on     date;
alter table public.clients add column if not exists updated_at           timestamptz not null default now();

-- One client per lead, one client per Stripe customer.
create unique index if not exists clients_lead_id_key on public.clients (lead_id) where lead_id is not null;
create unique index if not exists clients_stripe_customer_id_key on public.clients (stripe_customer_id) where stripe_customer_id is not null;
create index if not exists clients_email_lower_idx on public.clients (lower(email));

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists clients_touch on public.clients;
create trigger clients_touch before update on public.clients
  for each row execute function public.touch_updated_at();

------------------------------------------------------------------------------------------------
-- 2. Subscriptions copied from Stripe (care plans and 12 month payment plans)
------------------------------------------------------------------------------------------------

create table if not exists public.client_subscriptions (
  id                    text primary key,                 -- Stripe subscription id, sub_...
  client_id             uuid references public.clients (id) on delete set null,
  stripe_customer_id    text not null,
  status                text not null,                    -- active, trialing, past_due, unpaid, canceled, paused, incomplete...
  plan_name             text not null,
  kind                  text not null default 'care' check (kind in ('care', 'build', 'other')),
  amount_cents          integer not null default 0,       -- per billing period, all items
  monthly_cents         integer not null default 0,       -- normalized to a month (yearly / 12, etc.)
  billing_interval      text,                             -- month, year...
  current_period_end    timestamptz,                      -- next charge
  cancel_at_period_end  boolean not null default false,
  ends_at               timestamptz,                      -- scheduled end: cancel_at, or the last phase of a schedule
  started_at            timestamptz,
  canceled_at           timestamptz,
  synced_at             timestamptz not null default now()
);

create index if not exists client_subscriptions_client_idx on public.client_subscriptions (client_id);
create index if not exists client_subscriptions_customer_idx on public.client_subscriptions (stripe_customer_id);

------------------------------------------------------------------------------------------------
-- 3. Invoices: link rows to Stripe so the webhook can upsert paid invoices (feeds the Revenue card)
------------------------------------------------------------------------------------------------

alter table public.invoices add column if not exists stripe_invoice_id  text;
alter table public.invoices add column if not exists number             text;
alter table public.invoices add column if not exists description        text;
alter table public.invoices add column if not exists hosted_invoice_url text;

create unique index if not exists invoices_stripe_invoice_id_key on public.invoices (stripe_invoice_id);
create index if not exists invoices_client_idx on public.invoices (client_id);

------------------------------------------------------------------------------------------------
-- 4. RLS: admins only. The webhook uses the service role key, which skips RLS.
------------------------------------------------------------------------------------------------

alter table public.client_subscriptions enable row level security;

drop policy if exists "admins manage client_subscriptions" on public.client_subscriptions;
create policy "admins manage client_subscriptions" on public.client_subscriptions
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
