// End-of-game screens: spinning trophy with confetti, the robot holding the trophy, or a tie.
import confetti from "canvas-confetti";
import type { GameState, Player } from "../game/types";
import { escapeHtml, openOverlay } from "./modals";
import { robotSvg, trophySvg } from "./sprites";

function celebrate(): void {
  const colors = ["#ffd23f", "#97ce4c", "#44d9e6", "#ff4f9a"];
  const end = Date.now() + 2500;
  const burst = () => {
    confetti({ particleCount: 40, spread: 70, origin: { x: 0.2, y: 0.6 }, colors, zIndex: 1000 });
    confetti({ particleCount: 40, spread: 70, origin: { x: 0.8, y: 0.6 }, colors, zIndex: 1000 });
    if (Date.now() < end) setTimeout(burst, 350);
  };
  burst();
}

export function showGameOver(state: GameState, winner: Player | "tie", onRestart: () => void): void {
  const { human, ai } = state.levelWins;
  const name = escapeHtml(state.name);
  const score = `<p class="final-score">${name} ${human} – ${ai} AI</p>`;
  const art =
    winner === "human"
      ? `<div class="trophy-spin">${trophySvg()}</div>`
      : winner === "ai"
        ? `<div class="robot-cheer">${robotSvg()}</div>`
        : "";
  const title =
    winner === "human" ? `You win, ${name}!` : winner === "ai" ? "The AI wins the game!" : "It's a tie!";
  const line =
    winner === "human"
      ? "You beat the AI's memory. The trophy is yours."
      : winner === "ai"
        ? "Its memory got too sharp. Ready for a rematch?"
        : "Same number of levels each. Break the tie?";
  openOverlay(
    `<div class="result result-${winner}">${art}<h2>${title}</h2>${score}<p>${line}</p></div>`,
    "Play again",
    onRestart,
  );
  if (winner === "human") celebrate();
}
