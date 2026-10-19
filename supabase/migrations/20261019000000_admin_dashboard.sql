-- WebTech Ninjas admin dashboard
-- Safe to run more than once. Run it in the Supabase SQL editor or with `supabase db push`.
--
-- READ THIS FIRST: step 3 turns on row level security for leads. If your Calendly webhook or
-- /api/contact inserts leads with the anon/publishable key, those inserts will start failing.
-- They must use the service role key (server side only), which bypasses RLS. Check before running.

------------------------------------------------------------------------------------------------
-- 1. Who counts as an admin
------------------------------------------------------------------------------------------------

create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  full_name  text,
  role       text not null default 'admin',
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

drop policy if exists "admins read own row" on public.admin_users;
create policy "admins read own row" on public.admin_users
  for select to authenticated
  using (user_id = (select auth.uid()));

-- Used by every policy below. security definer so it can read admin_users without recursion.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admin_users where user_id = (select auth.uid()));
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

------------------------------------------------------------------------------------------------
-- 2. Leads: make sure the columns the dashboard reads exist (existing data is untouched)
------------------------------------------------------------------------------------------------

alter table public.leads add column if not exists status  text not null default 'new';
alter table public.leads add column if not exists service text;
alter table public.leads add column if not exists source  text;
alter table public.leads add column if not exists phone   text;
alter table public.leads add column if not exists website text;
alter table public.leads add column if not exists message text;

-- leads.sql made status the public.lead_status enum (new, contacted, booked, won, lost).
-- The dashboard also uses qualified and in_progress, so add them. 'booked' stays valid;
-- the dashboard shows any booked rows as New.
alter type public.lead_status add value if not exists 'qualified' after 'contacted';
alter type public.lead_status add value if not exists 'in_progress' after 'qualified';

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status);

------------------------------------------------------------------------------------------------
-- 3. Leads: only admins can read or update them
------------------------------------------------------------------------------------------------

alter table public.leads enable row level security;

drop policy if exists "admins read leads" on public.leads;
create policy "admins read leads" on public.leads
  for select to authenticated
  using ((select public.is_admin()));

drop policy if exists "admins update leads" on public.leads;
create policy "admins update leads" on public.leads
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

------------------------------------------------------------------------------------------------
-- 4. Status history, written by a trigger so it also catches changes made outside the dashboard
------------------------------------------------------------------------------------------------

-- lead_id is text so this works whether leads.id is a uuid or a bigint.
create table if not exists public.lead_events (
  id          bigint generated always as identity primary key,
  lead_id     text not null,
  from_status text,
  to_status   text not null,
  actor       uuid default auth.uid(),
  created_at  timestamptz not null default now()
);

create index if not exists lead_events_created_at_idx on public.lead_events (created_at desc);
create index if not exists lead_events_lead_id_idx on public.lead_events (lead_id);

alter table public.lead_events enable row level security;

drop policy if exists "admins read lead events" on public.lead_events;
create policy "admins read lead events" on public.lead_events
  for select to authenticated
  using ((select public.is_admin()));

create or replace function public.log_lead_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    insert into public.lead_events (lead_id, from_status, to_status)
    values (new.id::text, old.status, new.status);
  end if;
  return new;
end;
$$;

drop trigger if exists leads_status_log on public.leads;
create trigger leads_status_log
  after update of status on public.leads
  for each row execute function public.log_lead_status();

-- No foreign key to leads on purpose: lead_id is text so this works whether leads.id is a
-- uuid or a bigint. The dashboard looks names up separately.

------------------------------------------------------------------------------------------------
-- 5. Clients, projects, invoices. Skipped if you already have them (your CRM's clients table, say).
------------------------------------------------------------------------------------------------

create table if not exists public.clients (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text,
  phone      text,
  status     text not null default 'active' check (status in ('active', 'paused', 'churned')),
  care_plan  text,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid references public.clients (id) on delete set null,
  name         text not null,
  service      text,
  status       text not null default 'planning'
                 check (status in ('planning', 'in_progress', 'review', 'done', 'on_hold', 'cancelled')),
  due_date     date,
  completed_at timestamptz,
  created_at   timestamptz not null default now()
);

create table if not exists public.invoices (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid references public.clients (id) on delete set null,
  project_id   uuid references public.projects (id) on delete set null,
  amount_cents integer not null check (amount_cents >= 0),
  status       text not null default 'draft' check (status in ('draft', 'sent', 'paid', 'void')),
  issued_at    date,
  paid_at      timestamptz,
  created_at   timestamptz not null default now()
);

create index if not exists invoices_paid_at_idx on public.invoices (paid_at desc) where status = 'paid';
create index if not exists projects_status_idx on public.projects (status);

alter table public.clients  enable row level security;
alter table public.projects enable row level security;
alter table public.invoices enable row level security;

do $$
declare t text;
begin
  foreach t in array array['clients', 'projects', 'invoices'] loop
    execute format('drop policy if exists "admins manage %1$s" on public.%1$I', t);
    execute format(
      'create policy "admins manage %1$s" on public.%1$I for all to authenticated
         using ((select public.is_admin())) with check ((select public.is_admin()))', t);
  end loop;
end $$;

------------------------------------------------------------------------------------------------
-- 6. 2-year retention (matches the privacy policy: "2 years after our last contact, then deleted").
--    Leads that became clients (won, in_progress) are kept. "Last contact" is the newer of
--    created_at and the last status change. Runs daily at 03:00 UTC via pg_cron.
------------------------------------------------------------------------------------------------

create or replace function public.purge_stale_leads()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare purged integer;
begin
  with stale as (
    select l.id::text as id
    from public.leads l
    where l.status::text not in ('won', 'in_progress')
      and greatest(
            l.created_at,
            coalesce((select max(e.created_at) from public.lead_events e where e.lead_id = l.id::text), l.created_at)
          ) < now() - interval '2 years'
  ),
  gone_events as (
    delete from public.lead_events e using stale s where e.lead_id = s.id
  ),
  gone as (
    delete from public.leads l using stale s where l.id::text = s.id returning 1
  )
  select count(*) into purged from gone;
  return purged;
end;
$$;

revoke all on function public.purge_stale_leads() from public, anon, authenticated;

create extension if not exists pg_cron with schema pg_catalog;

-- Scheduling by name replaces the job if it already exists, so rerunning is safe.
select cron.schedule('purge-stale-leads', '0 3 * * *', $$select public.purge_stale_leads()$$);

------------------------------------------------------------------------------------------------
-- 7. Make yourself an admin. Create the user first: Authentication > Users > Add user
--    (your email, tick "Auto confirm"). Then run this with your email:
------------------------------------------------------------------------------------------------

-- insert into public.admin_users (user_id, full_name, role)
-- select id, 'Chris Norton Jr', 'admin' from auth.users where email = 'chris@webtechninjas.com'
-- on conflict (user_id) do update set full_name = excluded.full_name;
