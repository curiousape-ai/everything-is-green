import type { GameState, Event, Choice, Condition, Ending } from "./types";
import { events, endings } from "./events";

export function createInitialState(): GameState {
  return {
    week: 1,
    resources: {
      progress: 40,
      confidence: 50,
      trust: 50,
      energy: 70,
    },
    flags: {},
    relationships: {
      engineer: 0,
      dependencyLead: 0,
      manager: 0,
    },
    promises: [],
    history: [],
  };
}

function matchesCondition(state: GameState, cond: Condition): boolean {
  switch (cond.type) {
    case "week":
      if (cond.min !== undefined && state.week < cond.min) return false;
      if (cond.max !== undefined && state.week > cond.max) return false;
      return true;
    case "resource": {
      const val = state.resources[cond.key];
      if (cond.min !== undefined && val < cond.min) return false;
      if (cond.max !== undefined && val > cond.max) return false;
      return true;
    }
    case "flag":
      return state.flags[cond.key] === cond.equals;
    case "relationship":
      return (state.relationships[cond.characterId] ?? 0) >= (cond.min ?? 0);
    case "promise": {
      const p = state.promises.find((pr) => pr.id === cond.id);
      if (!p) return false;
      if (cond.fulfilled !== undefined) return p.fulfilled === cond.fulfilled;
      return true;
    }
    case "notSeen":
      return !state.history.some((h) => h.eventId === cond.eventId);
    default:
      return true;
  }
}

export function getEligibleEvents(state: GameState): Event[] {
  return events.filter((ev) => {
    if (!ev.conditions) return true;
    return ev.conditions.every((c) => matchesCondition(state, c));
  });
}

export function applyChoice(state: GameState, event: Event, choice: Choice): GameState {
  const next: GameState = structuredClone(state);

  if (choice.effects) {
    for (const eff of choice.effects) {
      if (eff.type === "resource") {
        next.resources[eff.key] = Math.max(
          0,
          Math.min(100, next.resources[eff.key] + eff.delta)
        );
      } else if (eff.type === "flag") {
        next.flags[eff.key] = eff.value;
      } else if (eff.type === "relationship") {
        next.relationships[eff.characterId] =
          (next.relationships[eff.characterId] ?? 0) + eff.delta;
      }
    }
  }

  if (choice.sets) {
    Object.assign(next.flags, choice.sets);
  }

  if (choice.relationshipDeltas) {
    for (const [id, delta] of Object.entries(choice.relationshipDeltas)) {
      next.relationships[id] = (next.relationships[id] ?? 0) + delta;
    }
  }

  if (choice.addsPromise) {
    next.promises.push({
      ...choice.addsPromise,
      madeOnWeek: next.week,
    });
  }

  const summary = choice.outcomeText ?? choice.text;
  next.history.push({
    week: next.week,
    eventId: event.id,
    choiceId: choice.id,
    summary,
  });

  return next;
}

export function checkEnding(state: GameState): Ending | undefined {
  for (const ending of endings) {
    if (ending.conditions.every((c) => matchesCondition(state, c))) {
      return ending;
    }
  }
  return undefined;
}

export function advanceWeek(state: GameState): GameState {
  const next = structuredClone(state);
  next.week += 1;
  return next;
}
