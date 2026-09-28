import { describe, expect, it } from "vitest";
import { createRng, nextFloat, nextInt, shuffle } from "./rng";

describe("rng", () => {
  it("is reproducible for the same seed", () => {
    let a = createRng(42);
    let b = createRng(42);
    for (let i = 0; i < 100; i++) {
      let x: number, y: number;
      [x, a] = nextFloat(a);
      [y, b] = nextFloat(b);
      expect(x).toBe(y);
    }
  });

  it("differs across seeds", () => {
    const [x] = nextFloat(createRng(1));
    const [y] = nextFloat(createRng(2));
    expect(x).not.toBe(y);
  });

  it("keeps floats in [0,1) and ints in range", () => {
    let r = createRng(7);
    for (let i = 0; i < 1000; i++) {
      let f: number, n: number;
      [f, r] = nextFloat(r);
      [n, r] = nextInt(r, 6);
      expect(f).toBeGreaterThanOrEqual(0);
      expect(f).toBeLessThan(1);
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(6);
    }
  });

  it("shuffle keeps the same items", () => {
    const [out] = shuffle([1, 2, 3, 4, 5], createRng(3));
    expect(out.slice().sort()).toEqual([1, 2, 3, 4, 5]);
  });
});
