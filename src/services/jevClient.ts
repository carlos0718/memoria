// Browser side of Jev: POST /api/ai-move with a timeout. Throws on any problem;
// the AI Player catches it and lets the rules player decide.
import type { AiView } from "../ai/localPolicy";

export const JEV_TIMEOUT_MS = 3000;

export interface JevMove {
  position: number;
  confidence: number;
}

/** The endpoint doesn't exist (plain `npm run dev`) or has no key: stop asking for this session. */
export class JevUnavailableError extends Error {}

type FetchFn = (url: string, init: RequestInit) => Promise<Response>;

export async function askJev(
  level: number,
  view: AiView,
  fetchFn: FetchFn = (url, init) => fetch(url, init),
  timeoutMs = JEV_TIMEOUT_MS,
): Promise<JevMove> {
  const body = {
    level,
    firstPick: view.firstPick,
    candidates: view.faceDown.map((position) => ({ position, remembered: view.remembered[position] ?? null })),
  };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetchFn("/api/ai-move", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (res.status === 404 || res.status === 503) throw new JevUnavailableError(`Jev unavailable (${res.status})`);
    if (!res.ok) throw new Error(`Jev error ${res.status}`);
    const data = (await res.json()) as Partial<JevMove>;
    if (!Number.isInteger(data.position) || typeof data.confidence !== "number") throw new Error("Bad Jev answer");
    return { position: data.position!, confidence: data.confidence };
  } finally {
    clearTimeout(timer);
  }
}
