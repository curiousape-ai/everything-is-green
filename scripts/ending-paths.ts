import {
  createInitialState,
  getEligibleEvents,
  applyChoice,
  checkEnding,
  advanceWeek,
} from "../src/engine.ts";

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

const first = runOnce();
const second = runOnce();
const mismatches = first.filter((row) => row.ending !== row.expected);
const firstSnap = JSON.stringify(snapshot(first));
const secondSnap = JSON.stringify(snapshot(second));
const stable = firstSnap === secondSnap;
const ok = mismatches.length === 0 && stable;

const report = {
  ok,
  stable,
  results: first,
};

console.log(JSON.stringify(report, null, 2));

if (!ok) {
  process.exit(1);
}
