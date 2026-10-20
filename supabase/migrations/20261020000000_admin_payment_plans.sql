-- WebTech Ninjas admin: Payment plans (one-off work paid in installments)
-- Run after the dashboard, clients and projects migrations. Safe to run more than once.
--
-- For fixed-price work like a $2,000 website split into payments. Not a Stripe subscription:
-- each installment is either marked paid by hand (Zelle, cash, check) or sent as a one-off
-- Stripe invoice that the webhook marks paid. Every paid installment also lands in invoices,
-- so the Payments card and the Revenue KPI count it.

------------------------------------------------------------------------------------------------
-- 1. Plans
------------------------------------------------------------------------------------------------

create table if not exists public.payment_plans (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references public.clients (id) on delete cascade,
  project_id   uuid references public.projects (id) on delete set null,
  title        text not null,
  total_cents  integer not null check (total_cents > 0),
  status       text not null default 'active' check (status in ('active', 'cancelled')),
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists payment_plans_client_idx on public.payment_plans (client_id);

drop trigger if exists payment_plans_touch on public.payment_plans;
create trigger payment_plans_touch before update on public.payment_plans
  for each row execute function public.touch_updated_at();

------------------------------------------------------------------------------------------------
-- 2. Installments
------------------------------------------------------------------------------------------------

create table if not exists public.plan_installments (
  id                 uuid primary key default gen_random_uuid(),
  plan_id            uuid not null references public.payment_plans (id) on delete cascade,
  position           integer not null default 0,
  label              text not null,                       -- "Deposit", "Payment 2", "Final payment"
  amount_cents       integer not null check (amount_cents > 0),
  due_on             date,
  -- pending: not billed yet. invoiced: a Stripe invoice is out. paid. void: plan was cancelled.
  status             text not null default 'pending' check (status in ('pending', 'invoiced', 'paid', 'void')),
  paid_at            timestamptz,
  method             text check (method in ('stripe', 'zelle', 'cash', 'check', 'venmo', 'other')),
  stripe_invoice_id  text,
  invoice_url        text,                                -- Stripe's hosted pay page
  invoice_id         uuid references public.invoices (id) on delete set null,  -- the row a manual payment wrote
  created_at         timestamptz not null default now()
);

create index if not exists plan_installments_plan_idx on public.plan_installments (plan_id, position);
create unique index if not exists plan_installments_stripe_invoice_key on public.plan_installments (stripe_invoice_id) where stripe_invoice_id is not null;
create index if not exists plan_installments_open_due_idx on public.plan_installments (due_on) where status in ('pending', 'invoiced');

------------------------------------------------------------------------------------------------
-- 3. RLS: admins only. The webhook uses the service role key, which skips RLS.
------------------------------------------------------------------------------------------------

alter table public.payment_plans     enable row level security;
alter table public.plan_installments enable row level security;

do $$
declare t text;
begin
  foreach t in array array['payment_plans', 'plan_installments'] loop
    execute format('drop policy if exists "admins manage %1$s" on public.%1$I', t);
    execute format(
      'create policy "admins manage %1$s" on public.%1$I for all to authenticated
         using ((select public.is_admin())) with check ((select public.is_admin()))', t);
  end loop;
end $$;
