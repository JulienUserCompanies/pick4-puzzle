import { supabase } from './supabase';
import { Puzzle } from '../engine/types';

export interface DailyChallenge {
  challengeDate: string;
  grid: number[];
  target: number;
  pickCount: number;
}

export interface DailyLeaderboardRow {
  challengeDate: string;
  timeMs: number;
  taps: number;
  displayName: string | null;
}

function todayDateString(): string {
  // UTC date so every player sees the same challenge at the same moment,
  // matching challenge_date being a plain `date` column server-side.
  return new Date().toISOString().slice(0, 10);
}

/** Today's shared puzzle, or null if nothing has been published yet (daily_challenges is service-role-write only). */
export async function fetchTodayChallenge(): Promise<DailyChallenge | null> {
  const { data, error } = await supabase
    .from('daily_challenges')
    .select('challenge_date, grid, target, pick_count')
    .eq('challenge_date', todayDateString())
    .maybeSingle();

  if (error || !data) return null;

  return {
    challengeDate: data.challenge_date,
    grid: data.grid as number[],
    target: data.target,
    pickCount: data.pick_count,
  };
}

export function challengeToPuzzle(challenge: DailyChallenge): Puzzle {
  return {
    grid: challenge.grid,
    target: challenge.target,
    pickCount: challenge.pickCount,
    solutionIndices: [], // not needed client-side; the win condition is just "sum === target"
    tier: 'mid',
  };
}

/** Whether the signed-in player has already submitted today's result (daily_results allows only one row per user/date). */
export async function hasSubmittedToday(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('daily_results')
    .select('challenge_date')
    .eq('user_id', userId)
    .eq('challenge_date', todayDateString())
    .maybeSingle();
  return !!data;
}

export async function submitDailyResult(
  userId: string,
  timeMs: number,
  taps: number
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('daily_results')
    .insert({ user_id: userId, challenge_date: todayDateString(), time_ms: timeMs, taps });
  return { error: error?.message ?? null };
}

/**
 * Today's fastest results, for the leaderboard screen. Two queries rather
 * than a PostgREST embed: `daily_results.user_id` references `auth.users`
 * directly (see 0001_init.sql), not `profiles`, so there's no FK for an
 * embedded `profiles(...)` select to walk.
 */
export async function fetchTodayLeaderboard(limit = 20): Promise<DailyLeaderboardRow[]> {
  const { data: results, error } = await supabase
    .from('daily_results')
    .select('challenge_date, time_ms, taps, user_id')
    .eq('challenge_date', todayDateString())
    .order('time_ms', { ascending: true })
    .limit(limit);

  if (error || !results || results.length === 0) return [];

  const userIds = results.map((r) => r.user_id);
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name')
    .in('id', userIds);

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.display_name as string | null]));

  return results.map((row) => ({
    challengeDate: row.challenge_date,
    timeMs: row.time_ms,
    taps: row.taps,
    displayName: nameById.get(row.user_id) ?? null,
  }));
}
