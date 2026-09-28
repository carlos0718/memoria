import { describe, expect, it } from "vitest";
import { flip, hideMismatch, newGame } from "./engine";
import type { GameState } from "./types";

const POOL = [10, 20, 30, 40, 50, 60, 70];

function positionsOf(state: GameState, characterId: number): number[] {
  return state.cards.filter((c) => c.characterId === characterId).map((c) => c.position);
}

function mismatchPair(state: GameState): [number, number] {
  const first = state.cards[0]!;
  const other = state.cards.find((c) => c.characterId !== first.characterId)!;
  return [first.position, other.position];
}

describe("engine", () => {
  it("starts level 1 with 12 face-down cards on the player's turn", () => {
    const s = newGame("Ana", 1, POOL);
    expect(s.cards).toHaveLength(12);
    expect(s.phase).toBe("playerTurn");
    expect(s.cards.every((c) => c.state === "down")).toBe(true);
  });

  it("a match goes to the finder's pile and they keep playing", () => {
    const s0 = newGame("Ana", 1, POOL);
    const id = s0.cards[0]!.characterId;
    const [p, q] = positionsOf(s0, id);
    const s = flip(flip(s0, p!, "human"), q!, "human");
    expect(s.pairs.human).toEqual([id]);
    expect(s.cards[p!]!.state).toBe("matched");
    expect(s.cards[p!]!.matchedBy).toBe("human");
    expect(s.flipped).toEqual([]);
    expect(s.phase).toBe("playerTurn");
  });

  it("a miss enters revealMismatch, then flips back down", () => {
    const s0 = newGame("Ana", 1, POOL);
    const [p, q] = mismatchPair(s0);
    const s1 = flip(flip(s0, p, "human"), q, "human");
    expect(s1.phase).toBe("revealMismatch");
    expect(s1.cards[p]!.state).toBe("up");
    const s2 = hideMismatch(s1);
    expect(s2.cards[p]!.state).toBe("down");
    expect(s2.cards[q]!.state).toBe("down");
    expect(s2.flipped).toEqual([]);
  });

  it("ignores flips during revealMismatch, on flipped cards, and from the wrong player", () => {
    const s0 = newGame("Ana", 1, POOL);
    const [p, q] = mismatchPair(s0);
    const s1 = flip(s0, p, "human");
    expect(flip(s1, p, "human")).toBe(s1);
    expect(flip(s0, p, "ai")).toBe(s0);
    const s2 = flip(s1, q, "human");
    const third = s2.cards.find((c) => c.state === "down")!.position;
    expect(flip(s2, third, "human")).toBe(s2);
  });

  it("finding every pair ends the level", () => {
    let s = newGame("Ana", 3, POOL);
    for (const id of new Set(s.cards.map((c) => c.characterId))) {
      const [p, q] = positionsOf(s, id);
      s = flip(flip(s, p!, "human"), q!, "human");
    }
    expect(s.phase).toBe("levelEnd");
    expect(s.pairs.human).toHaveLength(6);
  });
});
