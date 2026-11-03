import type { Event, Ending } from "./types";

export const events: Event[] = [
  {
    id: "dependency-late",
    title: "The dependency is late",
    conditions: [{ type: "week", min: 1, max: 2 }],
    weight: 10,
    text: "The team you depend on has slipped. Their lead says the original date is no longer realistic. Your sponsor has not been told.",
    choices: [
      {
        id: "report-early",
        text: "Report it early and help them unblock.",
        effects: [
          { type: "resource", key: "progress", delta: -5 },
          { type: "resource", key: "confidence", delta: -10 },
          { type: "resource", key: "trust", delta: 5 },
        ],
        relationshipDeltas: { dependencyLead: 15 },
        sets: { helpedDependency: true },
        outcomeText: "You flag the slip and spend time helping. The project moves slower this week. Their lead owes you one.",
      },
      {
        id: "keep-green",
        text: "Keep the project green and quietly fix it.",
        effects: [
          { type: "resource", key: "confidence", delta: 5 },
          { type: "resource", key: "energy", delta: -10 },
        ],
        addsPromise: {
          id: "quiet-fix",
          description: "Promised to resolve the dependency without escalating",
        },
        outcomeText: "The status stays green. You carry the extra work yourself.",
      },
    ],
  },
  {
    id: "sponsor-promise",
    title: "The original date",
    conditions: [{ type: "week", min: 2, max: 3 }],
    weight: 8,
    text: "Your sponsor wants you to promise the original launch date for the board presentation. They know the dependency is shaky but prefer not to hear it.",
    choices: [
      {
        id: "propose-smaller",
        text: "Propose a smaller useful launch instead.",
        effects: [
          { type: "resource", key: "confidence", delta: -5 },
          { type: "resource", key: "progress", delta: 5 },
        ],
        sets: { negotiatedScope: true },
        outcomeText: "They reluctantly agree, provided the presentation still has something to show.",
      },
      {
        id: "promise-original",
        text: "Promise the original date.",
        effects: [{ type: "resource", key: "confidence", delta: 15 }],
        addsPromise: {
          id: "original-date",
          description: "Promised the original launch date",
        },
        outcomeText: "The sponsor is pleased. The date is now yours.",
      },
    ],
  },
  {
    id: "friday-demo-pressure",
    title: "Two slots left",
    conditions: [{ type: "week", min: 5, max: 6 }],
    weight: 15,
    text: "You have two attention slots left. Your engineer needs a decision to finish the change that helps customers. Your manager needs the board slide. A mandatory meeting has just landed in your calendar.",
    choices: [
      {
        id: "finish-work",
        text: "Finish the customer change.",
        effects: [
          { type: "resource", key: "progress", delta: 15 },
          { type: "resource", key: "confidence", delta: -8 },
          { type: "resource", key: "energy", delta: -5 },
        ],
        relationshipDeltas: { engineer: 10 },
        outcomeText: "The change ships. The slide will have to wait. Your engineer is relieved.",
      },
      {
        id: "improve-story",
        text: "Improve the board slide.",
        effects: [
          { type: "resource", key: "confidence", delta: 12 },
          { type: "resource", key: "progress", delta: -5 },
        ],
        addsPromise: {
          id: "demo-ready",
          description: "Promised the demo would look strong",
        },
        outcomeText: "The slide looks healthier. The engineer is still waiting on the decision.",
      },
      {
        id: "negotiate-meeting",
        text: "Negotiate the mandatory meeting.",
        effects: [
          { type: "resource", key: "energy", delta: 5 },
          { type: "resource", key: "trust", delta: 5 },
        ],
        sets: { declinedMeeting: true },
        outcomeText: "You get the afternoon back. Someone upstairs notes the absence.",
      },
      {
        id: "do-all-three",
        text: "Spend the evening doing all three.",
        effects: [
          { type: "resource", key: "progress", delta: 10 },
          { type: "resource", key: "confidence", delta: 8 },
          { type: "resource", key: "energy", delta: -20 },
        ],
        outcomeText: "Everything moves. You are exhausted. The work is done; the cost is not yet visible.",
      },
    ],
  },
  {
    id: "restructure",
    title: "Strategic realignment",
    conditions: [{ type: "week", min: 4, max: 5 }],
    weight: 20,
    text: "A restructure is announced. Both teams move under a new executive. The consultation closes Friday. The new email signatures are already available.",
    choices: [
      {
        id: "protect-engineer",
        text: "Argue to keep your engineer.",
        effects: [{ type: "resource", key: "trust", delta: 10 }],
        sets: { engineerStayed: true },
        outcomeText: "You make the case. It is unclear whether it will stick.",
      },
      {
        id: "document-and-wait",
        text: "Document the current decision trail and wait.",
        effects: [{ type: "resource", key: "confidence", delta: -5 }],
        sets: { documentedTrail: true },
        outcomeText: "The paper trail exists. Institutional memory may not.",
      },
    ],
  },
];

// First match wins. A quarter the board can see belongs to them, even when the work was real.
export const endings: Ending[] = [
  {
    id: "board-noticed",
    title: "The board noticed",
    conditions: [{ type: "resource", key: "confidence", min: 70 }],
    text: "The review goes well. Your name is on the slide. If something useful shipped, it is now evidence for the narrative your sponsor preferred. You have been noticed.",
    shareCard: {
      headline: "Noted by the board",
      lines: ["Dashboard: green", "Name on the slide: yours", "Outcome: Visible"],
    },
  },
  {
    id: "useful-release",
    title: "Something actually improved",
    conditions: [
      { type: "resource", key: "progress", min: 60 },
      { type: "resource", key: "trust", min: 40 },
      { type: "resource", key: "confidence", max: 69 },
    ],
    text: "The smaller release works. A customer benefits. The review mentions the work once, under someone else's name. You have enough trust left to try again next quarter.",
    shareCard: {
      headline: "Customer problem: partly solved",
      lines: ["Dashboard: quiet", "Trust: intact", "Outcome: Useful"],
    },
  },
  {
    id: "still-green",
    title: "Still green",
    conditions: [{ type: "resource", key: "confidence", min: 50 }],
    text: "The dashboard held all quarter. Nothing important failed in public, and nothing important clearly shipped. The review is short. Your name is not in it.",
    shareCard: {
      headline: "Status held",
      lines: ["Exceptions: none recorded", "Attention: none received", "Outcome: Still green"],
    },
  },
  {
    id: "honest-account",
    title: "Failed delivery, honest account",
    conditions: [{ type: "resource", key: "confidence", max: 49 }],
    text: "The delivery does not land, and the dashboard does not hide it. Your account of events and the official explanation are presented side by side. The record exists.",
    shareCard: {
      headline: "Delivery: incomplete",
      lines: ["Dashboard: not green", "Account: on the record", "Outcome: Managed"],
    },
  },
];
