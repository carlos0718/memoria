// Dice panel: two 3D pip dice. Space/Enter or tap to roll; each throw tumbles
// and slows down before landing. On a tie the player throws again.
import type { GameState, Player } from "../game/types";

export const DICE_ROLL_MS = 3000;

// Cube rotation that brings each value to the front (faces set up in CSS).
const FACE_ROTATION: Record<number, [number, number]> = {
  1: [0, 0],
  2: [0, -90],
  3: [-90, 0],
  4: [90, 0],
  5: [0, 90],
  6: [0, 180],
};

// Which of the 9 pip slots (3×3, row by row) are filled for each value.
const PIPS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

function faceHtml(value: number): string {
  const slots = Array.from({ length: 9 }, (_, i) =>
    `<span class="pip${PIPS[value]!.includes(i) ? " on" : ""}"></span>`,
  ).join("");
  return `<div class="die-face face-${value}">${slots}</div>`;
}

function dieHtml(who: Player): string {
  const faces = [1, 2, 3, 4, 5, 6].map(faceHtml).join("");
  return `<div class="die-scene"><div class="die3d" data-who="${who}">${faces}</div></div>`;
}

export function mountDice(container: HTMLElement, onRoll: () => void): void {
  container.innerHTML = `
    <button type="button" class="dice-btn" aria-label="Roll the dice">
      <span class="die-slot"><span class="die-label">You</span>${dieHtml("human")}</span>
      <span class="vs">vs</span>
      <span class="die-slot"><span class="die-label">AI</span>${dieHtml("ai")}</span>
    </button>
    <p class="dice-log"></p>`;
  container.querySelector("button")!.addEventListener("click", onRoll);
}

const spins = new WeakMap<HTMLElement, number>();

function land(die: HTMLElement, value: number, durationMs: number): void {
  // Add whole turns on top of the landing rotation so the die tumbles, then eases out.
  const turns = durationMs > 0 ? (spins.get(die) ?? 0) + 3 + Math.floor(Math.random() * 3) : 0;
  spins.set(die, turns);
  const [x, y] = FACE_ROTATION[value]!;
  die.style.transition = durationMs > 0 ? `transform ${durationMs}ms cubic-bezier(0.15, 0.6, 0.25, 1)` : "none";
  die.style.transform = `rotateX(${turns * 360 + x}deg) rotateY(${turns * 360 + y}deg)`;
}

function dice(container: HTMLElement): Record<Player, HTMLElement> {
  return {
    human: container.querySelector<HTMLElement>('.die3d[data-who="human"]')!,
    ai: container.querySelector<HTMLElement>('.die3d[data-who="ai"]')!,
  };
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Plays one throw. Resolves when both dice land. */
export async function animateRoll(container: HTMLElement, roll: Record<Player, number>): Promise<void> {
  const log = container.querySelector<HTMLElement>(".dice-log")!;
  const d = dice(container);
  container.classList.remove("is-waiting");
  container.classList.add("is-rolling");
  container.querySelector<HTMLButtonElement>(".dice-btn")!.disabled = true;
  log.textContent = "Rolling...";
  land(d.human, roll.human, DICE_ROLL_MS);
  land(d.ai, roll.ai, DICE_ROLL_MS);
  await wait(DICE_ROLL_MS);
  container.classList.remove("is-rolling");
}

export function updateDice(container: HTMLElement, state: GameState): void {
  if (container.classList.contains("is-rolling")) return;
  const button = container.querySelector<HTMLButtonElement>(".dice-btn")!;
  const log = container.querySelector<HTMLElement>(".dice-log")!;
  const waiting = state.phase === "dice";
  button.disabled = !waiting;
  container.classList.toggle("is-waiting", waiting);
  const d = dice(container);
  const last = state.dice?.rolls[state.dice.rolls.length - 1];
  if (!last) {
    land(d.human, 1, 0);
    land(d.ai, 1, 0);
  }
  if (waiting && last) {
    log.textContent = `${last.human} - ${last.ai}: tie! Press SPACE or tap to roll again`;
  } else if (waiting) {
    log.textContent = "Press SPACE or tap the dice to roll!";
  } else if (state.dice?.starter && last) {
    const starter = state.dice.starter === "human" ? `${state.name} starts!` : "The AI starts!";
    log.textContent = `${last.human} - ${last.ai}: ${starter}`;
  } else {
    log.textContent = "";
  }
}
