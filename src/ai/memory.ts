// The kernel: the AI sees every flipped card but only remembers it with the
// level's probability (spec.md > AI Memory — the Kernel).
import { nextFloat, type RngState } from "../game/rng";

export type AiMemory = Record<number, number>;

/** A card was flipped: maybe remember position → characterId. */
export function observe(
  memory: AiMemory,
  position: number,
  characterId: number,
  rememberProbability: number,
  rng: RngState,
): [AiMemory, RngState] {
  if (memory[position] === characterId) return [memory, rng];
  const [roll, next] = nextFloat(rng);
  if (roll >= rememberProbability) return [memory, next];
  return [{ ...memory, [position]: characterId }, next];
}

/** Matched cards leave the board, so they leave the memory too. */
export function forget(memory: AiMemory, positions: readonly number[]): AiMemory {
  const out = { ...memory };
  for (const p of positions) delete out[p];
  return out;
}
