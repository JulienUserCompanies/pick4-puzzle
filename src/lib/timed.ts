import { supabase } from './supabase';

export interface TimedLeaderboardRow {
  userId: string;
  puzzlesSolved: number;
  displayName: string | null;
}

function todayDateString(): string {
  // UTC date, matching timed_results.played_date's default and daily.ts's
  // same convention — every player sees "today" as the same calendar date.
  return new Date().toISOString().slice(0, 10);
}

export async function submitTimedResult(
  userId: string,
  puzzlesSolved: number
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('timed_results')
    .insert({ user_id: userId, puzzles_solved: puzzlesSolved, played_date: todayDateString() });
  return { error: error?.message ?? null };
}

/**
 * Today's best Timed run per player, for the leaderboard. Timed mode is
 * replayable (unlike the Daily Challenge), so a player can have many rows
 * for today — this keeps only their single best one. There's no SQL
 * GROUP-BY-then-join available over PostgREST here, so it's done in two
 * steps: fetch today's rows best-first, keep the first (= best) row per
 * user client-side, then look up display names for just that shortlist.
 */
export async function fetchTodayTimedLeaderboard(limit = 20): Promise<TimedLeaderboardRow[]> {
  const { data: results, error } = await supabase
    .from('timed_results')
    .select('puzzles_solved, user_id, created_at')
    .eq('played_date', todayDateString())
    .order('puzzles_solved', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(500); // generous cap on today's total runs; deduped to best-per-user below

  if (error || !results || results.length === 0) return [];

  const bestByUser = new Map<string, number>();
  for (const row of results) {
    if (!bestByUser.has(row.user_id)) bestByUser.set(row.user_id, row.puzzles_solved);
  }
  const topEntries = [...bestByUser.entries()].slice(0, limit);
  const userIds = topEntries.map(([id]) => id);

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name')
    .in('id', userIds);
  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.display_name as string | null]));

  return topEntries.map(([userId, puzzlesSolved]) => ({
    userId,
    puzzlesSolved,
    displayName: nameById.get(userId) ?? null,
  }));
}
