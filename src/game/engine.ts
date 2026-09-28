// Pure game rules: (state, input) → new state. No DOM, no timers, no network.
import { forget, observe } from "../ai/memory";
import { buildDeck } from "./deck";
import { throwDice } from "./dice";
import { LEVELS } from "./levels";
import { createRng, type RngState } from "./rng";
import type { GameState, Level, Player } from "./types";

export const MAX_NAME_LENGTH = 16;

export function other(player: Player): Player {
  return player === "human" ? "ai" : "human";
}

export function turnPhase(turn: Player): GameState["phase"] {
  return turn === "human" ? "playerTurn" : "aiTurn";
}

/** Fresh board for a level: new deck, empty piles and memory, dice not rolled yet. */
export function startLevel(
  base: Omit<GameState, "cards" | "rng"> & { rng: RngState },
  level: Level,
  poolIds: readonly number[],
): GameState {
  const { cards, rng } = buildDeck(poolIds, LEVELS[level].pairs, base.rng);
  return {
    ...base,
    level,
    cards,
    rng,
    phase: "dice",
    flipped: [],
    pairs: { human: [], ai: [] },
    aiMemory: {},
    dice: undefined,
    turn: "human",
  };
}

export function newGame(seed: number, poolIds: readonly number[]): GameState {
  const level: Level = 1;
  const { cards, rng } = buildDeck(poolIds, LEVELS[level].pairs, createRng(seed));
  return {
    version: 1,
    phase: "welcome",
    name: "",
    level,
    cards,
    flipped: [],
    pairs: { human: [], ai: [] },
    levelWins: { human: 0, ai: 0 },
    turn: "human",
    aiMemory: {},
    rng,
  };
}

export function setName(state: GameState, raw: string): GameState {
  const name = raw.trim().slice(0, MAX_NAME_LENGTH);
  if (state.phase !== "welcome" || name === "") return state;
  return { ...state, name, phase: "dice" };
}

/** One throw. A tie stays in "dice" so the player throws again; otherwise the higher roll starts. */
export function rollDice(state: GameState): GameState {
  if (state.phase !== "dice") return state;
  const { roll, rng } = throwDice(state.rng);
  const rolls = [...(state.dice?.rolls ?? []), roll];
  if (roll.human === roll.ai) return { ...state, rng, dice: { rolls } };
  const starter: Player = roll.human > roll.ai ? "human" : "ai";
  return { ...state, rng, dice: { rolls, starter }, turn: starter, phase: turnPhase(starter) };
}

/** Returns the same state object when the flip isn't allowed. */
export function flip(state: GameState, position: number, by: Player): GameState {
  if (state.phase !== turnPhase(by) || state.turn !== by) return state;
  const card = state.cards[position];
  if (!card || card.state !== "down" || state.flipped.length >= 2) return state;

  // The AI sees every flip, its own and the player's.
  const [seenMemory, rng] = observe(
    state.aiMemory,
    position,
    card.characterId,
    LEVELS[state.level].aiRemember,
    state.rng,
  );
  const cards = state.cards.map((c) => (c.position === position ? { ...c, state: "up" as const } : c));
  const flipped = [...state.flipped, position];
  if (flipped.length < 2) return { ...state, cards, flipped, aiMemory: seenMemory, rng };

  const [a, b] = flipped.map((p) => cards[p]!);
  if (a!.characterId !== b!.characterId) {
    return { ...state, cards, flipped, aiMemory: seenMemory, rng, phase: "revealMismatch" };
  }

  const matched = cards.map((c) =>
    flipped.includes(c.position) ? { ...c, state: "matched" as const, matchedBy: by } : c,
  );
  const pairs = { ...state.pairs, [by]: [...state.pairs[by], a!.characterId] };
  const levelOver = matched.every((c) => c.state === "matched");
  // A match earns another turn: phase stays on the same player.
  return {
    ...state,
    cards: matched,
    flipped: [],
    pairs,
    aiMemory: forget(seenMemory, flipped),
    rng,
    phase: levelOver ? "levelEnd" : state.phase,
  };
}

/** After the reveal time: flip the missed pair back down and pass the turn. */
export function hideMismatch(state: GameState): GameState {
  if (state.phase !== "revealMismatch") return state;
  const cards = state.cards.map((c) =>
    state.flipped.includes(c.position) ? { ...c, state: "down" as const } : c,
  );
  const turn = other(state.turn);
  return { ...state, cards, flipped: [], turn, phase: turnPhase(turn) };
}
