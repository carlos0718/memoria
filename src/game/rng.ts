// Seeded RNG (mulberry32). Pure: every call returns the value and the next state,
// so the state can live inside GameState and survive a reload.

export interface RngState {
  seed: number;
  state: number;
}

export function createRng(seed: number): RngState {
  const s = seed >>> 0;
  return { seed: s, state: s };
}

export function randomSeed(): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] ?? Date.now() >>> 0;
}

/** Float in [0, 1). */
export function nextFloat(rng: RngState): [number, RngState] {
  const a = (rng.state + 0x6d2b79f5) | 0;
  let t = a;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return [value, { seed: rng.seed, state: a >>> 0 }];
}

/** Integer in [0, maxExclusive). */
export function nextInt(rng: RngState, maxExclusive: number): [number, RngState] {
  const [f, next] = nextFloat(rng);
  return [Math.floor(f * maxExclusive), next];
}

/** Fisher–Yates shuffle, returns a new array. */
export function shuffle<T>(items: readonly T[], rng: RngState): [T[], RngState] {
  const out = items.slice();
  let r = rng;
  for (let i = out.length - 1; i > 0; i--) {
    let j: number;
    [j, r] = nextInt(r, i + 1);
    [out[i], out[j]] = [out[j] as T, out[i] as T];
  }
  return [out, r];
}
