import type { RngState } from "./rng";

export type Player = "human" | "ai";

export type Level = 1 | 2 | 3 | 4 | 5;

export type Phase =
  | "welcome"
  | "dice"
  | "playerTurn"
  | "aiTurn"
  | "revealMismatch"
  | "levelEnd"
  | "gameOver";

export interface Card {
  position: number;
  characterId: number;
  state: "down" | "up" | "matched";
  matchedBy?: Player;
}

export interface GameState {
  version: 1;
  phase: Phase;
  name: string;
  level: Level;
  cards: Card[];
  /** Positions face up this turn (0–2). */
  flipped: number[];
  /** characterIds collected this level. */
  pairs: Record<Player, number[]>;
  levelWins: Record<Player, number>;
  lastLevelResult?: Player | "tie";
  /** Every throw this level; starter is set once a throw isn't a tie. */
  dice?: { rolls: Array<Record<Player, number>>; starter?: Player };
  turn: Player;
  /** position → characterId the AI remembers. */
  aiMemory: Record<number, number>;
  rng: RngState;
}
