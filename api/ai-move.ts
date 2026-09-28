// Vercel function: holds the TypeSafe key, asks Jev which card the AI should
// flip, and returns { position, confidence }. The browser never sees the key.
import { TypeSafeClient } from "@typesafe-ai/sdk";
import { buildJevRequest, parseMoveRequest, readJevAnswer } from "./_lib/jev.js";

// The browser gives up after 3 s and falls back to the rules player, so don't retry past that.
const JEV_TIMEOUT_MS = 2500;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.TYPESAFE_API_KEY?.trim();
  if (!apiKey) return json({ error: "TYPESAFE_API_KEY is not set" }, 503);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Body must be JSON" }, 400);
  }
  const move = parseMoveRequest(body);
  if (!move) return json({ error: "Invalid move request" }, 400);

  try {
    const client = new TypeSafeClient({
      apiKey,
      timeout: JEV_TIMEOUT_MS,
      retry: { apiConnectionError: false, apiTimeoutError: false },
      logLevel: "off",
    });
    const result = await client.systemOne(buildJevRequest(move));
    const answer = readJevAnswer(move, result.answers.move);
    if (!answer) return json({ error: "Jev chose an invalid card" }, 502);
    return json(answer);
  } catch (err) {
    const name = err instanceof Error ? err.name : "Error";
    return json({ error: `Jev request failed (${name})` }, 502);
  }
}
