import "./style.css";
import {
  createInitialState,
  getEligibleEvents,
  applyChoice,
  checkEnding,
  advanceWeek,
} from "./engine";
import { endings } from "./events";
import type { GameState, Event, Choice, Ending, ResourceKey } from "./types";

const RESOURCE_ORDER: ResourceKey[] = ["progress", "confidence", "trust", "energy"];
const RESOURCE_LABELS: Record<ResourceKey, string> = {
  progress: "Progress",
  confidence: "Confidence",
  trust: "Trust",
  energy: "Energy",
};

const app = document.querySelector<HTMLDivElement>("#app")!;

let state: GameState = createInitialState();
let currentEvent: Event | null = null;

interface PendingOutcome {
  summary: string;
  deltas: { key: ResourceKey; before: number; after: number }[];
  endsRun: boolean;
}

let pending: PendingOutcome | null = null;

function resourceDeltas(
  before: Record<ResourceKey, number>,
  after: Record<ResourceKey, number>
) {
  return RESOURCE_ORDER.filter((key) => before[key] !== after[key]).map((key) => ({
    key,
    before: before[key],
    after: after[key],
  }));
}

function signedDelta(delta: number): string {
  return delta > 0 ? `+${delta}` : `${delta}`;
}

function resourceBand(key: ResourceKey, value: number): "green" | "held" | "slipped" {
  if (key === "confidence") {
    if (value >= 70) return "green";
    if (value >= 50) return "held";
    return "slipped";
  }
  if (value >= 60) return "green";
  if (value >= 40) return "held";
  return "slipped";
}

function resourceStrip(resources: Record<ResourceKey, number>): string {
  return RESOURCE_ORDER.map(
    (key) =>
      `<span class="resource ${resourceBand(key, resources[key])}">${RESOURCE_LABELS[key]}: ${resources[key]}</span>`
  ).join("");
}

function finishQuarter() {
  renderEnding(checkEnding(state) ?? endings[endings.length - 1]);
}

function render() {
  if (state.week > 6) {
    finishQuarter();
    return;
  }

  const eligible = getEligibleEvents(state);
  currentEvent = eligible.length > 0 ? eligible[0] : null;

  if (!currentEvent) {
    if (state.week >= 6) {
      finishQuarter();
      return;
    }
    state = advanceWeek(state);
    render();
    return;
  }

  app.innerHTML = `
    <div class="desktop">
      <header>
        <div class="week">Week ${state.week}</div>
        <div class="resources">${resourceStrip(state.resources)}</div>
      </header>
      <main>
        <h2>${currentEvent.title}</h2>
        <p>${currentEvent.text}</p>
        ${
          currentEvent.slots?.length
            ? `<ul class="slots">${currentEvent.slots.map((s) => `<li>${s}</li>`).join("")}</ul>`
            : ""
        }
        <div class="choices">
          ${currentEvent.choices
            .map(
              (c, i) =>
                `<button data-choice="${i}">${c.text}</button>`
            )
            .join("")}
        </div>
        ${
          state.history.length > 0
            ? `<div class="history"><small>Last: ${
                state.history[state.history.length - 1].summary
              }</small></div>`
            : ""
        }
      </main>
    </div>
  `;

  app.querySelectorAll("button[data-choice]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number((btn as HTMLElement).dataset.choice);
      const choice = currentEvent!.choices[idx];
      handleChoice(choice);
    });
  });
}

function handleChoice(choice: Choice) {
  if (!currentEvent) return;
  const before = { ...state.resources };
  state = applyChoice(state, currentEvent, choice);
  pending = {
    summary: choice.outcomeText ?? choice.text,
    deltas: resourceDeltas(before, state.resources),
    endsRun: Boolean(choice.endsRun) || state.week >= 6,
  };
  renderOutcome();
}

function renderOutcome() {
  if (!pending) return;
  const continueLabel = pending.endsRun ? "See the review" : "Next week";
  const deltaLines = pending.deltas
    .map(
      (d) =>
        `<li>${RESOURCE_LABELS[d.key]} ${signedDelta(d.after - d.before)} → ${d.after}</li>`
    )
    .join("");

  app.innerHTML = `
    <div class="desktop outcome">
      <header>
        <div class="week">Week ${state.week}</div>
        <div class="resources">${resourceStrip(state.resources)}</div>
      </header>
      <main>
        <h2>After that</h2>
        <p>${pending.summary}</p>
        ${deltaLines ? `<ul class="deltas">${deltaLines}</ul>` : ""}
        <div class="choices">
          <button id="continue">${continueLabel}</button>
        </div>
      </main>
    </div>
  `;

  document.getElementById("continue")?.addEventListener("click", continueAfterOutcome);
}

function continueAfterOutcome() {
  const shouldEnd = pending?.endsRun ?? false;
  pending = null;
  if (shouldEnd) {
    finishQuarter();
    return;
  }
  state = advanceWeek(state);
  render();
}

function customerLine(progress: number): string {
  return progress >= 60 ? "A customer was helped." : "Customer outcome: not on the slide.";
}

function renderEnding(ending: Ending) {
  const last = state.history[state.history.length - 1];
  const green = state.resources.confidence;
  app.innerHTML = `
    <div class="desktop ending">
      <h1>${ending.title}</h1>
      <p>${ending.text}</p>
      <div class="share-card ${ending.id}">
        <p class="share-kicker">Quarterly review</p>
        <p class="share-green">${green}<span>%</span></p>
        <p class="share-caption">How green you stayed</p>
        <h3>${ending.shareCard.headline}</h3>
        <ul>
          ${ending.shareCard.lines.map((l) => `<li>${l}</li>`).join("")}
        </ul>
        <p class="share-customer">${customerLine(state.resources.progress)}</p>
        ${last ? `<p class="decision">Decision that mattered: ${last.summary}</p>` : ""}
      </div>
      <button id="restart">Restart</button>
    </div>
  `;
  document.getElementById("restart")?.addEventListener("click", () => {
    pending = null;
    state = createInitialState();
    render();
  });
}

render();
