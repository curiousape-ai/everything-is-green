# Everything Is Green

A browser-based narrative strategy game about delivering something useful inside a company that keeps changing what success means.

**Status:** Playable six-week quarter. Four endings, a consequence screen, and a review slide.

## Prototype question

Does the player recognise the situation, care about the choice, understand the consequence and want to try another approach?

## Run locally

```bash
npm install
npm run dev
```

## Structure

- `src/types.ts` — GameState, Event, Choice, Effect, Condition
- `src/events.ts` — Authored events and endings
- `src/engine.ts` — Eligibility, effects, history, week advance
- `src/main.ts` — Week loop, consequence screen, review slide

Events are data. Adding or changing one should be a small, reviewable change.

## First slice

Six weeks: a late dependency, the original date, Status Monday or a quiet fix that surfaces, a restructure, time for one of three unless you take the evening, and a review that follows the restructure. Four endings. After each choice the player sees the cost before the next week or the slide.
