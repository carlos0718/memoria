import { nextInt, type RngState } from "./rng";
import type { Player } from "./types";

export type DiceThrow = Record<Player, number>;

/** One throw: both roll 1–6. A tie means the player throws again (the engine stays in "dice"). */
export function throwDice(rng: RngState): { roll: DiceThrow; rng: RngState } {
  let human: number, ai: number;
  let r = rng;
  [human, r] = nextInt(r, 6);
  [ai, r] = nextInt(r, 6);
  return { roll: { human: human + 1, ai: ai + 1 }, rng: r };
}
