// Pure game rules: (state, input) → new state. No DOM, no timers, no network.
import { buildDeck } from "./deck";
import { LEVELS } from "./levels";
import { createRng } from "./rng";
import type { GameState, Level, Player } from "./types";

export function newGame(name: string, seed: number, poolIds: readonly number[]): GameState {
  const level: Level = 1;
  const { cards, rng } = buildDeck(poolIds, LEVELS[level].pairs, createRng(seed));
  return {
    version: 1,
    phase: "playerTurn",
    name,
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

function turnPhase(turn: Player): GameState["phase"] {
  return turn === "human" ? "playerTurn" : "aiTurn";
}

/** Returns the same state object when the flip isn't allowed. */
export function flip(state: GameState, position: number, by: Player): GameState {
  if (state.phase !== turnPhase(by) || state.turn !== by) return state;
  const card = state.cards[position];
  if (!card || card.state !== "down" || state.flipped.length >= 2) return state;

  const cards = state.cards.map((c) => (c.position === position ? { ...c, state: "up" as const } : c));
  const flipped = [...state.flipped, position];
  if (flipped.length < 2) return { ...state, cards, flipped };

  const [a, b] = flipped.map((p) => cards[p]!);
  if (a!.characterId !== b!.characterId) {
    return { ...state, cards, flipped, phase: "revealMismatch" };
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
    phase: levelOver ? "levelEnd" : state.phase,
  };
}

/** After the reveal time: flip the missed pair back down. */
export function hideMismatch(state: GameState): GameState {
  if (state.phase !== "revealMismatch") return state;
  const cards = state.cards.map((c) =>
    state.flipped.includes(c.position) ? { ...c, state: "down" as const } : c,
  );
  // Solo play for now; slice 2 passes the turn to the other player here.
  return { ...state, cards, flipped: [], phase: turnPhase(state.turn) };
}
