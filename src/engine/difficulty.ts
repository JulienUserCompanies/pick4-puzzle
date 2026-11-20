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
};

export function tierForLevel(level: number): DifficultyTier {
  if (level <= 10) return 'easy';
  if (level <= 40) return 'mid';
  return 'hard';
}

export function configForLevel(level: number): DifficultyConfig {
  return TIERS[tierForLevel(level)];
}
