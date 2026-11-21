-- Pick 4 — Timed mode results, for the "best run today" leaderboard
--
-- Unlike daily_results (one row per user per challenge_date, because the
-- Daily Challenge can only be submitted once), Timed mode is a replayable
-- 60-second sprint — a player can run it as many times a day as they like.
-- So this table allows multiple rows per (user, day) on purpose; the
-- leaderboard query (fetchTodayTimedLeaderboard in src/lib/timed.ts) keeps
-- only each player's best run for today.
--
-- Run this after 0001_init.sql and 0002_leaderboard_profiles.sql, the same
-- way (SQL Editor or `supabase db push`).

create table if not exists public.timed_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  puzzles_solved int not null check (puzzles_solved >= 0),
  -- UTC calendar date the run was played on, so "today's leaderboard"
  -- means the same thing for every player regardless of their own timezone
  -- (same convention as daily_challenges.challenge_date).
  played_date date not null default ((now() at time zone 'utc')::date),
  created_at timestamptz not null default now()
);

alter table public.timed_results enable row level security;

create policy "timed_results: read all"
  on public.timed_results for select
  using (true); -- leaderboards need to show everyone's results, not just your own

create policy "timed_results: insert own"
  on public.timed_results for insert
  with check (auth.uid() = user_id);

-- No update/delete policy: a submitted run is final, by design (same as
-- daily_results) — a new run is a new row, never an edit to an old one.

create index if not exists timed_results_played_date_idx on public.timed_results (played_date);
create index if not exists timed_results_user_id_idx on public.timed_results (user_id);
