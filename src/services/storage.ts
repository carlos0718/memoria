// Saves the whole game in localStorage after every change (spec.md > Storage).
// Anything missing, corrupt, or from another version means a fresh start.
import { LEVELS } from "../game/levels";
import type { GameState, Phase } from "../game/types";

export const SAVE_KEY = "memoria:save:v1";

export type KeyValueStore = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function browserStore(): KeyValueStore | null {
  try {
    return window.localStorage;
  } catch {
    return null; // Private mode or blocked storage.
  }
}

export function saveGame(state: GameState, store: KeyValueStore | null = browserStore()): void {
  try {
    store?.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // Quota or blocked storage: the game keeps working, it just won't resume.
  }
}

export function loadGame(store: KeyValueStore | null = browserStore()): GameState | null {
  try {
    const raw = store?.getItem(SAVE_KEY);
    if (!raw) return null;
    const data: unknown = JSON.parse(raw);
    return isGameState(data) ? data : null;
  } catch {
    return null;
  }
}

export function clearSave(store: KeyValueStore | null = browserStore()): void {
  try {
    store?.removeItem(SAVE_KEY);
  } catch {
    // Nothing to do.
  }
}

const PHASES: readonly Phase[] = ["welcome", "dice", "playerTurn", "aiTurn", "revealMismatch", "levelEnd", "gameOver"];
const isPlayer = (x: unknown) => x === "human" || x === "ai";
const isInt = (x: unknown): x is number => Number.isInteger(x);
const isIntArray = (x: unknown) => Array.isArray(x) && x.every(isInt);
const isRecord = (x: unknown): x is Record<string, unknown> => typeof x === "object" && x !== null && !Array.isArray(x);

/** Shape check of a saved game, strict enough that the engine can trust it. */
export function isGameState(x: unknown): x is GameState {
  if (!isRecord(x) || x.version !== 1) return false;
  if (!PHASES.includes(x.phase as Phase) || typeof x.name !== "string") return false;
  if (!isInt(x.level) || x.level < 1 || x.level > 5) return false;
  const level = LEVELS[x.level as GameState["level"]];

  const cards = x.cards;
  if (!Array.isArray(cards) || cards.length !== level.cards) return false;
  const cardsOk = cards.every(
    (c, i) =>
      isRecord(c) &&
      c.position === i &&
      isInt(c.characterId) &&
      (c.state === "down" || c.state === "up" || c.state === "matched") &&
      (c.matchedBy === undefined || isPlayer(c.matchedBy)),
  );
  if (!cardsOk) return false;

  if (!isIntArray(x.flipped) || (x.flipped as number[]).length > 2) return false;
  if (!isRecord(x.pairs) || !isIntArray(x.pairs.human) || !isIntArray(x.pairs.ai)) return false;
  if (!isRecord(x.levelWins) || !isInt(x.levelWins.human) || !isInt(x.levelWins.ai)) return false;
  if (!isPlayer(x.turn)) return false;
  if (x.lastLevelResult !== undefined && !isPlayer(x.lastLevelResult) && x.lastLevelResult !== "tie") return false;
  if (x.dice !== undefined) {
    if (!isRecord(x.dice) || !Array.isArray(x.dice.rolls)) return false;
    if (!x.dice.rolls.every((r) => isRecord(r) && isInt(r.human) && isInt(r.ai))) return false;
    if (x.dice.starter !== undefined && !isPlayer(x.dice.starter)) return false;
  }
  if (!isRecord(x.aiMemory) || !Object.values(x.aiMemory).every(isInt)) return false;
  if (!isRecord(x.rng) || !isInt(x.rng.seed) || !isInt(x.rng.state)) return false;
  return true;
}
