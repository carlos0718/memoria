// The turn pointer. It points at the active player's column, and on the AI's
// turn it glides to each card the AI is about to flip.
import { handSvg } from "./sprites";

export const HAND_MOVE_MS = 600;

let hand: HTMLElement | null = null;

function ensureHand(): HTMLElement {
  if (!hand) {
    hand = document.createElement("div");
    hand.className = "hand";
    hand.innerHTML = handSvg();
    document.body.append(hand);
  }
  return hand;
}

/** Moves the fingertip to the centre of `target`. Resolves when the glide ends. */
export function pointAt(target: Element): Promise<void> {
  const el = ensureHand();
  const rect = target.getBoundingClientRect();
  const x = rect.left + rect.width / 2 + window.scrollX;
  const y = rect.top + rect.height / 2 + window.scrollY;
  el.style.transform = `translate(${x}px, ${y}px)`;
  el.classList.add("is-visible");
  return new Promise((resolve) => setTimeout(resolve, HAND_MOVE_MS));
}

export function hideHand(): void {
  hand?.classList.remove("is-visible");
}
