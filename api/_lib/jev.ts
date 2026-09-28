// Pure pieces of the /api/ai-move function: validate the browser's request,
// turn it into one Jev `choice` question, and read the answer back.
// (Files under api/_lib are not deployed as functions.)
import { choice } from "@typesafe-ai/sdk";

export interface Candidate {
  position: number;
  /** characterId the AI remembers for this face-down card, or null if unknown. */
  remembered: number | null;
}

export interface MoveRequest {
  level: number;
  firstPick: { position: number; characterId: number } | null;
  candidates: Candidate[];
}

export interface MoveAnswer {
  position: number;
  confidence: number;
}

const isInt = (x: unknown): x is number => Number.isInteger(x);
const MAX_CANDIDATES = 28;

export function parseMoveRequest(body: unknown): MoveRequest | null {
  if (typeof body !== "object" || body === null) return null;
  const b = body as Record<string, unknown>;
  if (!isInt(b.level) || b.level < 1 || b.level > 5) return null;

  let firstPick: MoveRequest["firstPick"] = null;
  if (b.firstPick !== null) {
    const f = b.firstPick as Record<string, unknown> | undefined;
    if (!f || !isInt(f.position) || !isInt(f.characterId)) return null;
    firstPick = { position: f.position, characterId: f.characterId };
  }

  if (!Array.isArray(b.candidates) || b.candidates.length === 0 || b.candidates.length > MAX_CANDIDATES) return null;
  const candidates: Candidate[] = [];
  const seen = new Set<number>();
  for (const c of b.candidates as Array<Record<string, unknown>>) {
    if (!c || !isInt(c.position) || seen.has(c.position)) return null;
    if (c.remembered !== null && !isInt(c.remembered)) return null;
    if (firstPick && c.position === firstPick.position) return null;
    seen.add(c.position);
    candidates.push({ position: c.position, remembered: c.remembered as number | null });
  }
  return { level: b.level, firstPick, candidates };
}

const label = (position: number) => `pos_${position}`;

/** Spells out what the AI's memory implies for each card; it never reveals cards the AI forgot. */
function describe(c: Candidate, move: MoveRequest): string {
  if (c.remembered === null) return "unknown card (not remembered)";
  const base = `remembered: character ${c.remembered}`;
  if (move.firstPick) {
    return move.firstPick.characterId === c.remembered
      ? `${base}, the SAME character as the first card: flipping it completes a pair`
      : `${base}, a different character from the first card: flipping it is a sure miss`;
  }
  const twin = move.candidates.some((o) => o !== c && o.remembered === c.remembered);
  return twin
    ? `${base}, and its matching card is also remembered: a known pair`
    : `${base}, its match has not been found yet`;
}

/** The request for client.systemOne: Jev only sees what the AI remembers, never the real board. */
export function buildJevRequest(move: MoveRequest) {
  const criteria: Record<string, string> = {};
  for (const c of move.candidates) criteria[label(c.position)] = describe(c, move);
  return {
    state: {
      game: "memory card game: flip two cards per turn; a matching pair scores and plays again",
      firstCard: move.firstPick
        ? `already flipped this turn: character ${move.firstPick.characterId}`
        : "none yet (this is the first card of the turn)",
      strategy: [
        "If a remembered card shows the same character as the first card, flip it.",
        "On the first card, if two remembered cards show the same character, flip one of them.",
        "Otherwise flip an unknown card to discover it.",
      ],
    },
    questions: {
      move: choice("Which face-down card should the AI flip now?", criteria),
    },
  };
}

/** Maps Jev's chosen label back to a board position; null if it isn't one of the candidates. */
export function readJevAnswer(
  move: MoveRequest,
  answer: { choice: string; confidence: number },
): MoveAnswer | null {
  const match = /^pos_(\d+)$/.exec(answer.choice);
  if (!match) return null;
  const position = Number(match[1]);
  if (!move.candidates.some((c) => c.position === position)) return null;
  const confidence = Number.isFinite(answer.confidence) ? answer.confidence : 0;
  return { position, confidence };
}
