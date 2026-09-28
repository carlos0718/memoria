// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { startLevel, newGame } from "../game/engine";
import { LEVELS } from "../game/levels";
import type { Level } from "../game/types";
import { POOL_IDS } from "../services/characters";
import { mountBoard } from "./board";

describe("board grid", () => {
  it.each([1, 2, 3, 4, 5] as Level[])("level %i sets desktop and phone columns and renders every card", (level) => {
    const state = startLevel(newGame(level, POOL_IDS), level, POOL_IDS);
    const el = document.createElement("div");
    mountBoard(el, state, { poolIds: POOL_IDS, pool: new Map(), images: new Map(), onFlip: () => {} });
    const cfg = LEVELS[level];
    expect(el.children).toHaveLength(cfg.cards);
    expect(el.style.getPropertyValue("--cols")).toBe(String(cfg.desktopCols));
    expect(el.style.getPropertyValue("--cols-phone")).toBe("4");
    expect(el.style.getPropertyValue("--rows")).toBe(String(Math.ceil(cfg.cards / cfg.desktopCols)));
    expect(cfg.cards % cfg.phoneCols).toBe(0); // phone grids are full rectangles (4×3 … 4×7)
  });
});
