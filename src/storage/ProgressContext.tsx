import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  DEFAULT_PROGRESS,
  ProgressState,
  clearProgress,
  loadProgress,
  saveProgress,
} from './progress';

interface ProgressContextValue {
  progress: ProgressState;
  loading: boolean;
  /** Records a level result; unlocks the next level and keeps the best star count. */
  recordWin: (level: number, stars: number) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setHapticsEnabled: (enabled: boolean) => void;
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<ProgressState>(DEFAULT_PROGRESS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    loadProgress().then((loaded) => {
      if (!cancelled) {
        setProgress(loaded);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

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
        saveProgress(next);
        return next;
      });
    },
    []
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
  }, []);

  return (
    <ProgressContext.Provider
      value={{ progress, loading, recordWin, setSoundEnabled, setHapticsEnabled, resetProgress }}
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
