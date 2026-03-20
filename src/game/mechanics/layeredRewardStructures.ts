import type { MechanicDefinition } from "./types.js";

export const layeredRewardStructures: MechanicDefinition = {
  id: "layered-reward-structures",
  name: "Layered Reward Structures",
  shortLabel: "Layered Rewards",
  category: "Motivation",
  summary: "Every reward choice also pushes a slower research track.",
  detail:
    "Immediate gains and delayed unlocks stack together, showing how compulsion loops can be layered.",
  effectText: "Every reward also gives +1 research; at 3 research, gain +1 supply and +1 archive shard.",
  onBuildRewardChoices: (_, rewards) =>
    rewards.map((reward) => ({
      ...reward,
      secondary: [...reward.secondary, "Research track +1"],
    })),
  onAfterReward: ({ state, log }, selection) => {
    const gainedResearch = selection.choice.secondary.includes("Research track +1")
      ? 1
      : 0;

    if (!gainedResearch) {
      return;
    }

    state.player.research += gainedResearch;
    log("Layered reward advanced the research track by 1.");

    if (state.player.research >= 3) {
      state.player.research -= 3;
      state.player.supplies += 1;
      state.player.archiveGain += 1;
      log("Research breakpoint reached: +1 archive shard and +1 supply.");
    }
  },
  getDebugLines: ({ state }) => [
    `Layered Rewards: research meter ${state.player.research}/3.`,
    `Layered Rewards: pending archive gain ${state.player.archiveGain}.`,
  ],
};
