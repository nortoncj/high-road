-- WebTech Ninjas admin: Studio (AI images and video through fal)
-- Run after the earlier admin migrations. Safe to run more than once.
--
-- Files live in your S3-compatible bucket (R2 now, Spaces or S3 later). This database only stores
-- the object KEY for each file, never a URL, so moving providers never touches these rows.

------------------------------------------------------------------------------------------------
-- 1. Brand presets: yours, your personal brand, then one per customer
------------------------------------------------------------------------------------------------

create table if not exists public.studio_presets (
  id              uuid primary key default gen_random_uuid(),
  name            text not null check (char_length(name) between 1 and 80),
  client_id       uuid references public.clients (id) on delete set null,
  style           text,                       -- the look: "warm coastal light, clean editorial, ..."
  palette         jsonb not null default '[]'::jsonb check (jsonb_typeof(palette) = 'array'),  -- [{ "name": "Ocean teal", "hex": "#1F5C63" }]
  display_font    text,
  body_font       text,
  voice           text,                       -- how headlines should sound
  avoid           text,                       -- what never to show
  logo_key        text,                       -- storage key of the logo image
  reference_keys  text[] not null default '{}' check (cardinality(reference_keys) <= 8),
  is_builtin      boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

------------------------------------------------------------------------------------------------
-- 2. Threads (one chat per piece of work), jobs (fal requests), assets (files), messages
------------------------------------------------------------------------------------------------

create table if not exists public.studio_threads (
  id          uuid primary key default gen_random_uuid(),
  title       text not null default 'Untitled' check (char_length(title) <= 120),
  preset_id   uuid references public.studio_presets (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.studio_jobs (
  id            uuid primary key default gen_random_uuid(),
  thread_id     uuid not null references public.studio_threads (id) on delete cascade,
  kind          text not null check (kind in ('image', 'video')),
  endpoint      text not null,
  request_id    text,
  status_url    text,
  response_url  text,
  status        text not null default 'queued' check (status in ('queued', 'running', 'finalizing', 'done', 'failed', 'canceled')),
  format        text,
  ratio         text,
  input         jsonb not null default '{}'::jsonb,
  plan          jsonb not null default '{}'::jsonb,   -- what to do with the output: carousel slicing, export size, labels
  cost_cents    int not null default 0,              -- estimate from the model's price list
  error         text,
  created_at    timestamptz not null default now(),
  completed_at  timestamptz
);

create index if not exists studio_jobs_open_idx on public.studio_jobs (thread_id) where status in ('queued', 'running', 'finalizing');
create index if not exists studio_jobs_month_idx on public.studio_jobs (created_at) where status = 'done';

create table if not exists public.studio_assets (
  id           uuid primary key default gen_random_uuid(),
  thread_id    uuid references public.studio_threads (id) on delete cascade,
  job_id       uuid references public.studio_jobs (id) on delete set null,
  kind         text not null check (kind in ('image', 'video')),
  origin       text not null check (origin in ('generated', 'upload', 'edited', 'text-layer', 'slide', 'frame')),
  storage_key  text not null unique,
  mime         text not null,
  bytes        bigint not null default 0,
  width        int,
  height       int,
  duration_s   numeric(6, 2),
  format       text,
  ratio        text,
  prompt       text,
  model        text,
  preset_id    uuid references public.studio_presets (id) on delete set null,
  parent_id    uuid references public.studio_assets (id) on delete set null,
  group_id     uuid,          -- carousel set: slides share one
  slide_index  int,
  label        text,          -- "Variant 2: Problem", "Slide 3"
  created_at   timestamptz not null default now()
);

create index if not exists studio_assets_thread_idx on public.studio_assets (thread_id, created_at);
create index if not exists studio_assets_group_idx on public.studio_assets (group_id) where group_id is not null;
create index if not exists studio_assets_recent_idx on public.studio_assets (created_at desc);

create table if not exists public.studio_messages (
  id          uuid primary key default gen_random_uuid(),
  thread_id   uuid not null references public.studio_threads (id) on delete cascade,
  role        text not null check (role in ('user', 'assistant')),
  body        text,
  asset_ids   uuid[] not null default '{}',
  job_id      uuid references public.studio_jobs (id) on delete set null,
  meta        jsonb not null default '{}'::jsonb,   -- format, ratio, text mode, chosen options: shown as chips
  created_at  timestamptz not null default now()
);

create index if not exists studio_messages_thread_idx on public.studio_messages (thread_id, created_at);

------------------------------------------------------------------------------------------------
-- 3. Admins only, same as everything else
------------------------------------------------------------------------------------------------

do $$
declare t text;
begin
  foreach t in array array['studio_presets', 'studio_threads', 'studio_jobs', 'studio_assets', 'studio_messages'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "admins manage %s" on public.%I', t, t);
    execute format('create policy "admins manage %s" on public.%I for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))', t, t);
  end loop;
end $$;

drop trigger if exists studio_presets_touch on public.studio_presets;
create trigger studio_presets_touch before update on public.studio_presets
  for each row execute function public.touch_updated_at();
drop trigger if exists studio_threads_touch on public.studio_threads;
create trigger studio_threads_touch before update on public.studio_threads
  for each row execute function public.touch_updated_at();

------------------------------------------------------------------------------------------------
-- 4. Starter presets. Edit them in Studio > Presets; they're only inserted once.
------------------------------------------------------------------------------------------------

insert into public.studio_presets (name, style, palette, display_font, body_font, voice, avoid, is_builtin)
select 'WebTech Ninjas',
  'Luxury coastal, clean and trustworthy with an edge. Warm sand and warm white surfaces, deep ocean teal anchors, sea glass accents, a touch of brass for one highlight. Soft natural light, generous negative space, crisp geometric shapes with sharp slashed angles. Modern, premium, calm, never cluttered.',
  '[{"name":"Ocean teal","hex":"#1F5C63"},{"name":"Sea glass","hex":"#30929D"},{"name":"Sea foam","hex":"#CFE1D9"},{"name":"Sand","hex":"#F6F2EA"},{"name":"Warm white","hex":"#FBFAF7"},{"name":"Ink","hex":"#223438"},{"name":"Brass","hex":"#9D7B0F"}]'::jsonb,
  'Bricolage Grotesque', 'Instrument Sans',
  'Polished and direct. Plain words a busy service business owner gets in one read. Confident, never hypey.',
  'No ninjas, masks, katanas or martial arts clichés. No stock-photo handshakes, no glowing brains, no robots, no neon cyberpunk. No fake reviews, star ratings or made-up statistics.',
  true
where not exists (select 1 from public.studio_presets where is_builtin and name = 'WebTech Ninjas');

insert into public.studio_presets (name, style, palette, display_font, body_font, voice, avoid, is_builtin)
select 'Personal Brand',
  'Tech forward but human: real workbench and desk setups, circuit boards, terminals and dashboards, shot like a candid creator photo. Dark, moody base with one bright accent color. Engineering credibility for everyday people.',
  '[{"name":"Charcoal","hex":"#14171C"},{"name":"Graphite","hex":"#2A2F37"},{"name":"Off white","hex":"#F3F4F1"},{"name":"Signal cyan","hex":"#22D3EE"}]'::jsonb,
  'Bricolage Grotesque', 'Instrument Sans',
  'Casual, like texting a friend who builds things. Short, punchy, a little funny. Shows the work.',
  'No suits, no corporate stock imagery, no generic AI glow, no fake screenshots of metrics.',
  true
where not exists (select 1 from public.studio_presets where is_builtin and name = 'Personal Brand');
