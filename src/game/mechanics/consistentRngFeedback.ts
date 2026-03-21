import { getImplementedMechanicMeta } from "./catalog.js";
import type { MechanicDefinition } from "./types.js";

export const consistentRngFeedback: MechanicDefinition = {
  ...getImplementedMechanicMeta("consistent-rng-feedback"),
  id: "consistent-rng-feedback",
  category: "Feedback",
  summary: "Every risky resolution reports the same stable feedback format.",
  detail:
    "Random outcomes become easier to interpret when the game always explains shown odds, actual odds, and the final result in the same structure.",
  effectText: "Adds explicit feedback lines for combat and event rolls with shown odds, actual odds, and outcome.",
  onAfterCombatAction: (_, resolution) => {
    if (resolution.action.kind !== "attack") {
      return;
    }

    resolution.notes.push(
      `Feedback: shown ${resolution.shownHitChance ?? "n/a"} / actual ${resolution.actualHitChance ?? "n/a"} / ${resolution.hit ? "hit" : "miss"}.`
    );
  },
  onAfterEventResolution: (_, resolution) => {
    if (resolution.actualChance === undefined && resolution.shownChance === undefined) {
      return;
    }

    resolution.notes.push(
      `Feedback: shown ${resolution.shownChance ?? "n/a"} / actual ${resolution.actualChance ?? "n/a"} / ${resolution.success ? "success" : "fail"}.`
    );
  },
  getDebugLines: () => ["RNG Feedback: explicit shown/actual/outcome lines enabled."],
};
