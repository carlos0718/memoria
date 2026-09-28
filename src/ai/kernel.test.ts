// The kernel, measured: simulate games per level and compare how often the AI
// takes a pair whose two cards have both been seen (spec.md > Verification).
import { describe, expect, it } from "vitest";
import { flip, hideMismatch, newGame, setName, startLevel } from "../game/engine";
import { createRng, nextFloat, type RngState } from "../game/rng";
import type { GameState, Level } from "../game/types";
import { POOL_IDS } from "../services/characters";
import { buildView } from "./aiPlayer";
import { localPick } from "./localPolicy";

const GAMES = 500;

function seededRandom(seed: number): () => number {
  let r: RngState = createRng(seed);
  return () => {
    let v: number;
    [v, r] = nextFloat(r);
    return v;
  };
}

interface Stats {
  opportunities: number;
  taken: number;
}

function simulate(level: Level, seed: number, stats: Stats): void {
  const random = seededRandom(seed * 7919);
  const base = setName(newGame(seed, POOL_IDS), "Sim");
  let s: GameState = startLevel(base, level, POOL_IDS);
  s = { ...s, phase: "aiTurn", turn: "ai" };
  const seen = new Set<number>();
  const knownPair = (st: GameState) => {
    const byId = new Map<number, number>();
    for (const c of st.cards) {
      if (c.state === "down" && seen.has(c.position)) byId.set(c.characterId, (byId.get(c.characterId) ?? 0) + 1);
    }
    return [...byId.values()].some((n) => n === 2);
  };

  for (let guard = 0; guard < 10_000 && s.phase !== "levelEnd"; guard++) {
    if (s.phase === "revealMismatch") {
      s = hideMismatch(s);
      continue;
    }
    const by = s.turn;
    let position: number;
    if (by === "ai") {
      if (s.flipped.length === 0 && knownPair(s)) {
        stats.opportunities++;
        const pairsBefore = s.pairs.ai.length;
        const p1 = localPick(buildView(s), random);
        seen.add(p1);
        s = flip(s, p1, "ai");
        const p2 = localPick(buildView(s), random);
        seen.add(p2);
        s = flip(s, p2, "ai");
        if (s.pairs.ai.length > pairsBefore) stats.taken++;
        continue;
      }
      position = localPick(buildView(s), random);
    } else {
      // A player with no memory: random face-down card.
      const down = s.cards.filter((c) => c.state === "down").map((c) => c.position);
      position = down[Math.floor(random() * down.length)]!;
    }
    seen.add(position);
    s = flip(s, position, by);
  }
  expect(s.phase).toBe("levelEnd");
}

function rate(level: Level): number {
  const stats: Stats = { opportunities: 0, taken: 0 };
  for (let g = 1; g <= GAMES; g++) simulate(level, g, stats);
  return stats.taken / stats.opportunities;
}

describe("kernel: AI memory sharpens level by level", () => {
  const rates = ([1, 2, 3, 4, 5] as Level[]).map(rate);
  const [l1, , , , l5] = rates as [number, number, number, number, number];

  it("reports the take rate per level", () => {
    console.log("known-pair take rate by level:", rates.map((r) => r.toFixed(2)).join(" → "));
    for (let i = 1; i < rates.length; i++) expect(rates[i]!).toBeGreaterThan(rates[i - 1]!);
  });

  it("level 1 misses known pairs at least 3x as often as level 5", () => {
    expect(1 - l1).toBeGreaterThanOrEqual(3 * (1 - l5));
  });

  it("level 5 takes known pairs at least 90% of the time", () => {
    expect(l5).toBeGreaterThanOrEqual(0.9);
  });
});
