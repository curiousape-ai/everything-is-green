import "./style.css";
import {
  createInitialState,
  getEligibleEvents,
  applyChoice,
  checkEnding,
  advanceWeek,
} from "./engine";
import { endings } from "./events";
import type { GameState, Event, Choice, Ending } from "./types";

const app = document.querySelector<HTMLDivElement>("#app")!;

let state: GameState = createInitialState();
let currentEvent: Event | null = null;

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
        <div class="resources">
          <span>Progress: ${state.resources.progress}</span>
          <span>Confidence: ${state.resources.confidence}</span>
          <span>Trust: ${state.resources.trust}</span>
          <span>Energy: ${state.resources.energy}</span>
        </div>
      </header>
      <main>
        <h2>${currentEvent.title}</h2>
        <p>${currentEvent.text}</p>
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
  state = applyChoice(state, currentEvent, choice);

  if (choice.endsRun || state.week >= 6) {
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
    state = createInitialState();
    render();
  });
}

render();
