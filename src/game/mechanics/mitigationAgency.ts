import type { MechanicDefinition } from "./types.js";

export const mitigationAgency: MechanicDefinition = {
  id: "mitigation-agency",
  name: "Mitigation Agency",
  shortLabel: "Mitigation",
  category: "Agency",
  summary: "The run gains stabilize charges that can smooth the next risky roll.",
  detail:
    "Instead of removing randomness, the player earns tools to shape it on purpose.",
  effectText: "Gain 2 stabilize charges and unlock Stabilize, which grants guard and +18 stored focus.",
  onAdded: ({ state, log }) => {
    state.player.mitigationCharges += 2;
    log("Mitigation Agency granted 2 stabilize charges.");
  },
  onBuildCombatActions: ({ state }, actions) => {
    if (state.player.mitigationCharges <= 0) {
      return actions;
    }

    return [
      ...actions,
      {
        id: "stabilize",
        label: `Stabilize (${state.player.mitigationCharges})`,
        description: "Spend a charge for guard and +18 focus on the next attack.",
        kind: "stabilize",
        baseHitChance: 100,
        baseDamage: 0,
        guardGain: 2,
        focusGain: 18,
      },
    ];
  },
  getDebugLines: ({ state }) => [
    `Mitigation: ${state.player.mitigationCharges} stabilize charges remaining.`,
    `Mitigation: current stored focus ${state.player.focus}.`,
  ],
};
