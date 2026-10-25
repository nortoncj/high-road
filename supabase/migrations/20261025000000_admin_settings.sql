-- WebTech Ninjas admin: Settings (admins, invites, lead alerts)
-- Run after the earlier admin migrations. Safe to run more than once.
--
-- How inviting works, with no service role key anywhere near the admin pages:
--   1. An owner adds an email to admin_invites. The app emails them a sign-in link through Brevo.
--   2. They sign in with the normal code flow. Supabase creates their auth user.
--   3. A trigger on auth.users sees the pending invite and adds them to admin_users. Done.
--   4. hook_admin_invite_only() (enable it under Auth > Hooks) refuses every other new account,
--      so turning on sign-ups doesn't open the door to strangers.
-- Even without the hook, a stranger's account can't see anything: every page and every
-- RLS policy checks admin_users.

------------------------------------------------------------------------------------------------
-- 1. admin_users: email, alert preference, owner/admin roles
------------------------------------------------------------------------------------------------

alter table public.admin_users add column if not exists email       text;
alter table public.admin_users add column if not exists lead_alerts boolean not null default true;

-- Emails live in auth.users, which the app can't read. Copy them over once; the triggers keep it current.
update public.admin_users a set email = lower(u.email)
from auth.users u
where u.id = a.user_id and a.email is null;

update public.admin_users set role = 'admin' where role is null or role not in ('owner', 'admin');

-- The first admin (you) becomes the owner, if there isn't one yet.
update public.admin_users set role = 'owner'
where user_id = (select user_id from public.admin_users order by created_at limit 1)
  and not exists (select 1 from public.admin_users where role = 'owner');

alter table public.admin_users drop constraint if exists admin_users_role_check;
alter table public.admin_users add constraint admin_users_role_check check (role in ('owner', 'admin'));

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admin_users where user_id = (select auth.uid()) and role = 'owner');
$$;

revoke all on function public.is_owner() from public;
grant execute on function public.is_owner() to authenticated;

-- Admins can see the whole team now, not just themselves.
drop policy if exists "admins read own row" on public.admin_users;
drop policy if exists "admins read admins" on public.admin_users;
create policy "admins read admins" on public.admin_users
  for select to authenticated
  using ((select public.is_admin()));

-- Your own name and alert setting, nothing else. Column grants stop anyone promoting themselves.
drop policy if exists "admins update own row" on public.admin_users;
create policy "admins update own row" on public.admin_users
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
revoke update on public.admin_users from authenticated, anon;
grant update (full_name, lead_alerts) on public.admin_users to authenticated;

-- Owners remove admins. Never an owner, never yourself.
drop policy if exists "owners remove admins" on public.admin_users;
create policy "owners remove admins" on public.admin_users
  for delete to authenticated
  using ((select public.is_owner()) and role <> 'owner' and user_id <> (select auth.uid()));

-- No insert policy: rows only come from the invite triggers below.

------------------------------------------------------------------------------------------------
-- 2. Invites
------------------------------------------------------------------------------------------------

create table if not exists public.admin_invites (
  id           uuid primary key default gen_random_uuid(),
  email        text not null check (email = lower(email) and email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  full_name    text check (char_length(full_name) <= 120),
  role         text not null default 'admin' check (role = 'admin'),
  invited_by   uuid references auth.users (id) on delete set null,
  created_at   timestamptz not null default now(),
  expires_at   timestamptz not null default now() + interval '7 days',
  accepted_at  timestamptz
);

-- One open invite per email.
create unique index if not exists admin_invites_open_email_idx on public.admin_invites (email) where accepted_at is null;

alter table public.admin_invites enable row level security;
drop policy if exists "admins read invites" on public.admin_invites;
create policy "admins read invites" on public.admin_invites
  for select to authenticated using ((select public.is_admin()));
drop policy if exists "owners manage invites" on public.admin_invites;
create policy "owners manage invites" on public.admin_invites
  for all to authenticated
  using ((select public.is_owner()))
  with check ((select public.is_owner()));

-- New auth user with an open invite → admin. Runs when Supabase creates the account on first sign-in.
create or replace function public.accept_admin_invite()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  inv public.admin_invites%rowtype;
begin
  select * into inv from public.admin_invites
  where email = lower(new.email) and accepted_at is null and expires_at > now()
  order by created_at desc limit 1;

  if found then
    insert into public.admin_users (user_id, full_name, role, email)
    values (new.id, inv.full_name, inv.role, lower(new.email))
    on conflict (user_id) do nothing;
    update public.admin_invites set accepted_at = now() where id = inv.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_accept_invite on auth.users;
create trigger on_auth_user_created_accept_invite
  after insert on auth.users
  for each row execute function public.accept_admin_invite();

-- Inviting someone who already has an account (an admin you removed, say) lets them straight back in.
-- Inviting a current admin is refused with a clear message.
create or replace function public.invite_existing_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid;
begin
  if exists (select 1 from public.admin_users where email = new.email) then
    raise exception 'already_admin' using errcode = 'P0001', hint = 'That person is already an admin.';
  end if;

  select id into uid from auth.users where lower(email) = new.email limit 1;
  if uid is not null then
    insert into public.admin_users (user_id, full_name, role, email)
    values (uid, new.full_name, new.role, new.email)
    on conflict (user_id) do nothing;
    new.accepted_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists admin_invites_existing_user on public.admin_invites;
create trigger admin_invites_existing_user
  before insert on public.admin_invites
  for each row execute function public.invite_existing_user();

-- The sign-in form asks this before letting Supabase create an account.
-- Only says yes for an open, unexpired invite, so it can't be used to list admins.
create or replace function public.invite_pending(p_email text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_invites
    where email = lower(trim(p_email)) and accepted_at is null and expires_at > now()
  );
$$;

revoke all on function public.invite_pending(text) from public;
grant execute on function public.invite_pending(text) to anon, authenticated;

------------------------------------------------------------------------------------------------
-- 3. The gate: Supabase > Authentication > Hooks > Before User Created > Postgres > this function
------------------------------------------------------------------------------------------------

create or replace function public.hook_admin_invite_only(event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  em text := lower(event -> 'user' ->> 'email');
begin
  if em is not null and exists (
    select 1 from public.admin_invites where email = em and accepted_at is null and expires_at > now()
  ) then
    return '{}'::jsonb;
  end if;
  return jsonb_build_object('error', jsonb_build_object('message', 'Admin access is by invite only.', 'http_code', 403));
end;
$$;

revoke all on function public.hook_admin_invite_only(jsonb) from public, anon, authenticated;
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'supabase_auth_admin') then
    execute 'grant execute on function public.hook_admin_invite_only(jsonb) to supabase_auth_admin';
  end if;
end $$;

------------------------------------------------------------------------------------------------
-- 4. Lead alerts: one row per lead that got an alert, so a retried webhook never double-emails
------------------------------------------------------------------------------------------------

create table if not exists public.lead_alerts_sent (
  lead_id     text primary key,
  recipients  int not null default 0,
  sent_at     timestamptz not null default now()
);

alter table public.lead_alerts_sent enable row level security;
drop policy if exists "admins read lead alerts" on public.lead_alerts_sent;
create policy "admins read lead alerts" on public.lead_alerts_sent
  for select to authenticated using ((select public.is_admin()));
-- Written only by /api/alerts/lead (service role, server to server).
