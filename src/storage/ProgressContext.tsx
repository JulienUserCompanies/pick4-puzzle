import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  DEFAULT_PROGRESS,
  ProgressState,
  clearProgress,
  loadProgress,
  saveProgress,
} from './progress';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface ProgressContextValue {
  progress: ProgressState;
  loading: boolean;
  /** True when progress is being read from/written to the account, not just this device. */
  synced: boolean;
  recordWin: (level: number, stars: number) => void;
  /** Updates the device-local Timed best if `solved` beats it. Returns whether it was a new best. */
  recordTimedBest: (solved: number) => boolean;
  setSoundEnabled: (enabled: boolean) => void;
  setHapticsEnabled: (enabled: boolean) => void;
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

async function fetchRemoteProgress(userId: string): Promise<ProgressState | null> {
  const { data, error } = await supabase
    .from('progress')
    .select('level, stars')
    .eq('user_id', userId);

  if (error || !data) return null;

  const starsByLevel: Record<number, number> = {};
  for (const row of data) starsByLevel[row.level] = row.stars;

  const unlockedLevels = Object.keys(starsByLevel).map(Number);
  const maxUnlockedLevel = unlockedLevels.length > 0 ? Math.max(...unlockedLevels) + 1 : 1;

  return { ...DEFAULT_PROGRESS, starsByLevel, maxUnlockedLevel };
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ProgressState>(DEFAULT_PROGRESS);
  const [loading, setLoading] = useState(true);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      if (user) {
        const [remote, local] = await Promise.all([fetchRemoteProgress(user.id), loadProgress()]);
        if (cancelled) return;
        if (remote) {
          // timedBest is device-local only (see progress.ts) — fetchRemoteProgress
          // always returns 0 for it, so carry over whatever was cached here already
          // rather than letting a sign-in wipe out today's Timed best from view.
          const merged: ProgressState = { ...remote, timedBest: local.timedBest };
          setProgress(merged);
          setSynced(true);
          saveProgress(merged); // keep a local cache as an offline fallback
        } else {
          // Supabase unreachable — fall back to whatever's cached locally
          // rather than showing an empty board.
          setProgress(local);
          setSynced(false);
        }
      } else {
        const local = await loadProgress();
        if (!cancelled) {
          setProgress(local);
          setSynced(false);
        }
      }
      if (!cancelled) setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const persist = useCallback((next: ProgressState) => {
    setProgress(next);
    saveProgress(next);
  }, []);

  const recordWin = useCallback(
    (level: number, stars: number) => {
      setProgress((prev) => {
        const bestStars = Math.max(prev.starsByLevel[level] ?? 0, stars);
        const next: ProgressState = {
          ...prev,
          starsByLevel: { ...prev.starsByLevel, [level]: bestStars },
          maxUnlockedLevel: Math.max(prev.maxUnlockedLevel, level + 1),
        };
        saveProgress(next); // local cache always, regardless of login state

        if (user) {
          // Fire-and-forget: a failed sync just means the local cache is
          // ahead of the account until the next successful write; it never
          // blocks the player from continuing.
          supabase
            .from('progress')
            .upsert({ user_id: user.id, level, stars: bestStars }, { onConflict: 'user_id,level' })
            .then(({ error }) => setSynced(!error));
        }

        return next;
      });
    },
    [user]
  );

  const recordTimedBest = useCallback(
    (solved: number) => {
      const isNewBest = solved > progress.timedBest;
      if (isNewBest) persist({ ...progress, timedBest: solved });
      return isNewBest;
    },
    [progress, persist]
  );

  const setSoundEnabled = useCallback(
    (enabled: boolean) => persist({ ...progress, soundEnabled: enabled }),
    [progress, persist]
  );

  const setHapticsEnabled = useCallback(
    (enabled: boolean) => persist({ ...progress, hapticsEnabled: enabled }),
    [progress, persist]
  );

  const resetProgress = useCallback(() => {
    clearProgress();
    setProgress(DEFAULT_PROGRESS);
    if (user) {
      supabase.from('progress').delete().eq('user_id', user.id);
    }
  }, [user]);

  return (
    <ProgressContext.Provider
      value={{
        progress,
        loading,
        synced,
        recordWin,
        recordTimedBest,
        setSoundEnabled,
        setHapticsEnabled,
        resetProgress,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within a ProgressProvider');
  return ctx;
}
