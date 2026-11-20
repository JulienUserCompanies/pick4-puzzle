import { DifficultyConfig, Puzzle } from './types';
import { configForLevel } from './difficulty';

function randInt(min: number, max: number, roundTo: number): number {
  const span = Math.floor((max - min) / roundTo);
  const steps = Math.floor(Math.random() * (span + 1));
  return min + steps * roundTo;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** All k-combinations of indices [0, n). Trivial at grid sizes up to 5x5 — C(25,4) = 12,650. */
function combinations(n: number, k: number): number[][] {
  const result: number[][] = [];
  const combo: number[] = [];
  function backtrack(start: number) {
    if (combo.length === k) {
      result.push([...combo]);
      return;
    }
    for (let i = start; i < n; i++) {
      combo.push(i);
      backtrack(i + 1);
      combo.pop();
    }
  }
  backtrack(0);
  return result;
}

/** Counts how many pickCount-sized subsets of `grid` sum exactly to `target`. */
export function countSolutions(grid: number[], target: number, pickCount: number): number[][] {
  const combos = combinations(grid.length, pickCount);
  return combos.filter((indices) => indices.reduce((s, i) => s + grid[i], 0) === target);
}

/** Every value reachable in `numberRange` rounded to `roundTo`, as a plain array. */
function fullValuePool(config: DifficultyConfig): number[] {
  const [min, max] = config.numberRange;
  const pool: number[] = [];
  for (let v = min; v <= max; v += config.roundTo) {
    pool.push(v);
  }
  return pool;
}

/**
 * Picks `pickCount` *unique* numbers in range that sum to `target`, rounded
 * to the tier's step. Returns null if no valid set was found — the caller
 * should pick a different target and try again rather than accept a
 * half-valid (possibly out-of-range or duplicate) result.
 */
function buildSolutionSet(target: number, config: DifficultyConfig): number[] | null {
  const { pickCount, numberRange, roundTo } = config;
  const [min, max] = numberRange;

  for (let attempt = 0; attempt < 200; attempt++) {
    // Wide weight spread (0.05–1.0) so the four shares of the target land at
    // noticeably different sizes — near-equal weights kept rounding several
    // numbers into the same bucket and colliding.
    const weights = Array.from({ length: pickCount }, () => 0.05 + Math.random());
    const weightSum = weights.reduce((a, b) => a + b, 0);
    const raw = weights.map((w) => (w / weightSum) * target);

    const nums = raw.map((v) => Math.max(min, Math.round(v / roundTo) * roundTo));
    const drift = target - nums.reduce((a, b) => a + b, 0);
    nums[nums.length - 1] += drift;

    const allInRange = nums.every((n) => n >= min && n <= max);
    const allRounded = nums.every((n) => n % roundTo === 0);
    const allUnique = new Set(nums).size === nums.length;

    if (allInRange && allRounded && allUnique) {
      return nums;
    }
  }

  return null;
}

/**
 * Fills the remaining grid slots with distractors, sampled without
 * replacement from the full value pool so uniqueness is guaranteed rather
 * than hoped for. `nearMissCount` of them are biased close to an even share
 * of the target, to tempt a wrong-but-close tap; the rest are plain random
 * fill from whatever's left in the pool.
 */
function buildDistractors(
  count: number,
  target: number,
  config: DifficultyConfig,
  taken: Set<number>
): number[] | null {
  const { pickCount, nearMissCount } = config;
  const pool = fullValuePool(config).filter((v) => !taken.has(v));
  if (pool.length < count) return null;

  const evenShare = target / pickCount;
  const byCloseness = [...pool].sort(
    (a, b) => Math.abs(a - evenShare) - Math.abs(b - evenShare)
  );

  const chosen: number[] = [];
  const used = new Set<number>();

  for (let i = 0; i < Math.min(nearMissCount, count); i++) {
    const candidate = byCloseness.find((v) => !used.has(v));
    if (candidate === undefined) break;
    used.add(candidate);
    chosen.push(candidate);
  }

  const remainingPool = shuffle(pool.filter((v) => !used.has(v)));
  for (const v of remainingPool) {
    if (chosen.length >= count) break;
    chosen.push(v);
  }

  return chosen.length === count ? chosen : null;
}

/**
 * Generates a puzzle for the given level, guaranteeing at least one valid
 * combo exists and every number on the grid is unique, then validating the
 * total solution count stays within a sane range for the difficulty tier
 * (reject/retry with a fresh target otherwise).
 */
export function generatePuzzle(level: number): Puzzle {
  const config = configForLevel(level);
  const { gridSize, pickCount, numberRange, roundTo } = config;
  const [min, max] = numberRange;

  // Max solutions allowed before a puzzle is considered "too easy" for its tier.
  const maxSolutions = config.tier === 'easy' ? 8 : config.tier === 'mid' ? 3 : 1;

  for (let attempt = 0; attempt < 100; attempt++) {
    // Both bounds must themselves be clean multiples of roundTo (from zero),
    // same as every number buildSolutionSet produces — otherwise no rounded
    // solution set can ever sum exactly to the target.
    const rawLow = Math.round(min * pickCount * 1.1);
    const rawHigh = Math.round(max * 0.75);
    const targetLow = Math.max(roundTo, Math.ceil(rawLow / roundTo) * roundTo);
    const targetHigh = Math.max(targetLow, Math.floor(rawHigh / roundTo) * roundTo);
    const target = randInt(targetLow, targetHigh, roundTo);

    const solution = buildSolutionSet(target, config);
    if (!solution) continue;

    const taken = new Set(solution);
    const distractors = buildDistractors(gridSize - pickCount, target, config, taken);
    if (!distractors) continue;

    const grid = shuffle([...solution, ...distractors]);
    const solutions = countSolutions(grid, target, pickCount);

    if (solutions.length >= 1 && solutions.length <= maxSolutions) {
      return {
        grid,
        target,
        pickCount,
        solutionIndices: solutions[0],
        tier: config.tier,
      };
    }
  }

  // Fallback: a known-good, hand-checked easy puzzle (matches the format from
  // the original screenshot) so the player is never stuck on a blank screen
  // if generation keeps missing its window.
  const fallbackSolution = [200, 100, 50, 150];
  const fallbackGrid = shuffle([...fallbackSolution, 350, 30, 450, 250, 300]);
  return {
    grid: fallbackGrid,
    target: 500,
    pickCount: 4,
    solutionIndices: fallbackSolution.map((n) => fallbackGrid.indexOf(n)),
    tier: 'easy',
  };
}
