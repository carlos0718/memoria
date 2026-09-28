// One AI pick: build the "what I remember" view, ask Jev, and check the answer.
// If Jev is off, slow, wrong, or unsure, the rules player decides instead.
import type { GameState } from "../game/types";
import { askJev, JevUnavailableError, type JevMove } from "../services/jevClient";
import { localPick, type AiView, type Random } from "./localPolicy";

/** Below this confidence Jev's pick is ignored and the rules decide. */
export const MIN_CONFIDENCE = 0.5;

export interface AiPick {
  position: number;
  source: "jev" | "rules";
  /** Jev's confidence, when Jev answered (even if the rules overrode it). */
  confidence?: number;
}

export type AskJev = (level: number, view: AiView) => Promise<JevMove>;

export function buildView(state: GameState): AiView {
  const faceDown = state.cards.filter((c) => c.state === "down").map((c) => c.position);
  const remembered: Record<number, number> = {};
  for (const p of faceDown) {
    const id = state.aiMemory[p];
    if (id !== undefined) remembered[p] = id;
  }
  const first = state.flipped[0];
  const firstPick =
    first === undefined ? null : { position: first, characterId: state.cards[first]!.characterId };
  return { faceDown, remembered, firstPick };
}

/** `?ai=local` forces the rules player (testing, or a demo safety net). */
let jevEnabled = typeof location === "undefined" || new URLSearchParams(location.search).get("ai") !== "local";

export function setJevEnabled(enabled: boolean): void {
  jevEnabled = enabled;
}

export async function chooseAiPick(
  state: GameState,
  random: Random = Math.random,
  ask: AskJev = askJev,
): Promise<AiPick> {
  const view = buildView(state);
  const rules = (confidence?: number): AiPick => ({ position: localPick(view, random), source: "rules", confidence });
  if (!jevEnabled) return rules();

  let move: JevMove;
  try {
    move = await ask(state.level, view);
  } catch (err) {
    // No endpoint or no key: don't keep asking every turn this session.
    if (err instanceof JevUnavailableError) jevEnabled = false;
    return rules();
  }
  const valid = view.faceDown.includes(move.position);
  if (!valid || move.confidence < MIN_CONFIDENCE) return rules(move.confidence);
  return { position: move.position, source: "jev", confidence: move.confidence };
}
