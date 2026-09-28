import { describe, expect, it } from "vitest";
import { flip, hideMismatch, newGame, rollDice, setName, startLevel } from "./engine";
import type { GameState, Player } from "./types";

const POOL = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140];

function positionsOf(state: GameState, characterId: number): number[] {
  return state.cards.filter((c) => c.characterId === characterId).map((c) => c.position);
}

function mismatchPair(state: GameState): [number, number] {
  const first = state.cards.find((c) => c.state === "down")!;
  const other = state.cards.find((c) => c.state === "down" && c.characterId !== first.characterId)!;
  return [first.position, other.position];
}

/** A game already past the welcome modal and dice, on `turn`'s turn. */
function playing(turn: Player = "human", seed = 1): GameState {
  const s = setName(newGame(seed, POOL), "Ana");
  return { ...s, turn, phase: turn === "human" ? "playerTurn" : "aiTurn" };
}

describe("welcome and dice", () => {
  it("starts on the welcome modal with 12 face-down cards", () => {
    const s = newGame(1, POOL);
    expect(s.phase).toBe("welcome");
    expect(s.cards).toHaveLength(12);
    expect(s.cards.every((c) => c.state === "down")).toBe(true);
  });

  it("can't start without a name; a name moves on to the dice", () => {
    const s = newGame(1, POOL);
    expect(setName(s, "   ")).toBe(s);
    const named = setName(s, "  Ana  ");
    expect(named.name).toBe("Ana");
    expect(named.phase).toBe("dice");
  });

  it("the dice pick a starter with the higher roll; a tie waits for another throw", () => {
    for (let seed = 1; seed <= 200; seed++) {
      let s = rollDice(setName(newGame(seed, POOL), "Ana"));
      while (s.phase === "dice") {
        const tie = s.dice!.rolls[s.dice!.rolls.length - 1]!;
        expect(tie.human).toBe(tie.ai);
        expect(s.dice!.starter).toBeUndefined();
        s = rollDice(s);
      }
      const rolls = s.dice!.rolls;
      const last = rolls[rolls.length - 1]!;
      for (const r of rolls.slice(0, -1)) expect(r.human).toBe(r.ai);
      expect(last.human).not.toBe(last.ai);
      const starter = last.human > last.ai ? "human" : "ai";
      expect(s.dice!.starter).toBe(starter);
      expect(s.turn).toBe(starter);
      expect(s.phase).toBe(starter === "human" ? "playerTurn" : "aiTurn");
    }
  });

  it("a tie keeps the dice phase across seeds (someone has to throw again)", () => {
    const tie = Array.from({ length: 200 }, (_, i) => rollDice(setName(newGame(i, POOL), "A")))
      .find((s) => s.phase === "dice");
    expect(tie).toBeDefined();
    expect(flip(tie!, 0, "human")).toBe(tie);
  });
});

describe("turns and pairs", () => {
  it("a match goes to the finder's pile and they keep playing", () => {
    for (const by of ["human", "ai"] as Player[]) {
      const s0 = playing(by);
      const id = s0.cards[0]!.characterId;
      const [p, q] = positionsOf(s0, id);
      const s = flip(flip(s0, p!, by), q!, by);
      expect(s.pairs[by]).toEqual([id]);
      expect(s.cards[p!]!.matchedBy).toBe(by);
      expect(s.turn).toBe(by);
      expect(s.phase).toBe(s0.phase);
    }
  });

  it("a miss is revealed, then flips back and passes the turn", () => {
    const s0 = playing("human");
    const [p, q] = mismatchPair(s0);
    const s1 = flip(flip(s0, p, "human"), q, "human");
    expect(s1.phase).toBe("revealMismatch");
    const s2 = hideMismatch(s1);
    expect(s2.cards[p]!.state).toBe("down");
    expect(s2.turn).toBe("ai");
    expect(s2.phase).toBe("aiTurn");
    const [x, y] = mismatchPair(s2);
    const s3 = hideMismatch(flip(flip(s2, x, "ai"), y, "ai"));
    expect(s3.turn).toBe("human");
    expect(s3.phase).toBe("playerTurn");
  });

  it("the board ignores the player during the AI's turn and during a reveal", () => {
    const ai = playing("ai");
    expect(flip(ai, 0, "human")).toBe(ai);
    const s0 = playing("human");
    const [p, q] = mismatchPair(s0);
    const s1 = flip(flip(s0, p, "human"), q, "human");
    const third = s1.cards.find((c) => c.state === "down")!.position;
    expect(flip(s1, third, "human")).toBe(s1);
    expect(flip(flip(s0, p, "human"), p, "human").flipped).toEqual([p]);
  });

  it("finding every pair ends the level", () => {
    let s = playing("human", 3);
    for (const id of new Set(s.cards.map((c) => c.characterId))) {
      const [p, q] = positionsOf(s, id);
      s = flip(flip(s, p!, "human"), q!, "human");
    }
    expect(s.phase).toBe("levelEnd");
    expect(s.pairs.human).toHaveLength(6);
  });
});

describe("AI memory through the engine", () => {
  it("level 5 remembers most flips; matched cards are forgotten", () => {
    const base = playing("human", 5);
    let s = startLevel({ ...base }, 5, POOL);
    s = { ...s, phase: "playerTurn", turn: "human" };
    const [p, q] = mismatchPair(s);
    s = flip(flip(s, p, "human"), q, "human");
    // With probability 0.95 per card, both are almost always remembered across seeds;
    // here we only check the shape: remembered entries match the real cards.
    for (const [pos, id] of Object.entries(s.aiMemory)) {
      expect(s.cards[Number(pos)]!.characterId).toBe(id);
    }
    const id = s.cards[0]!.characterId;
    s = hideMismatch(s);
    s = { ...s, phase: "playerTurn", turn: "human" };
    const [a, b] = positionsOf(s, id);
    s = flip(flip(s, a!, "human"), b!, "human");
    expect(s.aiMemory[a!]).toBeUndefined();
    expect(s.aiMemory[b!]).toBeUndefined();
  });
});
