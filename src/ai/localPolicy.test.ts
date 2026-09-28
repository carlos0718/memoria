import { describe, expect, it } from "vitest";
import { localPick } from "./localPolicy";

const first = () => 0;

describe("local rules player", () => {
  it("second pick: takes the remembered partner of the first card", () => {
    const pick = localPick(
      { faceDown: [1, 2, 3, 4], remembered: { 3: 9, 4: 8 }, firstPick: { position: 0, characterId: 9 } },
      first,
    );
    expect(pick).toBe(3);
  });

  it("first pick: goes for a fully remembered pair", () => {
    const pick = localPick({ faceDown: [0, 1, 2, 3], remembered: { 1: 5, 3: 5, 0: 6 }, firstPick: null }, first);
    expect([1, 3]).toContain(pick);
  });

  it("otherwise explores a card it doesn't remember", () => {
    for (let i = 0; i < 20; i++) {
      const pick = localPick(
        { faceDown: [0, 1, 2, 3], remembered: { 0: 5, 1: 6 }, firstPick: null },
        () => i / 20,
      );
      expect([2, 3]).toContain(pick);
    }
  });

  it("never returns the first pick or a card that isn't face down", () => {
    const pick = localPick(
      { faceDown: [4, 5], remembered: {}, firstPick: { position: 0, characterId: 1 } },
      () => 0.99,
    );
    expect([4, 5]).toContain(pick);
  });
});
