-- Run this once in Supabase: SQL Editor > New query > paste > Run.

create type public.lead_status as enum ('new', 'contacted', 'booked', 'won', 'lost');

create table public.leads (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  name           text not null check (char_length(name) between 1 and 120),
  contact_method text not null check (contact_method in ('email', 'phone')),
  email          text check (char_length(email) <= 254),
  phone          text check (char_length(phone) <= 40),
  website        text check (char_length(website) <= 300),
  message        text not null check (char_length(message) between 1 and 4000),
  source         text not null default 'contact' check (source in ('contact', 'book', 'home')),
  status         public.lead_status not null default 'new',
  email_sent     boolean not null default false,
  constraint leads_has_contact check (email is not null or phone is not null)
);

create index leads_created_at_idx on public.leads (created_at desc);
create index leads_status_idx on public.leads (status);

-- Lock it down. With RLS on and NO policies, the public (anon) and logged-in roles
-- can't read or write anything. Only your server, using the service role key, can.
alter table public.leads enable row level security;

-- ---------------------------------------------------------------------------
-- Keep-alive helper. The GitHub Action calls this every few days so the free
-- project never pauses. It returns a number and touches no lead data.
-- ---------------------------------------------------------------------------
create or replace function public.keep_alive()
returns int
language sql
security definer
set search_path = public
as $$ select 1 $$;

revoke all on function public.keep_alive() from public;
grant execute on function public.keep_alive() to anon;

-- ---------------------------------------------------------------------------
-- 2-year cleanup (matches your privacy policy). Run by hand every few months,
-- or schedule it with Supabase's pg_cron (Database > Cron).
-- ---------------------------------------------------------------------------
-- delete from public.leads
-- where status in ('new', 'contacted', 'lost')
--   and created_at < now() - interval '2 years';
