---
doc: scope
status: approved
---
<!-- Canonical English version. Spanish copy: scope.es.md -->

# MemorIA

A memory card game with Rick and Morty characters where you take turns against an AI that remembers better and better as you move up levels.

## The Unique Kernel

An **AI with imperfect memory that sharpens level by level**. At level 1 it has a low probability of remembering cards it has already seen and of making a match, so it makes frequent mistakes. That probability goes up every level, and by level 5 it forgets almost nothing. The difference shows in its misses and hits, turn by turn.

## Who It's For

Anyone who wants to play a memory game and test themselves against an opponent that levels up. No narrower audience has been defined; it can be adjusted in `3-prd` if needed.

## The Core Loop

1. The level starts: dice are rolled (the player rolls with a key press and the AI rolls at the same time), and the higher roll goes first.
2. Players take turns flipping two cards. If they match, the pair goes to the column of whoever found it.
3. When no cards are left, whoever collected more pairs wins the level.
4. The level winner scores one point on the level scoreboard (a tie scores nothing), and play moves to the next level: more cards and an AI with better memory. After level 5, whoever won more levels wins the game. *(This originally used 3 lives; they were replaced in `prd.md`.)*

The player comes back to beat the AI on the next level.

## Inspiration & Identity

- [Rick and Morty API](https://rickandmortyapi.com) characters as the card images, shown pixelated. *(Changed in `4-spec`: originally ARASAAC pictograms.)* The images are copyrighted (© Adult Swim / Warner Bros. Discovery): they are loaded live from the API, never stored in the repo, and credited in the game.
- The tabletop memory game: turns, pairs, and each player's own pile of cards.

## Why This Matters to the Learner

A complete pivot after exploring accessibility projects that turned out too large to pin down for a hackathon. This is a clear, fun game that lets the author focus on what they most want to learn: how to work with an AI agent to build something "very functional" with as few failures as possible.

## What "Working" Looks Like

A short video: the dice are rolled, a level 1 game is played, and you see the AI make mistakes and forget cards. Then a higher level, with more cards and an AI that matches far more often. Pairs go to each player's column, someone wins the level and scores on the scoreboard.
**The "that's cool" moment:** the same AI that forgot everything at level 1 flips, at level 5, a pair you saw ten turns ago and takes it from you.
The presentation must make clear how the AI works: an **imperfect memory** (rules and probabilities, our code) that feeds **Jev**, a typed-decision AI model by TypeSafe, which picks the moves. It is not a chatbot. *(Changed in `4-spec`.)*

## The POC Boundary

- Memory game board with pixelated Rick and Morty characters.
- Turn-based player vs. AI match, with pairs going to each player's column. Whoever collects more wins.
- Dice roll (with a key press) to decide who goes first.
- 5 levels: each one adds cards (always an even number) and raises the probability that the AI remembers and matches.
- Level scoreboard: whoever wins more of the 5 levels wins the game.

## Later

- Rock-paper-scissors via camera to decide who goes first. The author likes the idea, but it's a second game inside the game: camera permissions, hand recognition, and handling missing cameras.
- More levels, other image sets or card themes.

## Explicitly Cut

- **Earlier project ideas (Thaís, inclusive math, education without borders):** set aside for being too large or too similar to something that already exists (Khan Academy). The Thaís scope is saved in `scope-tais.md`.
