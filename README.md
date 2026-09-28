# MemorIA

A retro, pixelated memory card game in the browser. You play up to 5 levels against a game AI whose memory gets sharper every level; whoever wins more levels wins the game (best of 5).

Built for the Devpost *Build With AI: Basics* hackathon. The planning documents are in [`devpost/`](devpost/): [`scope.md`](devpost/scope.md), [`prd.md`](devpost/prd.md), and [`spec.md`](devpost/spec.md).

## How the AI works

The AI has two halves:

1. **An imperfect memory (our code).** The AI sees every card that gets flipped, but only remembers each one with a probability that rises by level: 20% at level 1, 95% at level 5. It's plain TypeScript with a seeded random generator, so it's tested (`src/ai/kernel.test.ts` simulates 500 games per level).
2. **Jev picks the move.** On its turn, the AI sends only what it remembers to [Jev](https://docs.typesafe.ai/), a typed-decision model by TypeSafe, and asks which card to flip. Jev answers with a choice and a confidence. If Jev is unsure (confidence under 50%), slow, or unavailable, a local rules player decides. The "AI brain" label in the AI's card shows who chose each move.

It is not a chatbot: Jev only returns a typed choice with probabilities.

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
