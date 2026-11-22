import { DifficultyConfig, DifficultyTier } from './types';

/** Total levels in Classic mode, and how many make up one chapter (see ChapterLevelsScreen/LevelsScreen). */
export const TOTAL_LEVELS = 1000;
export const CHAPTER_SIZE = 20;

/**
 * Difficulty across 1000 levels, in 4 named bands (same roundness idea as
 * before — round numbers, then less round, then whole numbers, then
 * decimals) — but each band is no longer a flat plateau. Within a band,
 * `numberRange` and `nearMissCount` ramp up gradually from the band's own
 * start to its own end, so e.g. level 300 (deep in "mid") is noticeably
 * harder than level 160 (just into "mid"), not identical to it. Grid size
 * and pick count stay fixed at 3x3 / 4 for the whole game — per the design
 * call, difficulty here comes only from number range/roundness/near-misses.
 */
interface Band {
  tier: DifficultyTier;
  startLevel: number;
  endLevel: number;
  roundTo: number;
  /** Number range at the very start of the band, and at its very end — interpolated between. */
  rangeStart: [number, number];
  rangeEnd: [number, number];
  /** nearMissCount steps (not smoothly interpolated — it's an integer count of grid slots) at a few checkpoints through the band, as [progressFraction 0..1, count][]. */
  nearMissSteps: [number, number][];
}

const BANDS: Band[] = [
  {
    tier: 'easy',
    startLevel: 1,
    endLevel: 150,
    roundTo: 50,
    // Floor here isn't arbitrary: with 4 distinct multiples-of-50 starting
    // at min=50, the 4 smallest possible picks (50+100+150+200) already
    // sum to 500 — so max needs enough headroom above that for a target
    // range to exist at all (max*0.75 must clear ~500, see generatePuzzle's
    // target-range math). 500 was too tight and silently fell back to the
    // same fixed puzzle for the first ~55 levels; 800 clears it safely.
    rangeStart: [50, 800],
    rangeEnd: [50, 950],
    nearMissSteps: [[0, 0]], // true-beginner stretch: no near-miss traps anywhere in this band
  },
  {
    tier: 'mid',
    startLevel: 151,
    endLevel: 550,
    roundTo: 5,
    rangeStart: [5, 300],
    rangeEnd: [5, 650],
    nearMissSteps: [
      [0, 0], // eases in right after a 0-near-miss band, rather than jumping straight to 1
      [1 / 3, 1],
    ],
  },
  {
    tier: 'hard',
    startLevel: 551,
    endLevel: 850,
    roundTo: 1,
    rangeStart: [10, 300],
    rangeEnd: [10, 800],
    nearMissSteps: [
      [0, 1],
      [0.5, 2],
    ],
  },
  {
    tier: 'expert',
    startLevel: 851,
    endLevel: TOTAL_LEVELS,
    roundTo: 0.5,
    rangeStart: [0.5, 20],
    rangeEnd: [0.5, 50],
    nearMissSteps: [[0, 2]], // decimals themselves are the difficulty here, not a denser trap grid
  },
];

function bandForLevel(level: number): Band {
  for (const band of BANDS) {
    if (level <= band.endLevel) return band;
  }
  return BANDS[BANDS.length - 1];
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** How far `level` is through its band, as 0 (first level) to 1 (last level). */
function bandProgress(level: number, band: Band): number {
  if (band.endLevel === band.startLevel) return 1;
  return (level - band.startLevel) / (band.endLevel - band.startLevel);
}

function nearMissForProgress(band: Band, t: number): number {
  let count = band.nearMissSteps[0][1];
  for (const [stepT, stepCount] of band.nearMissSteps) {
    if (t >= stepT) count = stepCount;
  }
  return count;
}

export function tierForLevel(level: number): DifficultyTier {
  return bandForLevel(level).tier;
}

export function configForLevel(level: number): DifficultyConfig {
  const band = bandForLevel(level);
  const t = bandProgress(level, band);

  const min = lerp(band.rangeStart[0], band.rangeEnd[0], t);
  const maxRaw = lerp(band.rangeStart[1], band.rangeEnd[1], t);
  // Keep the max a clean multiple of roundTo, matching every value the
  // generator itself produces, so the distractor pool's step-through
  // (`fullValuePool`) always lines up evenly.
  const max = Math.round(maxRaw / band.roundTo) * band.roundTo;

  return {
    tier: band.tier,
    gridSize: 9, // 3x3 for the whole game, per the design call
    pickCount: 4,
    numberRange: [min, max],
    roundTo: band.roundTo,
    nearMissCount: nearMissForProgress(band, t),
  };
}
