import { getImplementedMechanicMeta } from "./catalog.js";
import type { MechanicDefinition } from "./types.js";

export const softFailureCompensation: MechanicDefinition = {
  ...getImplementedMechanicMeta("soft-failure-compensation"),
  id: "soft-failure-compensation",
  category: "Fairness",
  summary: "Misses build pity, and one lethal mistake can be softened into a comeback.",
  detail:
    "The system cushions variance after a setback without fully erasing the consequence.",
  effectText: "Misses raise pity up to +30% hit, and one lethal result is converted into a 6 HP comeback.",
  onAdded: ({ state, log }) => {
    state.player.softFailShield = Math.max(state.player.softFailShield, 1);
    log("Soft Failure Compensation armed one revival shield.");
  },
  onPreviewCombatAction: ({ state }, preview, action) => {
    if (action.kind !== "attack" || preview.actualHitChance === null || state.player.pity <= 0) {
      return preview;
    }

    const adjusted = Phaser.Math.Clamp(
      preview.actualHitChance + state.player.pity,
      5,
      98
    );

    return {
      ...preview,
      actualHitChance: adjusted,
      shownHitChance:
        preview.shownHitChance === null
          ? null
          : Phaser.Math.Clamp(preview.shownHitChance + state.player.pity, 5, 98),
      note: `${preview.note} Pity +${state.player.pity}%.`.trim(),
    };
  },
  onAfterCombatAction: ({ state, log }, resolution) => {
    if (resolution.action.kind !== "attack") {
      return;
    }

    if (!resolution.hit) {
      state.player.pity = Math.min(state.player.pity + 10, 30);
      log(`Soft Failure Compensation increased pity to ${state.player.pity}%.`);
      return;
    }

    state.player.pity = Math.max(state.player.pity - 8, 0);
  },
  onBeforeDefeat: ({ state, log }, source) => {
    if (state.player.softFailShield <= 0) {
      return false;
    }

    state.player.softFailShield -= 1;
    state.player.hp = Math.max(state.player.hp, 6);
    state.player.archiveGain += 1;
    log(
      `Soft Failure Compensation prevented a ${source} defeat and granted 1 archive shard.`
    );

    return true;
  },
  getDebugLines: ({ state }) => [
    `Soft Failure: pity bonus ${state.player.pity}%.`,
    `Soft Failure: revival shields ${state.player.softFailShield}.`,
  ],
};
