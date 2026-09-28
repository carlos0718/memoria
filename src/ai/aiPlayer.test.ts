import { beforeEach, describe, expect, it } from "vitest";
import { newGame, setName } from "../game/engine";
import type { GameState } from "../game/types";
import { POOL_IDS } from "../services/characters";
import { askJev, JevUnavailableError } from "../services/jevClient";
import { buildView, chooseAiPick, setJevEnabled } from "./aiPlayer";

function aiTurn(): GameState {
  const s = setName(newGame(3, POOL_IDS), "Ana");
  return { ...s, phase: "aiTurn", turn: "ai" };
}

const first = () => 0;

describe("AI player with Jev", () => {
  beforeEach(() => setJevEnabled(true));

  it("uses Jev's pick when it's valid and confident", async () => {
    const pick = await chooseAiPick(aiTurn(), first, async () => ({ position: 5, confidence: 0.9 }));
    expect(pick).toEqual({ position: 5, source: "jev", confidence: 0.9 });
  });

  it("falls back to rules when Jev isn't confident", async () => {
    const pick = await chooseAiPick(aiTurn(), first, async () => ({ position: 5, confidence: 0.3 }));
    expect(pick.source).toBe("rules");
    expect(pick.confidence).toBe(0.3);
  });

  it("falls back to rules on an invalid position (not face down)", async () => {
    const s = aiTurn();
    const matched = { ...s, cards: s.cards.map((c) => (c.position === 5 ? { ...c, state: "matched" as const } : c)) };
    const pick = await chooseAiPick(matched, first, async () => ({ position: 5, confidence: 0.99 }));
    expect(pick.source).toBe("rules");
    expect(buildView(matched).faceDown).toContain(pick.position);
  });

  it("falls back to rules on an error or a timeout, and keeps trying next time", async () => {
    const pick = await chooseAiPick(aiTurn(), first, async () => {
      throw new Error("timeout");
    });
    expect(pick.source).toBe("rules");
    const next = await chooseAiPick(aiTurn(), first, async () => ({ position: 2, confidence: 0.8 }));
    expect(next.source).toBe("jev");
  });

  it("stops asking for the session when the endpoint is unavailable", async () => {
    let calls = 0;
    const unavailable = async () => {
      calls++;
      throw new JevUnavailableError("404");
    };
    await chooseAiPick(aiTurn(), first, unavailable);
    await chooseAiPick(aiTurn(), first, unavailable);
    expect(calls).toBe(1);
  });
});

describe("jevClient", () => {
  const view = { faceDown: [0, 3], remembered: { 3: 9 }, firstPick: null };

  it("sends the remembered view and reads the answer", async () => {
    let sent: unknown;
    const move = await askJev(2, view, async (_url, init) => {
      sent = JSON.parse(String(init.body));
      return new Response(JSON.stringify({ position: 3, confidence: 0.7 }));
    });
    expect(sent).toEqual({ level: 2, firstPick: null, candidates: [{ position: 0, remembered: null }, { position: 3, remembered: 9 }] });
    expect(move).toEqual({ position: 3, confidence: 0.7 });
  });

  it("404/503 mean unavailable; other errors throw normally", async () => {
    await expect(askJev(1, view, async () => new Response("", { status: 404 }))).rejects.toBeInstanceOf(JevUnavailableError);
    await expect(askJev(1, view, async () => new Response("", { status: 503 }))).rejects.toBeInstanceOf(JevUnavailableError);
    await expect(askJev(1, view, async () => new Response("", { status: 502 }))).rejects.not.toBeInstanceOf(JevUnavailableError);
  });

  it("aborts after the timeout", async () => {
    const hang = (_url: string, init: RequestInit) =>
      new Promise<Response>((_, reject) => init.signal?.addEventListener("abort", () => reject(new Error("aborted"))));
    await expect(askJev(1, view, hang, 20)).rejects.toThrow("aborted");
  });
});
