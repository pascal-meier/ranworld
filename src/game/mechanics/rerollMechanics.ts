import { getImplementedMechanicMeta } from "./catalog.js";
import type { MechanicDefinition } from "./types.js";

export const rerollMechanics: MechanicDefinition = {
  ...getImplementedMechanicMeta("reroll-mechanics"),
  id: "reroll-mechanics",
  category: "Agency",
  summary: "The run gains reroll charges that can redraw the current tactical offer.",
  detail:
    "Instead of accepting the first spread of choices, the player can spend a limited reroll to redraw combat actions, event odds, or reward packages.",
  effectText: "Gain 2 reroll charges. Spend them in combat, events, or rewards to redraw the current offer.",
  onAdded: ({ state, log }) => {
    state.player.rerollCharges += 2;
    log("Re-Roll Mechanics granted 2 reroll charges.");
  },
  getDebugLines: ({ state }) => [
    `Re-Roll: ${state.player.rerollCharges} charges available.`,
  ],
};
