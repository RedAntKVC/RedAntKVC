-- Users table is managed by Supabase Auth (auth.users)
-- The tables below store per-user app data.

-- -------------------------------------------------------
-- user_settings
-- -------------------------------------------------------
create table if not exists public.user_settings (
  id uuid primary key references auth.users(id) on delete cascade,
  google_connected boolean default false,
  apple_connected boolean default false,
  twitter_connected boolean default false,
  enabled_calendars text[] default '{}',
  enabled_task_lists text[] default '{}',
  push_token text,
  theme text default 'dark',
  sync_interval integer default 15,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- -------------------------------------------------------
-- monitor_targets
-- -------------------------------------------------------
create table if not exists public.monitor_targets (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  url text not null,
  label text not null,
  keyword text,
  last_checked timestamptz,
  last_content text,
  has_change boolean default false,
  check_interval integer default 15,
  created_at timestamptz default now()
);

-- -------------------------------------------------------
-- feed_cache
-- -------------------------------------------------------
create table if not exists public.feed_cache (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  type text not null,
  title text,
  content text,
  url text,
  author text,
  published_at timestamptz,
  is_new boolean default true,
  created_at timestamptz default now()
);

-- -------------------------------------------------------
-- Row Level Security
-- -------------------------------------------------------
alter table public.user_settings enable row level security;
alter table public.monitor_targets enable row level security;
alter table public.feed_cache enable row level security;

create policy "Users can manage own settings"
  on public.user_settings for all
  using (auth.uid() = id);

create policy "Users can manage own monitors"
  on public.monitor_targets for all
  using (auth.uid() = user_id);

create policy "Users can manage own feed"
  on public.feed_cache for all
  using (auth.uid() = user_id);

-- -------------------------------------------------------
-- updated_at trigger for user_settings
-- -------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger user_settings_updated_at
  before update on public.user_settings
  for each row execute function public.handle_updated_at();
