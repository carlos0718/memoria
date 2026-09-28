// The card grid. Built once per level, then updated from the state so the
// flip animation runs on the same elements.
import { LEVELS } from "../game/levels";
import type { GameState } from "../game/types";
import type { Character } from "../services/characters";
import { faceElement } from "./pixelate";
import { portalSvg } from "./sprites";

export interface BoardDeps {
  poolIds: readonly number[];
  pool: Map<number, Character>;
  images: Map<number, HTMLImageElement | null>;
  onFlip: (position: number) => void;
}

export function mountBoard(container: HTMLElement, state: GameState, deps: BoardDeps): void {
  container.replaceChildren();
  const cols = LEVELS[state.level].desktopCols;
  container.style.setProperty("--cols", String(cols));
  container.style.setProperty("--rows", String(Math.ceil(state.cards.length / cols)));
  const back = portalSvg();
  for (const card of state.cards) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "card";
    button.dataset.position = String(card.position);
    button.setAttribute("aria-label", `Card ${card.position + 1}, face down`);

    const inner = document.createElement("div");
    inner.className = "card-inner";
    const backFace = document.createElement("div");
    backFace.className = "card-face card-back";
    backFace.innerHTML = back;
    const frontFace = document.createElement("div");
    frontFace.className = "card-face card-front";
    frontFace.append(faceElement(deps.images.get(card.characterId) ?? null, card.characterId, deps.poolIds));
    inner.append(backFace, frontFace);
    button.append(inner);
    button.addEventListener("click", () => deps.onFlip(card.position));
    container.append(button);
  }
  updateBoard(container, state, deps);
}

export function updateBoard(container: HTMLElement, state: GameState, deps: BoardDeps): void {
  const canPlay = state.phase === "playerTurn";
  for (const card of state.cards) {
    const button = container.children[card.position] as HTMLButtonElement | undefined;
    if (!button) continue;
    const up = card.state === "up";
    const matched = card.state === "matched";
    button.classList.toggle("is-up", up);
    button.classList.toggle("is-matched", matched);
    button.classList.toggle("by-ai", card.matchedBy === "ai");
    button.disabled = !canPlay || card.state !== "down";
    const name = deps.pool.get(card.characterId)?.name ?? `Character ${card.characterId}`;
    button.setAttribute(
      "aria-label",
      card.state === "down" ? `Card ${card.position + 1}, face down` : `Card ${card.position + 1}, ${name}`,
    );
  }
}
