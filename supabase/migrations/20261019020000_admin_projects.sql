-- WebTech Ninjas admin: Projects board + launch checklists
-- Run after the dashboard and clients migrations. Safe to run more than once.

------------------------------------------------------------------------------------------------
-- 1. Projects: the extra columns the board needs
------------------------------------------------------------------------------------------------

alter table public.projects add column if not exists drive_url  text;   -- client's asset folder
alter table public.projects add column if not exists start_date date;
alter table public.projects add column if not exists notes      text;
alter table public.projects add column if not exists updated_at timestamptz not null default now();

create index if not exists projects_client_idx on public.projects (client_id);
create index if not exists projects_due_idx on public.projects (due_date) where status not in ('done', 'cancelled');

drop trigger if exists projects_touch on public.projects;
create trigger projects_touch before update on public.projects
  for each row execute function public.touch_updated_at();

-- completed_at follows status, so "Launched" in Recent Activity and the Done column's dates are
-- always right, whether you drag the card or change it anywhere else.
create or replace function public.project_completed_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.status = 'done' and (tg_op = 'INSERT' or old.status is distinct from 'done') then
    new.completed_at := coalesce(new.completed_at, now());
  elsif new.status <> 'done' then
    new.completed_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists projects_completed_at on public.projects;
create trigger projects_completed_at before insert or update of status on public.projects
  for each row execute function public.project_completed_at();

------------------------------------------------------------------------------------------------
-- 2. Checklist items (the launch checklist and everything before it)
------------------------------------------------------------------------------------------------

create table if not exists public.project_tasks (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects (id) on delete cascade,
  phase       text not null,
  title       text not null,
  done        boolean not null default false,
  done_at     timestamptz,
  due_date    date,
  position    integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists project_tasks_project_idx on public.project_tasks (project_id, position);
create index if not exists project_tasks_open_due_idx on public.project_tasks (due_date) where not done;

create or replace function public.project_task_done_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.done and (tg_op = 'INSERT' or not old.done) then new.done_at := now();
  elsif not new.done then new.done_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists project_tasks_done_at on public.project_tasks;
create trigger project_tasks_done_at before insert or update of done on public.project_tasks
  for each row execute function public.project_task_done_at();

alter table public.project_tasks enable row level security;

drop policy if exists "admins manage project_tasks" on public.project_tasks;
create policy "admins manage project_tasks" on public.project_tasks
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
