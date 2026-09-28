import { describe, expect, it } from "vitest";
import { buildJevRequest, parseMoveRequest, readJevAnswer, type MoveRequest } from "./jev";

const valid: MoveRequest = {
  level: 3,
  firstPick: { position: 7, characterId: 2 },
  candidates: [
    { position: 0, remembered: 1 },
    { position: 4, remembered: null },
    { position: 9, remembered: 2 },
  ],
};

describe("parseMoveRequest", () => {
  it("accepts a well-formed request", () => {
    expect(parseMoveRequest(valid)).toEqual(valid);
    expect(parseMoveRequest({ ...valid, firstPick: null })?.firstPick).toBeNull();
  });

  it.each([
    ["not an object", "hello"],
    ["bad level", { ...valid, level: 9 }],
    ["no candidates", { ...valid, candidates: [] }],
    ["too many candidates", { ...valid, candidates: Array.from({ length: 29 }, (_, i) => ({ position: i, remembered: null })) }],
    ["duplicate positions", { ...valid, candidates: [{ position: 1, remembered: null }, { position: 1, remembered: null }] }],
    ["first pick offered again", { ...valid, candidates: [{ position: 7, remembered: null }] }],
    ["non-integer memory", { ...valid, candidates: [{ position: 1, remembered: "rick" }] }],
    ["malformed first pick", { ...valid, firstPick: { position: 1 } }],
  ])("rejects %s", (_, body) => {
    expect(parseMoveRequest(body)).toBeNull();
  });
});

describe("buildJevRequest", () => {
  it("offers one option per face-down card, describing only what the AI remembers", () => {
    const req = buildJevRequest(valid);
    expect(req.questions.move.type).toBe("choice");
    const c = req.questions.move.criteria;
    expect(Object.keys(c)).toEqual(["pos_0", "pos_4", "pos_9"]);
    expect(c.pos_4).toContain("unknown");
    expect(c.pos_9).toContain("SAME character as the first card");
    expect(c.pos_0).toContain("sure miss");
    expect(req.state.firstCard).toContain("character 2");
  });

  it("on the first card, flags remembered pairs", () => {
    const req = buildJevRequest({
      level: 2,
      firstPick: null,
      candidates: [{ position: 1, remembered: 4 }, { position: 2, remembered: 4 }, { position: 3, remembered: 6 }],
    });
    expect(req.state.firstCard).toContain("none yet");
    expect(req.questions.move.criteria.pos_1).toContain("known pair");
    expect(req.questions.move.criteria.pos_3).toContain("not been found");
  });
});

describe("readJevAnswer", () => {
  it("maps the chosen label back to a position", () => {
    expect(readJevAnswer(valid, { choice: "pos_9", confidence: 0.82 })).toEqual({ position: 9, confidence: 0.82 });
  });

  it("rejects labels that aren't candidates", () => {
    expect(readJevAnswer(valid, { choice: "pos_7", confidence: 0.9 })).toBeNull();
    expect(readJevAnswer(valid, { choice: "banana", confidence: 0.9 })).toBeNull();
  });
});
