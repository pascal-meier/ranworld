import { getImplementedMechanicMeta } from "./catalog.js";
import type { MechanicDefinition } from "./types.js";

export const badLuckProtection: MechanicDefinition = {
  ...getImplementedMechanicMeta("bad-luck-protection"),
  id: "bad-luck-protection",
  category: "Safeguards",
  summary: "A miss arms a safety boost for the next risky attack.",
  detail:
    "Instead of erasing the current failure, the system softens the next one by pushing the following attack toward a more reliable range.",
  effectText: "After a missed attack, the next attack gains +18% hit chance. A successful hit clears the protection.",
  onPreviewCombatAction: ({ state }, preview, action) => {
    if (action.kind !== "attack" || preview.actualHitChance === null || state.player.badLuckGuard <= 0) {
      return preview;
    }

    return {
      ...preview,
      actualHitChance: Phaser.Math.Clamp(preview.actualHitChance + 18, 5, 98),
      shownHitChance:
        preview.shownHitChance === null ? null : Phaser.Math.Clamp(preview.shownHitChance + 18, 5, 98),
      note: `${preview.note} Luck guard armed.`,
    };
  },
  onAfterCombatAction: ({ state, log }, resolution) => {
    if (resolution.action.kind !== "attack") {
      return;
    }

    if (resolution.hit) {
      if (state.player.badLuckGuard > 0) {
        log("Bad-Luck Protection discharged on a successful hit.");
      }

      state.player.badLuckGuard = 0;
      return;
    }

    state.player.badLuckGuard = 1;
    log("Bad-Luck Protection armed for the next attack.");
  },
  getDebugLines: ({ state }) => [
    `Luck Guard: ${state.player.badLuckGuard > 0 ? "armed" : "idle"}.`,
  ],
};
