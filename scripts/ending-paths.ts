import {
  createInitialState,
  getEligibleEvents,
  applyChoice,
  checkEnding,
  advanceWeek,
} from "../src/engine.ts";
import { JOB_LABELS, PEOPLE, relationshipLine } from "../src/desk.ts";

const PATHS: { name: string; choices: string[]; ending: string }[] = [
  {
    name: "useful",
    choices: [
      "report-early",
      "propose-smaller",
      "show-comments",
      "protect-engineer",
      "finish-work",
      "show-the-change",
    ],
    ending: "useful-release",
  },
  {
    name: "board-overlap",
    choices: [
      "report-early",
      "promise-original",
      "show-comments",
      "protect-engineer",
      "do-all-three",
      "show-and-own",
    ],
    ending: "board-noticed",
  },
  {
    name: "still-green",
    choices: [
      "keep-green",
      "propose-smaller",
      "hold-date",
      "document-and-wait",
      "negotiate-meeting",
      "leave-appendix",
    ],
    ending: "still-green",
  },
  {
    name: "honest",
    choices: [
      "report-early",
      "propose-smaller",
      "show-comments",
      "neutral-note",
      "negotiate-meeting",
      "hold-pack",
    ],
    ending: "honest-account",
  },
  {
    name: "trust-blocks",
    choices: [
      "keep-green",
      "propose-smaller",
      "hold-date",
      "neutral-note",
      "finish-work",
      "file-green",
    ],
    ending: "still-green",
  },
];

function play(choiceIds: string[]) {
  let state = createInitialState();
  const seen: string[] = [];
  for (const choiceId of choiceIds) {
    const event = getEligibleEvents(state)[0];
    if (!event) {
      throw new Error(`no event at week ${state.week} looking for ${choiceId}`);
    }
    const choice = event.choices.find((c) => c.id === choiceId);
    if (!choice) {
      throw new Error(
        `week ${state.week} ${event.id} has no ${choiceId}; options: ${event.choices.map((c) => c.id).join(", ")}`
      );
    }
    seen.push(`${state.week}:${event.id}:${choice.id}`);
    state = applyChoice(state, event, choice);
    if (state.week >= 6) break;
    state = advanceWeek(state);
  }
  const ending = checkEnding(state);
  return {
    ending: ending?.id ?? null,
    resources: {
      progress: state.resources.progress,
      confidence: state.resources.confidence,
      trust: state.resources.trust,
    },
    seen,
  };
}

function runOnce() {
  return PATHS.map((path) => {
    const result = play(path.choices);
    return {
      name: path.name,
      expected: path.ending,
      ending: result.ending,
      resources: result.resources,
      seen: result.seen,
    };
  });
}

function snapshot(rows: ReturnType<typeof runOnce>) {
  return rows.map((row) => ({
    name: row.name,
    ending: row.ending,
    resources: row.resources,
  }));
}

function reportEarly() {
  const before = createInitialState();
  const event = getEligibleEvents(before)[0];
  const choice = event?.choices.find((c) => c.id === "report-early");
  if (!event || !choice) {
    throw new Error("report-early is not on the first eligible event");
  }
  const after = applyChoice(before, event, choice);
  const delta =
    (after.relationships.dependencyLead ?? 0) -
    (before.relationships.dependencyLead ?? 0);
  return {
    dependencyLead: after.relationships.dependencyLead,
    delta,
    line: relationshipLine("dependencyLead", delta),
  };
}

const first = runOnce();
const second = runOnce();
const relFirst = reportEarly();
const relSecond = reportEarly();
const mismatches = first.filter((row) => row.ending !== row.expected);
const firstSnap = JSON.stringify(snapshot(first));
const secondSnap = JSON.stringify(snapshot(second));
const stable = firstSnap === secondSnap;
const relStable = JSON.stringify(relFirst) === JSON.stringify(relSecond);
const deskOk =
  JOB_LABELS.progress === "the work on the desk" &&
  JOB_LABELS.confidence === "how green the slide looks" &&
  JOB_LABELS.trust === "whether people answer" &&
  JOB_LABELS.energy === "how late it is" &&
  PEOPLE.some((p) => p.name === "the engineer") &&
  PEOPLE.some((p) => p.name === "the dependency lead") &&
  PEOPLE.some((p) => p.name === "the manager") &&
  relFirst.dependencyLead === 15 &&
  relFirst.line.includes("dependency lead") &&
  relFirst.line.includes("+15");
const ok =
  mismatches.length === 0 && stable && relStable && deskOk;

const report = {
  ok,
  stable,
  relStable,
  deskOk,
  reportEarly: relFirst,
  labels: JOB_LABELS,
  people: PEOPLE.map((p) => p.name),
  results: first,
};

console.log(JSON.stringify(report, null, 2));

if (!ok) {
  process.exit(1);
}
