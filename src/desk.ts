import type { ResourceKey } from "./types";

export const JOB_LABELS: Record<ResourceKey, string> = {
  progress: "the work on the desk",
  confidence: "how green the slide looks",
  trust: "whether people answer",
  energy: "how late it is",
};

export const PEOPLE = [
  { id: "engineer", name: "the engineer" },
  { id: "dependencyLead", name: "the dependency lead" },
  { id: "manager", name: "the manager" },
] as const;

export function personName(id: string): string {
  return PEOPLE.find((person) => person.id === id)?.name ?? id;
}

export function signedChange(delta: number): string {
  return delta > 0 ? `+${delta}` : `\u2212${Math.abs(delta)}`;
}

export function relationshipLine(id: string, delta: number): string {
  return `${personName(id)} ${signedChange(delta)}`;
}
