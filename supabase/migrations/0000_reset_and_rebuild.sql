-- Pick 4 — FULL RESET AND REBUILD
--
-- Drops every app table this project uses and recreates them clean, in one
-- pass. Use this to recover from a bad manual SQL run, rather than trying
-- to run 0001/0002/0003 again on top of a schema that's now in an unknown
-- state.
--
-- ⚠️ DESTRUCTIVE: this deletes all rows in profiles, progress,
-- daily_challenges, daily_results and timed_results. It does NOT touch
-- auth.users — accounts themselves are untouched, only this app's own
-- tables. Run this in the Supabase SQL Editor (Project > SQL Editor > New
-- query), as one paste.

-- ─────────────────────────────────────────────────────────────────────────
-- Drop everything first, in dependency order (children before parents),
-- so re-running this is always safe even if some objects already exist.
-- ─────────────────────────────────────────────────────────────────────────
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

drop table if exists public.timed_results cascade;
drop table if exists public.daily_results cascade;
drop table if exists public.daily_challenges cascade;
drop table if exists public.progress cascade;
drop table if exists public.profiles cascade;

-- ─────────────────────────────────────────────────────────────────────────
-- profiles: one row per signed-up user, keyed to Supabase's built-in auth.users
-- ─────────────────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: read own"
  on public.profiles for select
  using (auth.uid() = id);

-- From 0002: leaderboards need to show other players' names too, not just
-- your own. OR'd together with the policy above, so this only widens read
-- access — it doesn't replace the per-user one.
create policy "profiles: public read display_name for leaderboard"
  on public.profiles for select
  using (true);

create policy "profiles: insert own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create a profile row the moment someone signs up.
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────
-- progress: stars per level. One row per (user, level).
-- ─────────────────────────────────────────────────────────────────────────
create table public.progress (
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

create index progress_user_id_idx on public.progress (user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- daily_challenges: the same puzzle for every player on a given date.
-- Public read-only; written only by the service_role key, never the app.
-- ─────────────────────────────────────────────────────────────────────────
create table public.daily_challenges (
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

-- ─────────────────────────────────────────────────────────────────────────
-- daily_results: one result per (user, challenge date), for leaderboards.
-- ─────────────────────────────────────────────────────────────────────────
create table public.daily_results (
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
  using (true);

create policy "daily_results: insert own"
  on public.daily_results for insert
  with check (auth.uid() = user_id);

create index daily_results_challenge_date_idx on public.daily_results (challenge_date);

-- ─────────────────────────────────────────────────────────────────────────
-- timed_results: Timed-mode sprint runs. Replayable, so multiple rows per
-- (user, day) are allowed on purpose — the app keeps only the best client-side.
-- ─────────────────────────────────────────────────────────────────────────
create table public.timed_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  puzzles_solved int not null check (puzzles_solved >= 0),
  played_date date not null default ((now() at time zone 'utc')::date),
  created_at timestamptz not null default now()
);

alter table public.timed_results enable row level security;

create policy "timed_results: read all"
  on public.timed_results for select
  using (true);

create policy "timed_results: insert own"
  on public.timed_results for insert
  with check (auth.uid() = user_id);

create index timed_results_played_date_idx on public.timed_results (played_date);
create index timed_results_user_id_idx on public.timed_results (user_id);
