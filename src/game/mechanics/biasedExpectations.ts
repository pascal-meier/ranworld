import type { MechanicDefinition } from "./types.js";

export const biasedExpectations: MechanicDefinition = {
  id: "biased-expectations",
  name: "Biased Expectations",
  shortLabel: "Bias",
  category: "Presentation",
  summary: "The surfaced hit chance is nudged away from the underlying value.",
  detail:
    "Perceived fairness can drift from actual fairness when the game frames an outcome with a biased expectation.",
  effectText: "Attack previews show hit chance with a hidden bias of -12, -8, +8, or +12 percentage points.",
  onBuildCombat: (context, combat) => {
    combat.expectationBias = context.rng.pick([-12, -8, 8, 12]);
  },
  onPreviewCombatAction: ({ state }, preview, action) => {
    if (action.kind !== "attack" || preview.actualHitChance === null) {
      return preview;
    }

    const shown = Phaser.Math.Clamp(
      preview.actualHitChance + state.combat!.expectationBias,
      5,
      95
    );

    return {
      ...preview,
      shownHitChance: shown,
      note: `${preview.note} Display bias ${state.combat!.expectationBias >= 0 ? "+" : ""}${state.combat!.expectationBias}%.`.trim(),
    };
  },
  getDebugLines: ({ state }) => {
    if (!state.combat) {
      return ["Bias: waiting for a combat preview."];
    }

    return [
      `Bias: displayed hit is shifted by ${state.combat.expectationBias >= 0 ? "+" : ""}${state.combat.expectationBias}%.`,
    ];
  },
};
