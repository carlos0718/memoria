import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const systemOne = vi.fn();
vi.mock("@typesafe-ai/sdk", async (importOriginal) => {
  const real = await importOriginal<typeof import("@typesafe-ai/sdk")>();
  // A regular function (not an arrow) so `new TypeSafeClient()` works on the mock.
  return { ...real, TypeSafeClient: vi.fn(function () { return { systemOne }; }) };
});

const { POST } = await import("../ai-move");

const body = {
  level: 1,
  firstPick: null,
  candidates: [
    { position: 0, remembered: null },
    { position: 1, remembered: 5 },
  ],
};

const post = (b: unknown) =>
  POST(new Request("http://localhost/api/ai-move", { method: "POST", body: typeof b === "string" ? b : JSON.stringify(b) }));

describe("POST /api/ai-move", () => {
  beforeEach(() => {
    vi.stubEnv("TYPESAFE_API_KEY", "test-key");
    systemOne.mockReset();
  });
  afterEach(() => vi.unstubAllEnvs());

  it("returns Jev's position and confidence", async () => {
    systemOne.mockResolvedValue({ answers: { move: { choice: "pos_1", confidence: 0.9, probabilities: {} } } });
    const res = await post(body);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ position: 1, confidence: 0.9 });
  });

  it("503 without a key (the browser falls back to rules)", async () => {
    vi.stubEnv("TYPESAFE_API_KEY", "");
    expect((await post(body)).status).toBe(503);
  });

  it("400 on bad JSON or an invalid request", async () => {
    expect((await post("{nope")).status).toBe(400);
    expect((await post({ level: 1 })).status).toBe(400);
  });

  it("502 when Jev fails or picks something invalid", async () => {
    systemOne.mockRejectedValue(new Error("timeout"));
    expect((await post(body)).status).toBe(502);
    systemOne.mockResolvedValue({ answers: { move: { choice: "pos_99", confidence: 0.9, probabilities: {} } } });
    expect((await post(body)).status).toBe(502);
  });
});
