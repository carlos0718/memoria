// Bootstrap and the only place with timers: engine → render wiring and the AI turn loop.
import "./styles/main.css";
import { chooseAiPick } from "./ai/aiPlayer";
import { flip, hideMismatch, newGame, rollDice, setName } from "./game/engine";
import { LAST_LEVEL, LEVELS } from "./game/levels";
import { randomSeed } from "./game/rng";
import type { GameState, Player } from "./game/types";
import { fetchPool, POOL_IDS, preloadImages } from "./services/characters";
import { mountBoard, updateBoard, type BoardDeps } from "./ui/board";
import { mountColumn, updateColumn } from "./ui/columns";
import { animateRoll, mountDice, updateDice } from "./ui/dice";
import { hideHand, pointAt } from "./ui/hand";
import { showWelcome } from "./ui/modals";

const AI_THINK_MS = 500;
const AFTER_FLIP_MS = 450;

const boardEl = document.querySelector<HTMLElement>("#board")!;
const statusEl = document.querySelector<HTMLElement>("#status")!;
const levelEl = document.querySelector<HTMLElement>("#level")!;
const diceEl = document.querySelector<HTMLElement>("#dice")!;
const colEl: Record<Player, HTMLElement> = {
  human: document.querySelector<HTMLElement>("#col-human")!,
  ai: document.querySelector<HTMLElement>("#col-ai")!,
};

let state: GameState = newGame(randomSeed(), POOL_IDS);
let deps: BoardDeps;
let aiRunning = false;
let rolling = false;
/** The last thing that happened, for the status line (not part of the saved state). */
let lastEvent: "match" | "miss" | null = null;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function statusText(s: GameState): string {
  const who = s.turn === "human" ? s.name : "The AI";
  switch (s.phase) {
    case "welcome":
      return "";
    case "dice":
      return s.dice ? "It's a tie! Roll again" : "Roll to see who goes first!";
    case "revealMismatch":
      return s.turn === "human" ? "No match! Take a good look..." : "The AI missed!";
    case "levelEnd":
      return "Level complete!";
    case "aiTurn":
      return lastEvent === "match" ? "The AI found a pair! It plays again..." : "The AI is thinking...";
    default:
      if (lastEvent === "match") return `Pair! Go again, ${who}!`;
      return s.flipped.length === 1 ? "Pick one more card" : `Your turn, ${s.name}!`;
  }
}

function render(): void {
  updateBoard(boardEl, state, deps);
  updateDice(diceEl, state);
  updateColumn(colEl.human, "human", state, deps);
  updateColumn(colEl.ai, "ai", state, deps);
  statusEl.textContent = statusText(state);
  statusEl.dataset.turn = state.phase === "aiTurn" || (state.phase === "revealMismatch" && state.turn === "ai") ? "ai" : state.phase === "dice" || state.phase === "welcome" ? "" : "human";
  levelEl.textContent = `Level ${state.level} / ${LAST_LEVEL}`;
}

function setState(next: GameState): void {
  if (next === state) return;
  const prev = state;
  state = next;
  if (next.flipped.length === 0 && prev.flipped.length === 1) lastEvent = "match";
  else if (next.phase === "revealMismatch") lastEvent = "miss";
  else if (next.turn !== prev.turn || next.phase !== prev.phase) lastEvent = null;
  render();

  if (state.phase === "revealMismatch") {
    setTimeout(() => setState(hideMismatch(state)), LEVELS[state.level].revealMs);
  }
  if (state.phase === "playerTurn") void pointAt(colEl.human.querySelector(".col-name")!);
  if (state.phase === "aiTurn") void runAiTurn();
  if (state.phase === "levelEnd" || state.phase === "dice") hideHand();
}

/** Plays the AI's picks one by one while it's still the AI's turn. */
async function runAiTurn(): Promise<void> {
  if (aiRunning) return;
  aiRunning = true;
  try {
    await pointAt(colEl.ai.querySelector(".col-name")!);
    while (state.phase === "aiTurn") {
      await sleep(AI_THINK_MS);
      const pick = await chooseAiPick(state);
      const cardEl = boardEl.children[pick.position];
      if (cardEl) await pointAt(cardEl);
      setState(flip(state, pick.position, "ai"));
      await sleep(AFTER_FLIP_MS);
    }
  } finally {
    aiRunning = false;
  }
}

/** The result is decided at once (pure engine); the UI plays the throw before applying it. */
async function roll(): Promise<void> {
  if (rolling || state.phase !== "dice") return;
  const next = rollDice(state);
  const thrown = next.dice?.rolls[next.dice.rolls.length - 1];
  if (!thrown) return;
  rolling = true;
  try {
    await animateRoll(diceEl, thrown);
  } finally {
    rolling = false;
  }
  setState(next);
}

async function start(): Promise<void> {
  mountColumn(colEl.human, "human");
  mountColumn(colEl.ai, "ai");
  mountDice(diceEl, () => void roll());
  document.addEventListener("keydown", (e) => {
    if (state.phase !== "dice" || (e.key !== " " && e.key !== "Enter")) return;
    e.preventDefault();
    void roll();
  });

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
  render();
  showWelcome((name) => setState(setName(state, name)));
}

void start();
