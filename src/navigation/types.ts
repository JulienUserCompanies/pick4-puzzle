import { Puzzle } from '../engine/types';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding1: undefined;
  Onboarding2: undefined;
  Home: undefined;
  Levels: undefined;
  Daily: undefined;
  Timed: undefined;
  TimedResult: { solved: number; isNewBest: boolean };
  Leaderboard: undefined;
  Statistics: undefined;
  Profile: undefined;
  /** `dailyPuzzle` + `daily: true` together mean "play this exact puzzle, not a generated level". */
  Game: { level: number; daily?: boolean; dailyPuzzle?: Puzzle };
  Win: { level: number; stars: number };
  Settings: undefined;
  Auth: undefined;
  Account: undefined;
};
