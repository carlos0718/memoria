// Welcome modal (name + instructions) and the result overlays shown over the board.
import { MAX_NAME_LENGTH } from "../game/engine";
import { LAST_LEVEL } from "../game/levels";
import type { GameState } from "../game/types";

/** A modal with some content and one button. Escape can't skip it: the button moves the game on. */
export function openOverlay(contentHtml: string, buttonLabel: string, onClose: () => void): void {
  const dialog = document.createElement("dialog");
  dialog.className = "modal overlay";
  dialog.innerHTML = `<form method="dialog" class="modal-body">${contentHtml}<button class="btn" type="submit">${buttonLabel}</button></form>`;
  dialog.addEventListener("cancel", (e) => e.preventDefault());
  dialog.querySelector("form")!.addEventListener("submit", () => {
    dialog.remove();
    onClose();
  });
  document.body.append(dialog);
  dialog.showModal();
  dialog.querySelector<HTMLButtonElement>("button")!.focus();
}

export function showLevelResult(state: GameState, onNext: () => void): void {
  const result = state.lastLevelResult ?? "tie";
  const h = state.pairs.human.length;
  const a = state.pairs.ai.length;
  const title =
    result === "human" ? "You win the level!" : result === "ai" ? "The AI wins the level!" : "Level tied!";
  const detail = result === "tie" ? "Nobody scores this time." : "+1 on the level scoreboard.";
  const last = state.level >= LAST_LEVEL;
  const next = last
    ? "That was the last level. Let's see who won the game..."
    : `Next up: <strong>Level ${state.level + 1}</strong>. More cards, less time, and a sharper AI.`;
  openOverlay(
    `<div class="result result-${result}">
      <p class="result-level">Level ${state.level} complete</p>
      <h2>${title}</h2>
      <p class="final-score">Pairs: ${escapeHtml(state.name)} ${h} – ${a} AI</p>
      <p>${detail}</p>
      <p class="final-score">Levels: ${escapeHtml(state.name)} ${state.levelWins.human} – ${state.levelWins.ai} AI</p>
      <p>${next}</p>
    </div>`,
    last ? "See the final result" : `Go to level ${state.level + 1}`,
    onNext,
  );
}

/** The player's name is typed text: never inject it as HTML. */
export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);
}

export function showWelcome(onStart: (name: string) => void): void {
  const dialog = document.createElement("dialog");
  dialog.className = "modal";
  dialog.innerHTML = `
    <form method="dialog" class="modal-body">
      <h2>Welcome to Memor<span class="ia">IA</span></h2>
      <ul class="rules">
        <li>You play memory against a <strong>game AI</strong>.</li>
        <li>It sees every card, but its memory is imperfect.</li>
        <li>Every level has more cards and a <strong>sharper AI</strong>.</li>
        <li>5 levels. Whoever wins more levels wins the game.</li>
      </ul>
      <label class="field">
        <span>Your name</span>
        <input name="name" maxlength="${MAX_NAME_LENGTH}" autocomplete="nickname" />
        <small class="hint">Type your name to start</small>
      </label>
      <button class="btn" type="submit" disabled>Start</button>
    </form>`;
  const form = dialog.querySelector("form")!;
  const input = dialog.querySelector("input")!;
  const startBtn = dialog.querySelector<HTMLButtonElement>("button")!;
  // Start stays disabled until there is a real name (blank or spaces don't count).
  input.addEventListener("input", () => {
    startBtn.disabled = input.value.trim() === "";
  });
  // Escape must not dismiss it: the game can't start without a name.
  dialog.addEventListener("cancel", (e) => e.preventDefault());
  form.addEventListener("submit", (e) => {
    const name = input.value.trim();
    if (!name) {
      e.preventDefault();
      return;
    }
    onStart(name);
    dialog.remove();
  });
  document.body.append(dialog);
  dialog.showModal();
  input.focus();
}
