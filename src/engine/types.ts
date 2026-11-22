export type DifficultyTier = 'easy' | 'mid' | 'hard' | 'expert';

export interface Puzzle {
  /** The numbers shown on the grid, in display order. */
  grid: number[];
  /** The value the player must reach by summing exactly `pickCount` numbers. */
  target: number;
  /** How many tiles must be selected to win (usually 4). */
  pickCount: number;
  /** Indices into `grid` that form at least one valid solution (for dev/testing only — never shown to the player). */
  solutionIndices: number[];
  tier: DifficultyTier;
}

export interface DifficultyConfig {
  tier: DifficultyTier;
  gridSize: number; // e.g. 9 for 3x3, 16 for 4x4
  pickCount: number; // numbers the player must select
  numberRange: [number, number];
  /** Round to this step (e.g. 50 for round tens/hundreds on easy). */
  roundTo: number;
  /** How many near-miss distractor numbers to seed (tempts wrong taps). */
  nearMissCount: number;
}
