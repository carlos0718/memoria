// One AI pick: build the "what I remember" view and decide.
// Rules-only for now; slice 6 plugs Jev in front of the same fallback.
import type { GameState } from "../game/types";
import { localPick, type AiView, type Random } from "./localPolicy";

export interface AiPick {
  position: number;
  source: "jev" | "rules";
  confidence?: number;
}

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

export async function chooseAiPick(state: GameState, random: Random = Math.random): Promise<AiPick> {
  return { position: localPick(buildView(state), random), source: "rules" };
}
