import type { Level } from "./types";

export interface LevelConfig {
  cards: number;
  pairs: number;
  /** How long a missed pair stays visible. */
  revealMs: number;
  /** Probability the AI remembers a card it sees (spec.md > Levels). */
  aiRemember: number;
  desktopCols: number;
  phoneCols: number;
}

export const LEVELS: Record<Level, LevelConfig> = {
  1: { cards: 12, pairs: 6, revealMs: 5000, aiRemember: 0.2, desktopCols: 4, phoneCols: 4 },
  2: { cards: 16, pairs: 8, revealMs: 4500, aiRemember: 0.4, desktopCols: 4, phoneCols: 4 },
  3: { cards: 20, pairs: 10, revealMs: 4000, aiRemember: 0.6, desktopCols: 5, phoneCols: 4 },
  4: { cards: 24, pairs: 12, revealMs: 3500, aiRemember: 0.8, desktopCols: 6, phoneCols: 4 },
  5: { cards: 28, pairs: 14, revealMs: 3000, aiRemember: 0.95, desktopCols: 7, phoneCols: 4 },
};

export const LAST_LEVEL: Level = 5;
