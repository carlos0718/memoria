// Welcome modal (name + instructions). Result overlays arrive in slice 3.
import { MAX_NAME_LENGTH } from "../game/engine";

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
        <input name="name" required maxlength="${MAX_NAME_LENGTH}" autocomplete="nickname" />
      </label>
      <button class="btn" type="submit">Start</button>
    </form>`;
  const form = dialog.querySelector("form")!;
  const input = dialog.querySelector("input")!;
  // Escape must not dismiss it: the game can't start without a name.
  dialog.addEventListener("cancel", (e) => e.preventDefault());
  form.addEventListener("submit", (e) => {
    const name = input.value.trim();
    if (!name) {
      e.preventDefault();
      input.value = "";
      input.reportValidity();
      return;
    }
    onStart(name);
    dialog.remove();
  });
  document.body.append(dialog);
  dialog.showModal();
  input.focus();
}
