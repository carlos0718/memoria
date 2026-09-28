// Player and AI columns: name, pairs this level (as a pile of mini faces), levels won.
import type { GameState, Player } from "../game/types";
import type { Character } from "../services/characters";
import { faceElement } from "./pixelate";

export interface ColumnDeps {
  poolIds: readonly number[];
  pool: Map<number, Character>;
  images: Map<number, HTMLImageElement | null>;
}

/** Phone layout: the column collapses to name + levels, and tapping it opens the details. */
export const PHONE_QUERY = "(max-width: 640px)";

export function mountColumn(container: HTMLElement, who: Player, onOpenDetails: () => void): void {
  container.classList.add("column", `column-${who}`);
  container.addEventListener("click", () => {
    if (window.matchMedia(PHONE_QUERY).matches) onOpenDetails();
  });
  container.innerHTML = `
    <h2 class="col-name"></h2>
    <p class="col-chip">Levels: <strong class="col-levels-chip">0</strong></p>
    <p class="col-stat">Pairs: <strong class="col-pairs">0</strong></p>
    <p class="col-stat">Levels won: <strong class="col-levels">0</strong></p>
    <div class="pile" aria-label="Collected pairs"></div>`;
}

export function updateColumn(container: HTMLElement, who: Player, state: GameState, deps: ColumnDeps): void {
  container.querySelector(".col-name")!.textContent = who === "human" ? state.name || "You" : "AI";
  container.querySelector(".col-pairs")!.textContent = String(state.pairs[who].length);
  container.querySelector(".col-levels")!.textContent = String(state.levelWins[who]);
  container.querySelector(".col-levels-chip")!.textContent = String(state.levelWins[who]);
  const active = state.turn === who && (state.phase === "playerTurn" || state.phase === "aiTurn");
  container.classList.toggle("is-active", active);

  const pile = container.querySelector<HTMLElement>(".pile")!;
  const ids = state.pairs[who];
  const key = ids.join(",");
  if (pile.dataset.key === key) return;
  pile.dataset.key = key;
  fillPile(pile, ids, deps);
}

export function fillPile(pile: HTMLElement, ids: readonly number[], deps: ColumnDeps): void {
  pile.replaceChildren(
    ...ids.map((id) => {
      const mini = document.createElement("div");
      mini.className = "pile-card";
      mini.title = deps.pool.get(id)?.name ?? "";
      mini.append(faceElement(deps.images.get(id) ?? null, id, deps.poolIds));
      return mini;
    }),
  );
}
