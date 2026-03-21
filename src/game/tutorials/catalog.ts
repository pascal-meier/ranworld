import type { NodeKind, TutorialId } from "../types.js";

export interface TutorialItem {
  heading: string;
  body: string;
  nodeKind?: NodeKind;
}

export interface TutorialDefinition {
  id: TutorialId;
  title: string;
  intro: string;
  confirmLabel: string;
  minimizedLabel: string;
  items: TutorialItem[];
}

const tutorialCatalog: Record<TutorialId, TutorialDefinition> = {
  "map-basics": {
    id: "map-basics",
    title: "SURFACE BRIEFING",
    intro: "Each planet shows two route options at a time. Pick one node, resolve it, then continue toward the final approach.",
    confirmLabel: "OKAY",
    minimizedLabel: "INFO",
    items: [
      {
        heading: "COMBAT",
        body: "Risk taking damage. Winning grants +1 supply and moves you forward.",
        nodeKind: "combat",
      },
      {
        heading: "EVENT",
        body: "Choose between a safe repair and a risky archive scan.",
        nodeKind: "event",
      },
      {
        heading: "REWARD",
        body: "Pick 1 of 3 upgrade packages. These gains belong to the current planet.",
        nodeKind: "reward",
      },
      {
        heading: "BOSS",
        body: "Beat the boss to keep this planet's reward-node gains and earn extra archive.",
        nodeKind: "boss",
      },
      {
        heading: "FLEE",
        body: "Skip the boss and move on, but lose this planet's reward-node gains.",
        nodeKind: "flee",
      },
    ],
  },
};

export function getTutorialDefinition(id: TutorialId): TutorialDefinition {
  return tutorialCatalog[id];
}
