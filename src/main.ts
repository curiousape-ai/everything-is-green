import "./style.css";
import {
  createInitialState,
  getEligibleEvents,
  applyChoice,
  checkEnding,
  advanceWeek,
} from "./engine";
import type { GameState, Event, Choice, Ending } from "./types";

const app = document.querySelector<HTMLDivElement>("#app")!;

let state: GameState = createInitialState();
let currentEvent: Event | null = null;

function render() {
  const ending = state.week > 6 ? checkEnding(state) : undefined;

  if (ending) {
    renderEnding(ending);
    return;
  }

  const eligible = getEligibleEvents(state);
  currentEvent = eligible.length > 0 ? eligible[0] : null;

  if (!currentEvent) {
    // No event this week; advance or end
    if (state.week >= 6) {
      const finalEnding = checkEnding(state) ?? {
        id: "survived",
        title: "Permanent transformation",
        conditions: [],
        text: "You survive the quarter. The title screen returns with a new logo and the same problems.",
        shareCard: { headline: "Outcome: Survived", lines: ["The transformation continues."] },
      };
      renderEnding(finalEnding);
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

  if (choice.endsRun) {
    const ending = checkEnding(state);
    if (ending) {
      renderEnding(ending);
      return;
    }
  }

  // Simple: after choice, advance week
  if (state.week >= 6) {
    const ending = checkEnding(state) ?? {
      id: "survived",
      title: "You made it",
      conditions: [],
      text: "The quarter ends. Something happened. The organisation continues.",
      shareCard: { headline: "Quarter complete", lines: ["See you next quarter."] },
    };
    renderEnding(ending);
    return;
  }

  state = advanceWeek(state);
  render();
}

function renderEnding(ending: Ending) {
  const last = state.history[state.history.length - 1];
  app.innerHTML = `
    <div class="desktop ending">
      <h1>${ending.title}</h1>
      <p>${ending.text}</p>
      <div class="share-card">
        <h3>QUARTERLY PERFORMANCE REVIEW</h3>
        <p><strong>${ending.shareCard.headline}</strong></p>
        <ul>
          ${ending.shareCard.lines.map((l) => `<li>${l}</li>`).join("")}
        </ul>
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
