import { getImplementedMechanicMeta } from "./catalog.js";
import type { MechanicDefinition } from "./types.js";

export const mitigationAgency: MechanicDefinition = {
  ...getImplementedMechanicMeta("mitigation-agency"),
  id: "mitigation-agency",
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
        description: "Spend 1 charge: gain 2 guard and +18 hit chance for your next attack.",
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
