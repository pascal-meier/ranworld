import { getImplementedMechanicMeta } from "./catalog.js";
import type { MechanicDefinition } from "./types.js";

export const progressiveProbabilitySystems: MechanicDefinition = {
  ...getImplementedMechanicMeta("progressive-probability-systems"),
  id: "progressive-probability-systems",
  category: "Rewards",
  summary: "Repeated risky scans become more likely to succeed over time.",
  detail:
    "A failed probabilistic event improves the odds of the next similar attempt, creating a visible climb instead of a flat retry loop.",
  effectText: "Each failed Deep Scan adds +10% to the next scan, up to +30%. Success resets the bonus.",
  onBuildEvent: ({ state }, event) => ({
    ...event,
    options: event.options.map((option) => {
      if (option.id !== "scan-deep" || option.actualChance === undefined) {
        return option;
      }

      const actualChance = Phaser.Math.Clamp(
        option.actualChance + state.player.progressiveScanBonus,
        5,
        95
      );

      return {
        ...option,
        actualChance,
        shownChance: option.shownChance === undefined ? undefined : Phaser.Math.Clamp(option.shownChance + state.player.progressiveScanBonus, 5, 95),
        description: `${option.label === "Deep Scan" ? "" : ""}${actualChance}%: +2 archive shards. Fail: take 4 damage.`,
      };
    }),
  }),
  onAfterEventResolution: ({ state, log }, resolution) => {
    if (resolution.choiceId !== "scan-deep") {
      return;
    }

    if (resolution.success) {
      state.player.progressiveScanBonus = 0;
      log("Progressive Probability reset after a successful Deep Scan.");
      return;
    }

    state.player.progressiveScanBonus = Math.min(state.player.progressiveScanBonus + 10, 30);
    log(`Progressive Probability increased Deep Scan odds to +${state.player.progressiveScanBonus}%.`);
  },
  getDebugLines: ({ state }) => [
    `Prog Odds: current Deep Scan bonus +${state.player.progressiveScanBonus}%.`,
  ],
};
