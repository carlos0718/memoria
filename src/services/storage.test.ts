import { describe, expect, it } from "vitest";
import { flip, newGame, resume, rollDice, setName } from "../game/engine";
import type { GameState } from "../game/types";
import { POOL_IDS } from "./characters";
import { loadGame, SAVE_KEY, saveGame, type KeyValueStore } from "./storage";

function memoryStore(): KeyValueStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

const throwingStore: KeyValueStore = {
  getItem: () => {
    throw new Error("blocked");
  },
  setItem: () => {
    throw new Error("quota");
  },
  removeItem: () => {
    throw new Error("blocked");
  },
};

/** A game mid-level: dice rolled, a pair matched, one card face up. */
function midGame(): GameState {
  let s = rollDice(setName(newGame(21, POOL_IDS), "Ana"));
  while (s.phase === "dice") s = rollDice(s);
  s = { ...s, turn: "human", phase: "playerTurn" };
  const id = s.cards[0]!.characterId;
  const [p, q] = s.cards.filter((c) => c.characterId === id).map((c) => c.position);
  s = flip(flip(s, p!, "human"), q!, "human");
  const down = s.cards.find((c) => c.state === "down")!.position;
  return flip(s, down, "human");
}

describe("storage", () => {
  it("save → load gives back the exact board", () => {
    const store = memoryStore();
    const s = midGame();
    saveGame(s, store);
    expect(loadGame(store)).toEqual(s);
  });

  it("no save, corrupt JSON, wrong version, or a bad shape → fresh start (null)", () => {
    const store = memoryStore();
    expect(loadGame(store)).toBeNull();
    store.setItem(SAVE_KEY, "{not json");
    expect(loadGame(store)).toBeNull();
    store.setItem(SAVE_KEY, JSON.stringify({ ...midGame(), version: 0 }));
    expect(loadGame(store)).toBeNull();
    store.setItem(SAVE_KEY, JSON.stringify({ ...midGame(), cards: [] }));
    expect(loadGame(store)).toBeNull();
    store.setItem(SAVE_KEY, JSON.stringify({ ...midGame(), turn: "nobody" }));
    expect(loadGame(store)).toBeNull();
  });

  it("blocked or full storage never crashes", () => {
    expect(() => saveGame(midGame(), throwingStore)).not.toThrow();
    expect(loadGame(throwingStore)).toBeNull();
    expect(loadGame(null)).toBeNull();
  });
});

describe("resume", () => {
  it("a half-done turn: the face-up card flips back, same player, pairs and memory kept", () => {
    const s = midGame();
    const r = resume(s);
    expect(r.flipped).toEqual([]);
    expect(r.cards.filter((c) => c.state === "up")).toHaveLength(0);
    expect(r.cards.filter((c) => c.state === "matched")).toHaveLength(2);
    expect(r.turn).toBe(s.turn);
    expect(r.phase).toBe("playerTurn");
    expect(r.pairs).toEqual(s.pairs);
    expect(r.aiMemory).toEqual(s.aiMemory);
    expect(r.dice).toEqual(s.dice);
  });

  it("a pending miss resumes as the next player's turn", () => {
    let s = midGame();
    const first = s.cards[s.flipped[0]!]!;
    const other = s.cards.find((c) => c.state === "down" && c.characterId !== first.characterId)!;
    s = flip(s, other.position, "human");
    expect(s.phase).toBe("revealMismatch");
    const r = resume(s);
    expect(r.phase).toBe("aiTurn");
    expect(r.turn).toBe("ai");
    expect(r.cards.filter((c) => c.state === "up")).toHaveLength(0);
  });

  it("a clean state comes back untouched", () => {
    const s = setName(newGame(1, POOL_IDS), "Ana");
    expect(resume(s)).toBe(s);
  });
});
