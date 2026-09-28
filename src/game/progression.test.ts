import { describe, expect, it } from "vitest";
import { buildView } from "../ai/aiPlayer";
import { localPick } from "../ai/localPolicy";
import { POOL_IDS } from "../services/characters";
import { flip, gameWinner, hideMismatch, newGame, nextLevel, restart, rollDice, setName } from "./engine";
import { LEVELS } from "./levels";
import { createRng, nextFloat, type RngState } from "./rng";
import type { GameState, Player } from "./types";

function seededRandom(seed: number): () => number {
  let r: RngState = createRng(seed);
  return () => {
    let v: number;
    [v, r] = nextFloat(r);
    return v;
  };
}

/** Plays the current level to its end with the rules player on both sides. */
function playLevel(s0: GameState, random: () => number): GameState {
  let s = s0;
  while (s.phase === "dice") s = rollDice(s);
  for (let guard = 0; guard < 10_000 && s.phase !== "levelEnd"; guard++) {
    if (s.phase === "revealMismatch") s = hideMismatch(s);
    else s = flip(s, localPick(buildView(s), random), s.turn);
  }
  return s;
}

/** A named game at level 1 with the given level score. */
function named(levelWins = { human: 0, ai: 0 }): GameState {
  const s = setName(newGame(1, POOL_IDS), "Ana");
  return { ...s, levelWins };
}

function finishLevel(s: GameState, winner: Player | "even"): GameState {
  // Match pairs in order, alternating so the requested player ends ahead (or even).
  let st: GameState = { ...s, phase: "playerTurn", turn: "human" };
  const ids = [...new Set(st.cards.map((c) => c.characterId))];
  ids.forEach((id, i) => {
    const by: Player = winner === "even" ? (i % 2 === 0 ? "human" : "ai") : i === 0 ? other(winner) : winner;
    st = { ...st, turn: by, phase: by === "human" ? "playerTurn" : "aiTurn" };
    const [p, q] = st.cards.filter((c) => c.characterId === id).map((c) => c.position);
    st = flip(flip(st, p!, by), q!, by);
  });
  return st;
}

const other = (p: Player): Player => (p === "human" ? "ai" : "human");

describe("level scoring", () => {
  it("more pairs wins the level and scores 1", () => {
    const s = finishLevel(named(), "human");
    expect(s.phase).toBe("levelEnd");
    expect(s.lastLevelResult).toBe("human");
    expect(s.levelWins).toEqual({ human: 1, ai: 0 });
    const a = finishLevel(named(), "ai");
    expect(a.levelWins).toEqual({ human: 0, ai: 1 });
  });

  it("tied pairs score for nobody", () => {
    const s = finishLevel(named({ human: 1, ai: 1 }), "even");
    expect(s.pairs.human.length).toBe(s.pairs.ai.length);
    expect(s.lastLevelResult).toBe("tie");
    expect(s.levelWins).toEqual({ human: 1, ai: 1 });
  });
});

describe("levels and end of game", () => {
  it("each level is played once, with the right card count, until the game ends", () => {
    const random = seededRandom(99);
    let s = setName(newGame(5, POOL_IDS), "Ana");
    const seen: number[] = [];
    for (let level = 1; level <= 5; level++) {
      expect(s.level).toBe(level);
      expect(s.phase).toBe("dice");
      expect(s.cards).toHaveLength(LEVELS[s.level].cards);
      expect(s.dice).toBeUndefined();
      seen.push(s.cards.length);
      s = playLevel(s, random);
      expect(s.phase).toBe("levelEnd");
      s = nextLevel(s, POOL_IDS);
    }
    expect(seen).toEqual([12, 16, 20, 24, 28]);
    expect(s.phase).toBe("gameOver");
    const { human, ai } = s.levelWins;
    expect(human + ai).toBeLessThanOrEqual(5);
    expect(gameWinner(s)).toBe(human > ai ? "human" : ai > human ? "ai" : "tie");
  });

  it("a new level resets piles and AI memory but keeps the level score", () => {
    const ended = finishLevel(named(), "human");
    const next = nextLevel(ended, POOL_IDS);
    expect(next.level).toBe(2);
    expect(next.pairs).toEqual({ human: [], ai: [] });
    expect(next.aiMemory).toEqual({});
    expect(next.levelWins).toEqual({ human: 1, ai: 0 });
  });

  it("nextLevel only works from levelEnd", () => {
    const s = setName(newGame(1, POOL_IDS), "Ana");
    expect(nextLevel(s, POOL_IDS)).toBe(s);
  });

  it("game winner follows level wins", () => {
    const s = setName(newGame(1, POOL_IDS), "Ana");
    expect(gameWinner({ ...s, levelWins: { human: 3, ai: 1 } })).toBe("human");
    expect(gameWinner({ ...s, levelWins: { human: 1, ai: 2 } })).toBe("ai");
    expect(gameWinner({ ...s, levelWins: { human: 2, ai: 2 } })).toBe("tie");
  });
});

describe("restart", () => {
  it("goes back to level 1 at 0–0 with the same name and new characters", () => {
    const over: GameState = { ...setName(newGame(1, POOL_IDS), "Ana"), level: 5, phase: "gameOver", levelWins: { human: 3, ai: 2 } };
    const s = restart(over, 2, POOL_IDS);
    expect(s.level).toBe(1);
    expect(s.phase).toBe("dice");
    expect(s.name).toBe("Ana");
    expect(s.levelWins).toEqual({ human: 0, ai: 0 });
    expect(s.cards).toHaveLength(12);
    const ids = (st: GameState) => [...new Set(st.cards.map((c) => c.characterId))].sort();
    expect(ids(restart(over, 3, POOL_IDS))).not.toEqual(ids(restart(over, 4, POOL_IDS)));
    expect(ids(restart(over, 3, POOL_IDS))).toEqual(ids(restart(over, 3, POOL_IDS)));
  });
});
