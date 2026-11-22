import { DifficultyConfig, DifficultyTier } from './types';

/**
 * Difficulty tiers, following the scaling plan in the design doc:
 * grid size, number range, and distractor pressure all tighten as the
 * player advances. Levels are mapped to a tier by `tierForLevel`.
 *
 * Number ranges are sized so (max - min) / roundTo gives comfortably more
 * distinct rounded values than `gridSize`, so the generator always has
 * enough room to pick unique numbers without collisions.
 */
const TIERS: Record<DifficultyTier, DifficultyConfig> = {
  easy: {
    tier: 'easy',
    gridSize: 9, // 3x3
    pickCount: 4,
    numberRange: [50, 950], // 19 possible rounded values
    roundTo: 50,
    nearMissCount: 0,
  },
  mid: {
    tier: 'mid',
    gridSize: 9, // keep 3x3 through mid tier; 4x4 is a stretch goal post-MVP
    pickCount: 4,
    numberRange: [5, 650], // 130 possible rounded values
    roundTo: 5,
    nearMissCount: 1,
  },
  hard: {
    tier: 'hard',
    gridSize: 9,
    pickCount: 4,
    numberRange: [10, 800], // 791 possible rounded values
    roundTo: 1,
    nearMissCount: 2,
  },
  // Same "round → less round" idea as the tiers above, pushed one step
  // further: numbers can now land on a half-step (7.5, 22.0, 40.5…)
  // instead of only whole numbers. roundTo:0.5 stays exact in floating
  // point (0.5 is a clean power-of-two fraction), so sums never drift the
  // way e.g. 0.1-based steps would. Kept to the same nearMissCount as
  // hard rather than stacking more near-misses on top — the decimals
  // themselves are the added difficulty here, not a denser trap grid.
  expert: {
    tier: 'expert',
    gridSize: 9,
    pickCount: 4,
    numberRange: [0.5, 50], // 99 possible rounded values
    roundTo: 0.5,
    nearMissCount: 2,
  },
};

export function tierForLevel(level: number): DifficultyTier {
  if (level <= 10) return 'easy';
  if (level <= 35) return 'mid';
  if (level <= 50) return 'hard';
  return 'expert';
}

export function configForLevel(level: number): DifficultyConfig {
  return TIERS[tierForLevel(level)];
}
