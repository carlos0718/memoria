import { describe, expect, it } from "vitest";
import { createRng, type RngState } from "../game/rng";
import { forget, observe } from "./memory";

function rememberRate(p: number, trials = 5000): number {
  let rng: RngState = createRng(11);
  let hits = 0;
  for (let i = 0; i < trials; i++) {
    let mem;
    [mem, rng] = observe({}, 0, 1, p, rng);
    if (mem[0] === 1) hits++;
  }
  return hits / trials;
}

describe("AI memory", () => {
  it("remembers with roughly the level's probability", () => {
    for (const p of [0.2, 0.4, 0.6, 0.8, 0.95]) {
      expect(Math.abs(rememberRate(p) - p)).toBeLessThan(0.03);
    }
  });

  it("keeps what it already remembers without spending randomness", () => {
    const rng = createRng(1);
    const [mem, next] = observe({ 3: 7 }, 3, 7, 0, rng);
    expect(mem).toEqual({ 3: 7 });
    expect(next).toBe(rng);
  });

  it("forgets matched positions", () => {
    expect(forget({ 1: 5, 2: 5, 3: 9 }, [1, 2])).toEqual({ 3: 9 });
  });
});
