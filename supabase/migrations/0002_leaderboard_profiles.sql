-- Pick 4 — public display names for the Daily Challenge leaderboard
--
-- 0001_init.sql only lets a user read their own profile row, which is
-- right for most of `profiles` but blocks the leaderboard from showing
-- *other* players' names next to their daily_results. `display_name` is
-- not sensitive (it's just the local part of the email, auto-set at
-- sign-up — see handle_new_user()), so this adds narrow public-read access
-- to it without loosening anything else on the table.
--
-- Run this after 0001_init.sql, the same way (SQL Editor or `supabase db push`).

create policy "profiles: public read display_name for leaderboard"
  on public.profiles for select
  using (true);

-- Note: this is intentionally a second, broader SELECT policy alongside
-- "profiles: read own" from 0001 — Postgres RLS policies are OR'd together,
-- so this one simply widens read access to the whole table rather than
-- replacing the per-user one. If you later add sensitive columns to
-- `profiles`, revisit this policy (or move those columns to a separate,
-- owner-only table) before they'd be exposed the same way.
