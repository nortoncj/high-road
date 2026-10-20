-- WebTech Ninjas admin: Tasks (the small stuff)
-- Run after the dashboard, clients and projects migrations. Safe to run more than once.
--
-- Project checklist items stay in project_tasks. The Tasks page shows both, so there's one
-- "what do I do today" list instead of two.

create table if not exists public.tasks (
  id          uuid primary key default gen_random_uuid(),
  title       text not null check (char_length(title) between 1 and 300),
  notes       text,
  due_date    date,
  done        boolean not null default false,
  done_at     timestamptz,
  client_id   uuid references public.clients (id) on delete set null,
  project_id  uuid references public.projects (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists tasks_open_due_idx on public.tasks (due_date) where not done;
create index if not exists tasks_done_at_idx on public.tasks (done_at desc) where done;
create index if not exists tasks_client_idx on public.tasks (client_id);
create index if not exists tasks_project_idx on public.tasks (project_id);

-- Same done_at stamping as checklist items (the function only touches done / done_at).
drop trigger if exists tasks_done_at on public.tasks;
create trigger tasks_done_at before insert or update of done on public.tasks
  for each row execute function public.project_task_done_at();

drop trigger if exists tasks_touch on public.tasks;
create trigger tasks_touch before update on public.tasks
  for each row execute function public.touch_updated_at();

alter table public.tasks enable row level security;

drop policy if exists "admins manage tasks" on public.tasks;
create policy "admins manage tasks" on public.tasks
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
