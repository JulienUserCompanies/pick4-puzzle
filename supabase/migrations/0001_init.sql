-- Pick 4 — initial schema
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query),
-- or via `supabase db push` if you're using the Supabase CLI locally.

-- ─────────────────────────────────────────────────────────────────────────
-- profiles: one row per signed-up user, keyed to Supabase's built-in auth.users
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: read own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: insert own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create a profile row the moment someone signs up, so the app never
-- has to remember to do it itself.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────
-- progress: stars per level, replaces the on-device-only AsyncStorage store
-- once a player signs in. One row per (user, level).
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  level int not null check (level >= 1),
  stars int not null check (stars between 0 and 3),
  updated_at timestamptz not null default now(),
  primary key (user_id, level)
);

alter table public.progress enable row level security;

create policy "progress: read own"
  on public.progress for select
  using (auth.uid() = user_id);

create policy "progress: insert own"
  on public.progress for insert
  with check (auth.uid() = user_id);

create policy "progress: update own"
  on public.progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "progress: delete own"
  on public.progress for delete
  using (auth.uid() = user_id);

create index if not exists progress_user_id_idx on public.progress (user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- daily_challenges: the same puzzle for every player on a given date.
-- Public read-only; written by an admin/service-role process (not the app
-- itself, and not covered by this migration), never by a regular client.
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.daily_challenges (
  challenge_date date primary key,
  grid jsonb not null,
  target int not null,
  pick_count int not null default 4,
  created_at timestamptz not null default now()
);

alter table public.daily_challenges enable row level security;

create policy "daily_challenges: public read"
  on public.daily_challenges for select
  using (true);

-- No insert/update/delete policy is created here on purpose — only the
-- service_role key (used server-side, never shipped in the app) can write
-- to this table while RLS is on.

-- ─────────────────────────────────────────────────────────────────────────
-- daily_results: one result per (user, challenge date), for leaderboards.
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.daily_results (
  user_id uuid not null references auth.users (id) on delete cascade,
  challenge_date date not null references public.daily_challenges (challenge_date) on delete cascade,
  time_ms int not null check (time_ms >= 0),
  taps int not null check (taps >= 0),
  created_at timestamptz not null default now(),
  primary key (user_id, challenge_date)
);

alter table public.daily_results enable row level security;

create policy "daily_results: read all"
  on public.daily_results for select
  using (true); -- leaderboards need to show everyone's results, not just your own

create policy "daily_results: insert own"
  on public.daily_results for insert
  with check (auth.uid() = user_id);

-- No update/delete policy: a submitted daily result is final, by design.

create index if not exists daily_results_challenge_date_idx on public.daily_results (challenge_date);
