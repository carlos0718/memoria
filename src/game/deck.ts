import { shuffle, type RngState } from "./rng";
import type { Card } from "./types";

/**
 * Draws `pairs` distinct characters at random from the pool, puts each one in
 * twice, and shuffles the result into face-down cards.
 */
export function buildDeck(
  poolIds: readonly number[],
  pairs: number,
  rng: RngState,
): { cards: Card[]; rng: RngState } {
  if (pairs > poolIds.length) {
    throw new Error(`Pool has ${poolIds.length} characters, level needs ${pairs}`);
  }
  let r = rng;
  let drawn: number[];
  [drawn, r] = shuffle(poolIds, r);
  const chosen = drawn.slice(0, pairs);
  let ids: number[];
  [ids, r] = shuffle([...chosen, ...chosen], r);
  const cards = ids.map((characterId, position): Card => ({
    position,
    characterId,
    state: "down",
  }));
  return { cards, rng: r };
}
