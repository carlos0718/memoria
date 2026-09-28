import { describe, expect, it } from "vitest";
import { POOL_IDS } from "../services/characters";
import { buildDeck } from "./deck";
import { LEVELS } from "./levels";
import { createRng } from "./rng";
import type { Level } from "./types";

describe("buildDeck", () => {
  it.each([1, 2, 3, 4, 5] as Level[])("level %i has the right cards, each character exactly twice", (level) => {
    const { cards } = buildDeck(POOL_IDS, LEVELS[level].pairs, createRng(level));
    expect(cards).toHaveLength(LEVELS[level].cards);
    const counts = new Map<number, number>();
    for (const c of cards) counts.set(c.characterId, (counts.get(c.characterId) ?? 0) + 1);
    expect(counts.size).toBe(LEVELS[level].pairs);
    for (const n of counts.values()) expect(n).toBe(2);
    expect(cards.every((c, i) => c.position === i && c.state === "down")).toBe(true);
  });

  it("the same seed gives the same deck; different seeds vary the characters", () => {
    const ids = (seed: number) =>
      new Set(buildDeck(POOL_IDS, LEVELS[1].pairs, createRng(seed)).cards.map((c) => c.characterId));
    expect(buildDeck(POOL_IDS, 6, createRng(9)).cards).toEqual(buildDeck(POOL_IDS, 6, createRng(9)).cards);
    expect([...ids(1)].sort()).not.toEqual([...ids(2)].sort());
  });

  it("rejects a level bigger than the pool", () => {
    expect(() => buildDeck([1, 2], 3, createRng(1))).toThrow();
  });
});
