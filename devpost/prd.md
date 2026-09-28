---
doc: prd
status: approved
---
<!-- Canonical English version. Spanish copy: prd.es.md -->

# MemorIA — Product Requirements

A retro, pixelated Rick and Morty memory game in the browser where you play 5 turn-based levels against a game AI whose memory improves each level; whoever wins more levels wins the game.
Source: `scope.md > The Unique Kernel`, `scope.md > The Core Loop`.

## The Core Journey

1. The player opens MemorIA in the browser (desktop, tablet, or phone).
2. The **welcome modal** appears: they enter their name and read the instructions (they'll play against a game AI, the difficulty and the AI's intelligence rise every level, there are 5 levels, and whoever wins more levels wins the game).
3. **Level 1** starts: 12 cards face down on the board.
4. **Dice roll:** the player rolls with a key press and the AI rolls at the same time. The higher roll goes first. On a tie, they roll again.
5. **Turns:** the active player flips two cards. If they match, the pair goes to their column and they keep playing. If not, the cards stay visible for a few seconds (depending on the level), flip back, and the turn passes. A pointing hand shows whose turn it is; on the AI's turn, the hand is what flips its cards.
6. **End of level** (no cards left): whoever collected more pairs wins the level and scores one point on the **level scoreboard**. A win, loss, or tie message is shown. On a tie, nobody scores. In every case, play moves on to the next level.
7. **End of game** (after level 5): whoever has more level wins takes the game. If the player wins → **a shiny yellow trophy spinning with confetti**. If the AI wins → **a little robot raising the trophy**, showing the AI won. If they're tied on levels → a tie message. In all three cases, the player can restart the game from level 1.
8. If they close the browser and come back, the game resumes exactly where they left off.

## Screens and Layout

A single page with modals on top; there are no other screens. Responsive: playable on desktop, tablet, and phone.

- **Welcome modal:** name field, instructions, and a start button.
- **Game screen (desktop/tablet):** the card board in the center, the player's column on one side and the AI's on the other. Each column shows the name, pairs won in the current level, and levels won. The current level and the dice roll are also visible.
- **Game screen (phone):** the board takes the full width. The player's and AI's names sit above the board, with each one's levels won visible. Tapping a name opens a modal with that player's details (pairs collected in the current level).
- **Overlay messages on the board:** each level's result (win, loss, or tie) and the final game result.

## Look and Feel

- **Style:** a '90s video game, pixelated and colorful.
- **Cards:** Rick and Morty characters from the [Rick and Morty API](https://rickandmortyapi.com) with a **pixelated** look so they match the retro aesthetic. If the API fails, retro number-and-color tiles replace them. *(Changed in `4-spec`: originally ARASAAC pictograms.)*
- **Signature details:** a pointing hand that marks the turn and plays for the AI, a spinning yellow trophy with confetti when the player wins, and a little robot holding the trophy when the AI wins.
- The name is written **MemorIA**, with "IA" capitalized.
- **Language:** all in-game copy is in English.
- No specific typeface or color palette was defined; retro, pixelated type and bright colors consistent with the above are enough.

## Features and Behavior

### Welcome and Instructions
- [ ] On first visit, a modal asks for the name and explains: the opponent is a game AI, difficulty rises every level, there are 5 levels, and whoever wins more levels wins the game.
- [ ] The game can't start without a name.
- [ ] The entered name appears in the player's column (or in the header, on phone).

### Dice Roll
- [ ] At the start of each level, the player rolls with a key press (tap on phone) and the AI rolls at the same time. Both results are shown.
- [ ] The higher roll starts the level.
- [ ] On a tie, they roll again until one is higher.

### Turns and Pairs
- [ ] Cards can only be flipped on the player's turn; during the AI's turn the board ignores the player's clicks/taps.
- [ ] A matched pair goes to the column of whoever found it, and that player keeps playing.
- [ ] A missed pair stays visible for the level's time (see **Levels**), flips back, and the turn passes.
- [ ] A pointing hand or arrow shows whose turn it is. On the AI's turn, the hand moves and flips the cards, as if the AI were playing.

### The Game AI (the Kernel)
Source: `scope.md > The Unique Kernel`.
- The AI "sees" every card that gets flipped, both its own and the player's, but remembers them with a probability that rises each level. It uses what it remembers to try to make matches.
- [ ] **Level 1:** the AI visibly forgets often. It flips cards whose match has already been seen and misses.
- [ ] **Level 5:** when both cards of a pair have already been seen, the AI almost always finds it.
- [ ] Playing level 1 and level 5, an observer can tell at a glance that the level 5 AI makes far fewer mistakes.
- The memory is ours (rules and probabilities); the move is chosen by **Jev**, a typed-decision AI model by TypeSafe, which only sees what the AI remembers. If Jev fails or isn't confident, a local rules player chooses. The instructions say so. *(Changed in `4-spec`.)*

### Levels

| Level | Cards | Pairs | Missed-pair visible time |
|---|---|---|---|
| 1 | 12 | 6 | 5 s |
| 2 | 16 | 8 | 4.5 s |
| 3 | 20 | 10 | 4 s |
| 4 | 24 | 12 | 3.5 s |
| 5 | 28 | 14 | 3 s |

- [ ] Each level has the number of cards in the table, and each character appears exactly twice, shuffled.
- [ ] Characters vary between games: after the first start or a restart, level 1 (and every level) shows a different random set of characters, not always the same ones. *(Added in `4-spec`.)*
- [ ] The current level is shown on screen.
- [ ] The AI's memory improves each level (see **The Game AI**).
- [ ] Level 5's 28 cards fit on a phone screen with no horizontal scrolling.

### Level Scoreboard and End of Game
- [ ] When a level ends, whoever collected more pairs gets 1 level win on the scoreboard, and a win or loss message appears over the board.
- [ ] Tied pairs → tie message, nobody scores, and play moves to the next level.
- [ ] Each level is played once: after any result, play moves to the next.
- [ ] Best of 5: the game ends early as soon as the lead in level wins is bigger than the levels left (e.g. 3–0 after level 3, 3–1 after level 4), with a "The game is decided!" message before the final screen. *(Added during `5-build`.)*
- [ ] The level scoreboard (player vs. AI) is always visible.
- [ ] After level 5, whoever has more level wins takes the game. If the player wins → shiny yellow trophy spinning with confetti.
- [ ] If the AI wins → a little robot raising the trophy, with a message that the AI won.
- [ ] If tied on level wins → tie message.
- [ ] All three end screens offer a restart: back to level 1 with the scoreboard at 0–0 and the same name.

### Resume Where You Left Off
- [ ] If the player closes the browser and comes back, the game restores **the exact board**: name, level, level scoreboard, the pairs already found and which column they're in, and the face-down cards in the same positions. It doesn't ask for the name again.

## States and Boundaries

- **First visit:** welcome modal with name and instructions.
- **Returning:** the exact board where they left off (in that browser). It resumes on the turn of whoever was playing; if two unmatched cards were face up, they flip back down. If the level's dice were already rolled, they aren't rolled again.
- **AI's turn:** the player can't interact with the board.
- **Dice tie:** roll again.
- **Tied pairs in a level:** tie message, nobody scores, next level.
- **End of game:** trophy with confetti (player wins), little robot with the trophy (AI wins), or tie message, always with a restart option.
- **One player per browser:** no accounts; progress lives on that device.

## Product Decisions

- **Name "MemorIA"**: "IA" capitalized, as a nod to artificial intelligence ("IA" in Spanish).
- **Dice instead of camera rock-paper-scissors**: solves the same thing (who goes first) without the camera's cost and risk.
- **Difficulty grows three ways**: more cards, better AI memory, and less time to see a missed pair.
- **Times from 5 s down to 3 s**: level 1 is relaxed and level 5 is demanding, without freezing play the way 7 s would.
- **A match earns another turn**, like the tabletop game.
- **Lives were removed and replaced with a level scoreboard**: lives (lose → replay the level) conflicted with "whoever wins more levels wins the game." Now each level is played once and the scoreboard decides.
- **A tied level scores for nobody** and play continues to the next level.
- **Robot ending**: if the AI wins, a little robot holds the trophy; on a tie, a tie message and a restart option.
- **Pointing hand for the AI**: makes the AI feel like a real player and reads clearly in the video.
- **Phone: names on top, details in a modal**, so the board uses the full width.
- **'90s retro aesthetic with pixelated characters.**
- **Rick and Morty instead of ARASAAC** (`4-spec`): the learner accepted the copyright risk; images load live from the API and are credited.
- **Jev picks the AI's moves** (`4-spec`), with the memory kept in our code and a rules fallback.
- **Returning restores the exact board**, including each player's collected pairs.
- **Offline play is out** of this proof of concept.
- **All in-game copy in English** (modal, instructions, messages, buttons): the hackathon is judged by an English-speaking community.
- **Video:** sped-up segments to show levels 1 through 5 in about 3 minutes.

## What We're Building

- The welcome modal with name and instructions.
- The responsive board with pixelated Rick and Morty characters (fallback tiles if the API fails).
- The dice roll, with tie re-rolls.
- Player/AI turns with the pointing hand, pairs to each column, and an extra turn on a match.
- The game AI with memory that improves across the 5 levels.
- The 5 levels (12 to 28 cards) with 5 s to 3 s reveal times.
- The level scoreboard, per-level win/loss/tie messages, and the final result screens.
- Exact-board resume in the same browser.
- Credit for the character images (Rick and Morty API; © Adult Swim / Warner Bros. Discovery).

## Deferred From the POC

- **Camera rock-paper-scissors:** a second game inside the game (permissions, hand recognition, no-camera fallback).
- **Accounts, global leaderboard, or cross-device play:** progress lives only in that browser.
- **Offline play:** would require bundling images and a local-only AI; saved for a later version.

## Possible Later Enhancements

- More levels and other card sets or themes.
- Retro sound effects or music.
- Bringing lives back, if there's a way to combine them with the scoreboard.

## Non-Goals

- **No chatbot or conversational language model:** Jev only returns a typed choice with probabilities; the memory curve is our own rules and probabilities.
- **No human vs. human multiplayer.**

## Open Questions

- **Exact AI memory probabilities per level:** can be settled in `4-spec` or tuned during the build. The criterion is that the difference between level 1 and level 5 is obvious at a glance.
