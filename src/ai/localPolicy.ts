// The rules player: decides from what the AI remembers, never from the real
// board. It's the fallback for Jev and the baseline for the kernel test.

export interface AiView {
  /** Positions still face down and pickable. */
  faceDown: number[];
  /** position → characterId, only for face-down positions the AI remembers. */
  remembered: Record<number, number>;
  /** The card already flipped this turn, if any. */
  firstPick: { position: number; characterId: number } | null;
}

export type Random = () => number;

function pickRandom(items: readonly number[], random: Random): number {
  return items[Math.floor(random() * items.length)]!;
}

export function localPick(view: AiView, random: Random): number {
  const { faceDown, remembered, firstPick } = view;
  const known = (p: number) => remembered[p] !== undefined;

  if (firstPick) {
    const partner = faceDown.find((p) => remembered[p] === firstPick.characterId);
    if (partner !== undefined) return partner;
  } else {
    // A full remembered pair: go for it.
    const seen = new Map<number, number>();
    for (const p of faceDown) {
      const id = remembered[p];
      if (id === undefined) continue;
      if (seen.has(id)) return seen.get(id)!;
      seen.set(id, p);
    }
  }
  // Otherwise explore a card it doesn't remember.
  const unknown = faceDown.filter((p) => !known(p));
  return pickRandom(unknown.length > 0 ? unknown : faceDown, random);
}
