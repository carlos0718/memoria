// Bootstrap and the only place with timers: engine → render wiring.
import "./styles/main.css";
import { flip, hideMismatch, newGame } from "./game/engine";
import { LEVELS } from "./game/levels";
import { randomSeed } from "./game/rng";
import type { GameState } from "./game/types";
import { fetchPool, POOL_IDS, preloadImages } from "./services/characters";
import { mountBoard, updateBoard, type BoardDeps } from "./ui/board";

const boardEl = document.querySelector<HTMLElement>("#board")!;
const statusEl = document.querySelector<HTMLElement>("#status")!;

let state: GameState = newGame("Player", randomSeed(), POOL_IDS);
let deps: BoardDeps;

function statusText(s: GameState): string {
  switch (s.phase) {
    case "revealMismatch":
      return "No match! Take a good look...";
    case "levelEnd":
      return "All pairs found! Reload for new characters.";
    default:
      return s.flipped.length === 1 ? "Pick one more card" : "Your turn! Find a pair";
  }
}

function setState(next: GameState): void {
  if (next === state) return;
  state = next;
  updateBoard(boardEl, state, deps);
  statusEl.textContent = statusText(state);
  if (state.phase === "revealMismatch") {
    setTimeout(() => setState(hideMismatch(state)), LEVELS[state.level].revealMs);
  }
}

async function start(): Promise<void> {
  const pool = await fetchPool();
  const levelIds = [...new Set(state.cards.map((c) => c.characterId))];
  const images = await preloadImages(levelIds, pool);
  deps = {
    poolIds: POOL_IDS,
    pool,
    images,
    onFlip: (position) => setState(flip(state, position, "human")),
  };
  mountBoard(boardEl, state, deps);
  statusEl.textContent = statusText(state);
}

void start();
