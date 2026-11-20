import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'pick4:progress:v1';

export interface ProgressState {
  /** Stars earned (0–3) per level number. A level with no entry hasn't been played. */
  starsByLevel: Record<number, number>;
  /** Highest level the player can enter. Starts at 1; unlocked by winning the level before it. */
  maxUnlockedLevel: number;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
}

export const DEFAULT_PROGRESS: ProgressState = {
  starsByLevel: {},
  maxUnlockedLevel: 1,
  soundEnabled: true,
  hapticsEnabled: true,
};

export async function loadProgress(): Promise<ProgressState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PROGRESS, ...parsed };
  } catch {
    // Corrupt or unavailable storage shouldn't crash the app — start fresh.
    return DEFAULT_PROGRESS;
  }
}

export async function saveProgress(state: ProgressState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Best-effort persistence; losing a save shouldn't crash the game.
  }
}

export async function clearProgress(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
