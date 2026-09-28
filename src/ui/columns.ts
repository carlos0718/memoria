// Player and AI columns: name, pairs this level (as a pile of mini faces), levels won.
import type { GameState, Player } from "../game/types";
import type { Character } from "../services/characters";
import { faceElement } from "./pixelate";

export interface ColumnDeps {
  poolIds: readonly number[];
  pool: Map<number, Character>;
  images: Map<number, HTMLImageElement | null>;
}

export function mountColumn(container: HTMLElement, who: Player): void {
  container.classList.add("column", `column-${who}`);
  container.innerHTML = `
    <h2 class="col-name"></h2>
    <p class="col-stat">Pairs: <strong class="col-pairs">0</strong></p>
    <p class="col-stat">Levels won: <strong class="col-levels">0</strong></p>
    <div class="pile" aria-label="Collected pairs"></div>`;
}

export function updateColumn(container: HTMLElement, who: Player, state: GameState, deps: ColumnDeps): void {
  container.querySelector(".col-name")!.textContent = who === "human" ? state.name || "You" : "AI";
  container.querySelector(".col-pairs")!.textContent = String(state.pairs[who].length);
  container.querySelector(".col-levels")!.textContent = String(state.levelWins[who]);
  const active = state.turn === who && (state.phase === "playerTurn" || state.phase === "aiTurn");
  container.classList.toggle("is-active", active);

  const pile = container.querySelector<HTMLElement>(".pile")!;
  const ids = state.pairs[who];
  if (pile.childElementCount === ids.length) return;
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
