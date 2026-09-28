# MemorIA

A retro, pixelated memory card game in the browser. You play up to 5 levels against a game AI whose memory gets sharper every level; whoever wins more levels wins the game (best of 5).

Built for the Devpost *Build With AI: Basics* hackathon. The planning documents are in [`devpost/`](devpost/): [`scope.md`](devpost/scope.md), [`prd.md`](devpost/prd.md), and [`spec.md`](devpost/spec.md).

## How the AI works

The AI has two halves:

1. **An imperfect memory (our code).** The AI never peeks at face-down cards. It sees every card that gets flipped, both yours and its own, but only remembers each one with a probability that rises by level. It's plain TypeScript with a seeded random generator, so it's tested (`src/ai/kernel.test.ts` simulates 500 games per level).

   | Level | Cards | Chance the AI remembers each card it sees |
   |---|---|---|
   | 1 | 12 | 20% |
   | 2 | 16 | 40% |
   | 3 | 20 | 60% |
   | 4 | 24 | 80% |
   | 5 | 28 | 95% |

   That's why at level 1 the AI can walk past a pair you know it has seen: it saw both cards but forgot them.
2. **Jev picks the move.** On its turn, the AI sends only what it remembers (which cards are still face down, which of those it remembers, and its first pick of the turn, if any) to [Jev](https://docs.typesafe.ai/), a typed-decision model by TypeSafe, and asks which card to flip. Jev answers with a choice and a confidence. If Jev is unsure (confidence under 50%), slow, or unavailable, a local rules player decides. The "AI brain" label in the AI's card shows who chose each move.

It is not a chatbot: Jev only returns a typed choice with probabilities.

### Reading the "AI brain" label

The label in the AI's card shows who chose the AI's **last card**, and it updates on every flip.

| Label | What it means |
|---|---|
| `AI brain: ...` | The AI hasn't flipped a card yet since the page loaded. |
| `AI brain: Jev 62%` | Jev chose the card. The percentage is Jev's confidence in that choice. It is always 50% or higher, because anything lower is not used. |
| `AI brain: Rules (Jev unsure 38%)` | Jev answered, but the answer wasn't used and the local rules player chose the card instead. Usually its confidence was under 50%. Rarely, it named a card that can't be flipped (already matched or face up), in which case this shows whatever confidence Jev gave. |
| `AI brain: Rules` | Jev wasn't asked, or no answer came back. The possible reasons: the game is running under `npm run dev` (no server function) or with `?ai=local`, there's no API key on the server, or Jev took longer than 3 seconds or returned an error. |

What to expect while playing:

- **First card of a turn:** usually `Rules (Jev unsure …)`. Picking blind is close to a guess, and Jev's low confidence says so.
- **Second card, when the AI remembers the partner:** usually `Jev` with a high confidence (80% or more), because the right answer is clear.
- **When Jev is missing vs. when it hiccups:** if the endpoint doesn't exist or the server has no key, the game stops asking Jev until the page is reloaded, and every move shows `Rules`. A slow answer or any other error affects only that one move, and the next move asks Jev again.

The rules player never breaks the game. Whether Jev is on or off, you always get a working opponent with the same imperfect memory.

## Run it

Requirements: Node.js 20+ and npm.

```sh
npm install
npm run dev        # http://localhost:5173 — the AI uses the rules player
```

### With Jev

Requires the [Vercel CLI](https://vercel.com/docs/cli) (`npm i -g vercel`, then `vercel login` and `vercel link`) and a TypeSafe API key.

```sh
cp .env.example .env.local   # paste your key: TYPESAFE_API_KEY=...
npm run dev:full             # vercel dev → http://localhost:3000
```

The key stays on the server (`api/ai-move.ts`); the browser never sees it.

### Handy URL options

- `?speed=fast` plays every animation at 4× speed (good for trying all levels or recording).
- `?ai=local` forces the rules player even when Jev is available.

## Tests

```sh
npm test           # Vitest, no network (Jev and the Rick and Morty API are mocked)
npm run typecheck
```

## Credits

- Character images from [The Rick and Morty API](https://rickandmortyapi.com), loaded live and never stored in this repo. Rick and Morty © Adult Swim / Warner Bros. Discovery. Non-commercial fan project.
- Font: [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P).
- Confetti: [canvas-confetti](https://github.com/catdad/canvas-confetti).
