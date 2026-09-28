---
doc: checklist
status: approved
---

# Build Checklist

Build mode: learn

## Slices

- [x] **1. You can flip Rick and Morty cards and find pairs on a retro board**
  Becomes usable: A running page with the MemorIA look (dark space background, pixel font, portal card backs) and a level-1 board of 12 cards. Clicking two cards flips them; a match stays face up, a miss stays visible 5 s and flips back. Faces are pixelated characters drawn at random from the live pool; if the API fails, retro number-and-color tiles appear. Solo play only, no AI yet.
  Why now: Bootstraps the whole project (Vite + TS + Vitest, folder structure, `.env.example` with an empty `TYPESAFE_API_KEY`) and proves the two riskiest front-end pieces at once: the Rick and Morty API plus canvas pixelation, and the pure engine that every later slice builds on.
  PRD ref: `prd.md > The Core Journey` (steps 1, 3, 5), `prd.md > Turns and Pairs`, `prd.md > Look and Feel`
  Spec ref: `spec.md > Stack`, `spec.md > File Structure`, `spec.md > Look and Feel`, `spec.md > Game Engine (game/engine.ts)`, `spec.md > Deck and RNG (game/deck.ts, game/rng.ts)`, `spec.md > Characters (services/characters.ts)`, `spec.md > UI (ui/)`, `spec.md > Timers and Turn Loop (main.ts)`
  Build: Scaffold Vite vanilla-ts in the project root, add Vitest and `vite.config.ts`, `.env.example` (`TYPESAFE_API_KEY=`) and an empty `.env.local`. Write `game/types.ts`, `rng.ts`, `levels.ts`, `deck.ts`, and the `flip`/`hideMismatch` parts of `engine.ts` with unit tests. Write `services/characters.ts` (curated ~30 ID pool, one fetch, `Promise.allSettled` preload, fallback on failure) with tests, `ui/pixelate.ts`, `ui/board.ts`, `ui/sprites.ts` (card back), `styles/main.css` (palette, font, pixel borders), `index.html` with the credit footer, and `main.ts` wiring the mismatch timer.
  Verify (mechanical): `npm test` passes (rng is reproducible, the deck has each character exactly twice, engine match/mismatch rules, characters fallback when one image fails); `npx tsc --noEmit` is clean; `npm run dev` starts and a request to the page returns 200; a real fetch to the Rick and Morty API with the pool IDs returns every ID with a name.
  Learner check: Run `npm run dev`, open http://localhost:5173, flip cards until you find a pair and miss one. Faces should look pixelated and retro, and a missed pair should flip back after about 5 seconds. Reload and notice the characters change.
  Commit: `Add retro board with Rick and Morty cards and pair matching`

- [x] **2. You play level 1 against an AI that forgets**
  Becomes usable: The welcome modal asks for your name and explains the game. Dice decide who starts (Space/Enter/tap, re-roll on ties). Turns alternate: a match earns another turn, a miss passes it. On the AI's turn the pointing hand glides to each card and flips it, the board ignores your clicks, and the AI sometimes forgets cards it has seen. Pairs pile up in each player's column.
  Why now: This is the unique kernel. It goes right after the board so the memory curve is tested and felt before anything is built around it. It uses the local rules player, so it needs no Jev key.
  PRD ref: `prd.md > Welcome and Instructions`, `prd.md > Dice Roll`, `prd.md > Turns and Pairs`, `prd.md > The Game AI (the Kernel)`
  Spec ref: `spec.md > Dice (game/dice.ts)`, `spec.md > AI Memory — the Kernel (ai/memory.ts)`, `spec.md > Local Rules Player (ai/localPolicy.ts)`, `spec.md > AI Player (ai/aiPlayer.ts)`, `spec.md > Game Engine (game/engine.ts)`, `spec.md > UI (ui/)`, `spec.md > Timers and Turn Loop (main.ts)`, `spec.md > Verification`
  Build: `game/dice.ts`, the turn/phase logic in `engine.ts` (`setName`, `rollDice`, turn passing, extra turn on a match), `ai/memory.ts`, `ai/localPolicy.ts`, and `ai/aiPlayer.ts` (rules-only for now, same interface Jev will plug into later). UI: `modals.ts` (welcome), `dice.ts`, `hand.ts`, `columns.ts` (name, pairs this level). Add the AI turn loop to `main.ts`.
  Verify (mechanical): `npm test` passes, including dice tie re-roll, turn rules, memory probability, and `ai/kernel.test.ts`, which runs 500 simulated games per level and shows level 1 missing known pairs at least 3× as often as level 5, with level 5 taking known pairs at least 90% of the time. `tsc` is clean; the dev server serves the page.
  Learner check: Enter your name, roll the dice, and play a full level 1 against the AI. You should see the hand play for the AI, your clicks ignored on its turn, and the AI miss pairs you know it has already seen.
  Commit: `Add dice, turns, and a forgetful game AI for level 1`

- [x] **3. You play all 5 levels and the game crowns a winner**
  Becomes usable: A level ends when no cards remain. The level result overlay shows win, loss, or tie, the level scoreboard updates (ties score nothing), and the next level starts with more cards, a shorter reveal time, and a sharper AI. After level 5: a spinning trophy with confetti, a robot holding the trophy, or a tie message, each with a restart. Restart resets to 0–0, keeps the name, and draws new characters.
  Why now: It completes the Core Journey and makes the kernel's level 1 vs level 5 contrast visible. It depends on slice 2's turns and AI.
  PRD ref: `prd.md > Levels`, `prd.md > Level Scoreboard and End of Game`, `prd.md > The Core Journey` (steps 6, 7)
  Spec ref: `spec.md > Levels (game/levels.ts)`, `spec.md > Game Engine (game/engine.ts)`, `spec.md > UI (ui/)`, `spec.md > Look and Feel`, `spec.md > Verification`
  Build: `nextLevel`, `levelEnd`/`gameOver` scoring, and `restart` (new seed) in `engine.ts`; the level indicator and scoreboard in `columns.ts`; result overlays in `modals.ts`; `effects.ts` (trophy + `canvas-confetti`, robot, tie); robot and trophy sprites.
  Verify (mechanical): `npm test` passes, including level progression, the scoring table (win/loss/tie per level and final), restart state, and the variety test (different seeds give different level-1 characters, the same seed gives the same). `tsc` is clean. A scripted engine run with the local policy plays levels 1–5 to `gameOver` with the correct card counts per level.
  Learner check: Play through to the end (or use the debug seed flag if added for speed). Each level should have more cards, the level-5 AI should clearly remember better, and you should see the right ending screen and be able to restart with new characters.
  Commit: `Add five levels, level scoreboard, and end-of-game screens`

- [x] **4. Closing the browser doesn't lose your game**
  Becomes usable: Reloading or reopening the tab restores the exact board: name, level, scoreboard, collected pairs in each column, face-down cards in the same places, the AI's memory, and whose turn it is. Face-up unmatched cards flip back down, and dice already rolled aren't rolled again.
  Why now: The whole state shape exists after slice 3, so saving it now catches data model mistakes before the layout and Jev work.
  PRD ref: `prd.md > Resume Where You Left Off`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Storage (services/storage.ts)`, `spec.md > Data Model`, `spec.md > Important Failure Modes`
  Build: `services/storage.ts` (save after every action under `memoria:save:v1`, validate on load, try/catch everywhere); resume normalization in the engine (flip unmatched back down, `revealMismatch` → next player's turn); bootstrap from the save in `main.ts`.
  Verify (mechanical): `npm test` passes, including a save mid-turn → load → equal board, a corrupt or old-version save → fresh start, and storage throwing → no crash. `tsc` is clean.
  Learner check: Play a few turns into level 2, close the tab, reopen it, and check that everything is exactly where you left it, with no name prompt.
  Commit: `Save and restore the exact game in the browser`

- [x] **5. It plays well on a phone**
  Becomes usable: On a narrow screen the board takes the full width (4-column grids, level 5 as 4×7 with no horizontal scroll). Names and level wins sit above the board, and tapping a name opens a modal with that player's pairs this level. Dice roll with a tap.
  Why now: All the screens exist, so the responsive pass happens once over the finished UI.
  PRD ref: `prd.md > Screens and Layout`, `prd.md > Levels` ("Level 5's 28 cards fit on a phone screen")
  Spec ref: `spec.md > Levels (game/levels.ts)`, `spec.md > UI (ui/)`, `spec.md > Look and Feel`, `spec.md > Important Failure Modes`
  Build: Responsive CSS grids from `levels.ts` (desktop/phone columns), viewport-based card sizing with `min()`, the phone header layout in `columns.ts`, and the player details modal in `modals.ts`.
  Verify (mechanical): `tsc` is clean and `npm test` passes; a jsdom or build check confirms the grid column counts per level; the production `npm run build` succeeds. At 360 px wide in browser devtools, level 5 has no horizontal overflow (`document.documentElement.scrollWidth <= innerWidth`).
  Learner check: Open the dev server on your phone (or devtools at 360 px), play into level 5, and tap a name to see the details modal. Nothing should need horizontal scrolling.
  Commit: `Make the game responsive for phones`

- [x] **6. Jev chooses the AI's moves, with a safe fallback**
  Becomes usable: Under `vercel dev` with a TypeSafe key, the AI's picks come from Jev. The AI brain indicator shows "Jev 82%", or "Rules" when Jev is slow, fails, answers invalidly, or isn't confident. Without a key, or with `?ai=local`, the game plays exactly as before.
  Why now: Jev is the highest external risk, but the key isn't available yet. Slices 1–5 don't depend on it because the AI Player already has the fallback interface, so this goes last and the game is complete either way.
  PRD ref: `prd.md > The Game AI (the Kernel)`
  Spec ref: `spec.md > Server Function (api/ai-move.ts)`, `spec.md > Jev Client (services/jevClient.ts)`, `spec.md > AI Player (ai/aiPlayer.ts)`, `spec.md > Jev by TypeSafe`, `spec.md > Where It Runs and How Someone Tries It`, `spec.md > Important Failure Modes`
  Build: `api/ai-move.ts` (body validation, exported question builder, `@typesafe-ai/sdk` call), `services/jevClient.ts` (3 s timeout), and Jev in `aiPlayer.ts` (validation, 0.5 confidence gate, fallback, `?ai=local`). Add the AI brain indicator in `columns.ts`, a `dev:full` script, and the Jev run instructions in the README.
  Verify (mechanical): `npm test` passes, including the question builder, body validation, and aiPlayer choosing Jev on a valid confident answer and falling back on a timeout, an error, an invalid position, or low confidence (SDK and fetch mocked). `tsc` is clean. With a key: `vercel dev` plus a real `POST /api/ai-move` returns a valid position and confidence, and the latency gets recorded. Without a key: the endpoint returns an error and the game falls back to Rules. If the key still isn't available, record that under Revisions and leave the real-call check for when it is.
  Learner check: Add your key to `.env.local`, run `vercel dev`, open http://localhost:3000, and watch the AI brain indicator during the AI's turns. Then stop Jev (remove the key or add `?ai=local`) and confirm the game keeps playing.
  Commit: `Let Jev choose the AI's moves with a rules fallback`

## Hands-on Checkpoints

- [x] Early usable behavior explored — after slice 2 (a full level 1 against the forgetful AI; feedback can still shape levels, look, and pacing)
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence:
Route and stops:
Edit outcome:
Reflection:
Activity mode:

## Revisions

- Desktop layout moved the player and AI cards into a top HUD row beside the level/turn/dice stack, with the board full width below — the side columns squeezed the cards at higher levels (slice 3 review).
- Dice throw once per press and a tie waits for another press, instead of auto re-rolling — the learner wanted more participation (slice 2 review).
- The game ends early once decided (best of 5), instead of always playing all 5 levels — the learner noticed a 3–1 lead after level 4 made level 5 pointless. Tradeoff accepted: a lopsided game may never reach the level-5 AI, so the demo recording should use a close game.
- Jev option descriptions now spell out what the AI's memory implies for each card, instead of only "remembered: character N" — live calls showed Jev picked the remembered partner at 81% with bare labels and 98% with explicit ones; first-card picks stay low-confidence and go to the rules player via the 0.5 gate.
- Real Jev calls were verified by running the actual `api/ai-move.ts` handler through Vite's SSR loader with the key from `.env.local`, because the Vercel CLI isn't logged in on this machine; `vercel dev` end to end is left to the learner check.
- The learner linked the Vercel project `memoria` and uploaded `TYPESAFE_API_KEY` themselves. On the deployed app the AI brain label showed "Jev 62%", and `?ai=local` kept the game playing on Rules (slice 6 learner check).
- The Vercel build logs TS2688 for the `node` and `vite/client` types while compiling `api/ai-move.ts`. It's a non-blocking type check, the build completes, and Jev works in production. Left as is.
- The per-deployment URLs asked visitors to log in (Vercel Deployment Protection). The public production domain is the one to share.
- Welcome modal text enlarged (the name field is 16px, which also stops the iPhone from zooming in), and the README now explains the AI brain label states and the memory chance per level (learner feedback during the slice 6 check).
