# Everything Is Green

A browser-based narrative strategy game about delivering something useful inside a company that keeps changing what success means.

**Status:** Prototype skeleton. Creative exploration.

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
- `src/main.ts` — Minimal UI loop

Events are data. Adding or changing one should be a small, reviewable change.

## First slice

Includes early dependency and sponsor events, the “two slots left” pressure moment, a midpoint restructure that can read prior flags, and three simple endings with a share card.
