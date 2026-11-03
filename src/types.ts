export type ResourceKey = "progress" | "confidence" | "trust" | "energy";

export interface GameState {
  week: number;
  resources: Record<ResourceKey, number>;
  flags: Record<string, boolean | number | string>;
  relationships: Record<string, number>;
  promises: Promise[];
  history: HistoryEntry[];
  ended?: string;
}

export interface Promise {
  id: string;
  description: string;
  madeOnWeek: number;
  dueWeek?: number;
  fulfilled?: boolean;
}

export interface HistoryEntry {
  week: number;
  eventId: string;
  choiceId: string;
  summary: string;
}

export type Effect =
  | { type: "resource"; key: ResourceKey; delta: number }
  | { type: "flag"; key: string; value: boolean | number | string }
  | { type: "relationship"; characterId: string; delta: number };

export type Condition =
  | { type: "week"; min?: number; max?: number }
  | { type: "resource"; key: ResourceKey; min?: number; max?: number }
  | { type: "flag"; key: string; equals: boolean | number | string }
  | { type: "relationship"; characterId: string; min?: number }
  | { type: "promise"; id: string; fulfilled?: boolean }
  | { type: "notSeen"; eventId: string };

export interface Choice {
  id: string;
  text: string;
  effects?: Effect[];
  sets?: Partial<GameState["flags"]>;
  relationshipDeltas?: Record<string, number>;
  addsPromise?: Omit<Promise, "madeOnWeek">;
  schedules?: { eventId: string; delayWeeks: number }[];
  outcomeText?: string;
  endsRun?: boolean;
}

export interface Event {
  id: string;
  title: string;
  conditions?: Condition[];
  weight?: number;
  text: string;
  tags?: string[];
  slots?: string[];
  choices: Choice[];
  schedules?: { eventId: string; delayWeeks: number }[];
}

export interface Ending {
  id: string;
  title: string;
  conditions: Condition[];
  text: string;
  shareCard: {
    headline: string;
    lines: string[];
  };
}
