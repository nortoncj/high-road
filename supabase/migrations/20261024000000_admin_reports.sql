-- WebTech Ninjas admin: Reports
-- Run after the dashboard and clients migrations. Safe to run more than once.
--
-- How it works:
--   1. Each client site gets a row in client_sites with a public site_key.
--   2. A small script on their site (/wtn.js) posts page views, phone taps and form submits
--      to /api/e on your site, which calls track_event() below with the publishable key.
--   3. track_event is the ONLY way in for the public: it checks the key and the domain,
--      then inserts. Nobody outside admin_users can read anything back.
--   4. The report_* functions do the counting in Postgres, so a page load is 4 small queries,
--      not thousands of rows shipped to Node.
--
-- Nothing personal is stored: no cookies, no IPs. "visitor" is a hash that changes every day.

create extension if not exists pgcrypto;

------------------------------------------------------------------------------------------------
-- 1. Sites
------------------------------------------------------------------------------------------------

create table if not exists public.client_sites (
  id             uuid primary key default gen_random_uuid(),
  client_id      uuid not null references public.clients (id) on delete cascade,
  -- Bare host, lowercase, no www: "acmehvac.com". Subdomains of it count too.
  domain         text not null check (domain ~ '^[a-z0-9.-]+\.[a-z]{2,}$'),
  site_key       text not null unique default encode(gen_random_bytes(9), 'hex'),
  active         boolean not null default true,
  last_event_at  timestamptz,
  created_at     timestamptz not null default now(),
  unique (client_id, domain)
);

create index if not exists client_sites_client_idx on public.client_sites (client_id);

alter table public.client_sites enable row level security;
drop policy if exists "admins manage client sites" on public.client_sites;
create policy "admins manage client sites" on public.client_sites
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

------------------------------------------------------------------------------------------------
-- 2. Events
------------------------------------------------------------------------------------------------

create table if not exists public.site_events (
  id          bigint generated always as identity primary key,
  site_id     uuid not null references public.client_sites (id) on delete cascade,
  kind        text not null check (kind in ('view', 'call', 'form')),
  path        text not null default '/' check (char_length(path) <= 300),
  -- Only on the first view of a visit: google, gbp, facebook, direct... null for clicks inside the site.
  source      text check (char_length(source) <= 60),
  -- Daily rotating hash of IP + browser. Can't be reversed or followed across days.
  visitor     text check (char_length(visitor) <= 32),
  -- Small extras: the number tapped, the form's id. Capped so nobody can stuff it.
  meta        jsonb check (pg_column_size(meta) <= 512),
  created_at  timestamptz not null default now()
);

create index if not exists site_events_site_time_idx on public.site_events (site_id, created_at);

alter table public.site_events enable row level security;
-- Read only for admins. No insert policy on purpose: inserts go through track_event().
drop policy if exists "admins read site events" on public.site_events;
create policy "admins read site events" on public.site_events
  for select to authenticated
  using ((select public.is_admin()));
drop policy if exists "admins delete site events" on public.site_events;
create policy "admins delete site events" on public.site_events
  for delete to authenticated
  using ((select public.is_admin()));

------------------------------------------------------------------------------------------------
-- 3. The public door
------------------------------------------------------------------------------------------------

create or replace function public.track_event(
  p_key     text,
  p_host    text,
  p_kind    text,
  p_path    text,
  p_source  text default null,
  p_visitor text default null,
  p_meta    jsonb default null
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  s public.client_sites%rowtype;
  h text := regexp_replace(lower(coalesce(p_host, '')), '^www\.', '');
begin
  if p_kind not in ('view', 'call', 'form') then return false; end if;

  select * into s from public.client_sites where site_key = p_key and active;
  if not found then return false; end if;

  -- Only hits from the client's own domain or its subdomains. Stops a copied snippet
  -- on some other site from padding their numbers.
  if h <> s.domain and right(h, char_length(s.domain) + 1) <> '.' || s.domain then
    return false;
  end if;

  insert into public.site_events (site_id, kind, path, source, visitor, meta)
  values (
    s.id,
    p_kind,
    left(coalesce(nullif(p_path, ''), '/'), 300),
    left(p_source, 60),
    left(p_visitor, 32),
    case when p_meta is null or pg_column_size(p_meta) > 512 then null else p_meta end
  );

  -- Powers the "Live" dot on the client page. Written at most once a minute per site.
  update public.client_sites set last_event_at = now()
  where id = s.id and (last_event_at is null or last_event_at < now() - interval '1 minute');

  return true;
end;
$$;

revoke all on function public.track_event(text, text, text, text, text, text, jsonb) from public;
grant execute on function public.track_event(text, text, text, text, text, text, jsonb) to anon, authenticated;

------------------------------------------------------------------------------------------------
-- 4. Counting. security invoker: these run as the signed-in admin, so RLS still applies.
--    Months and days are counted in Orlando time, same as the rest of the admin.
------------------------------------------------------------------------------------------------

-- One row per month in the range: views, visits (each visitor once per day), calls, forms.
create or replace function public.report_months(p_client uuid, p_from timestamptz, p_to timestamptz)
returns table (month date, views bigint, visits bigint, calls bigint, forms bigint)
language sql stable security invoker set search_path = public
as $$
  select
    date_trunc('month', e.created_at at time zone 'America/New_York')::date,
    count(*) filter (where e.kind = 'view'),
    count(distinct (e.visitor, (e.created_at at time zone 'America/New_York')::date)) filter (where e.kind = 'view' and e.visitor is not null),
    count(*) filter (where e.kind = 'call'),
    count(*) filter (where e.kind = 'form')
  from public.site_events e
  join public.client_sites s on s.id = e.site_id
  where s.client_id = p_client and e.created_at >= p_from and e.created_at < p_to
  group by 1
  order by 1;
$$;

-- Top pages, with the calls and form fills that happened on each one.
create or replace function public.report_pages(p_client uuid, p_from timestamptz, p_to timestamptz, p_limit int default 10)
returns table (path text, views bigint, calls bigint, forms bigint)
language sql stable security invoker set search_path = public
as $$
  select
    e.path,
    count(*) filter (where e.kind = 'view'),
    count(*) filter (where e.kind = 'call'),
    count(*) filter (where e.kind = 'form')
  from public.site_events e
  join public.client_sites s on s.id = e.site_id
  where s.client_id = p_client and e.created_at >= p_from and e.created_at < p_to
  group by e.path
  order by 2 desc, 3 + 4 desc, e.path
  limit least(greatest(p_limit, 1), 50);
$$;

-- Where visits started. Each external arrival counts once.
create or replace function public.report_sources(p_client uuid, p_from timestamptz, p_to timestamptz)
returns table (source text, visits bigint)
language sql stable security invoker set search_path = public
as $$
  select e.source, count(*)
  from public.site_events e
  join public.client_sites s on s.id = e.site_id
  where s.client_id = p_client and e.created_at >= p_from and e.created_at < p_to
    and e.kind = 'view' and e.source is not null
  group by e.source
  order by 2 desc, 1
  limit 12;
$$;

-- Every tracked client's totals for one range. Feeds the Reports list.
create or replace function public.report_totals(p_from timestamptz, p_to timestamptz)
returns table (client_id uuid, views bigint, visits bigint, calls bigint, forms bigint)
language sql stable security invoker set search_path = public
as $$
  select
    s.client_id,
    count(*) filter (where e.kind = 'view'),
    count(distinct (e.visitor, (e.created_at at time zone 'America/New_York')::date)) filter (where e.kind = 'view' and e.visitor is not null),
    count(*) filter (where e.kind = 'call'),
    count(*) filter (where e.kind = 'form')
  from public.site_events e
  join public.client_sites s on s.id = e.site_id
  where e.created_at >= p_from and e.created_at < p_to
  group by s.client_id;
$$;

------------------------------------------------------------------------------------------------
-- 5. Send log: which month went to whom, so nothing gets sent twice or forgotten.
------------------------------------------------------------------------------------------------

create table if not exists public.report_sends (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.clients (id) on delete cascade,
  month       date not null check (extract(day from month) = 1),
  to_email    text not null,
  message_id  text,
  sent_at     timestamptz not null default now()
);

create index if not exists report_sends_client_month_idx on public.report_sends (client_id, month);

alter table public.report_sends enable row level security;
drop policy if exists "admins manage report sends" on public.report_sends;
create policy "admins manage report sends" on public.report_sends
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
