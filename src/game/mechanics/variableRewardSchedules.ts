import { getImplementedMechanicMeta } from "./catalog.js";
import type { RewardChoice } from "../types.js";
import type { MechanicDefinition } from "./types.js";

const scheduleNames = ["lean", "standard", "jackpot"] as const;

function describeReward(choice: RewardChoice, amount: number, schedule: string): string {
  if (choice.type === "heal") {
    return `Restore ${amount} HP. ${schedule} schedule.`;
  }

  if (choice.type === "max-hp") {
    return `Gain +${amount} max HP and heal ${amount}. ${schedule} schedule.`;
  }

  if (choice.type === "supplies") {
    return `Gain ${amount} supplies. ${schedule} schedule.`;
  }

  if (choice.type === "mitigation") {
    return `Gain ${amount} mitigation charge${amount > 1 ? "s" : ""}. ${schedule} schedule.`;
  }

  return `Bank ${amount} archive shards. ${schedule} schedule.`;
}

export const variableRewardSchedules: MechanicDefinition = {
  ...getImplementedMechanicMeta("variable-reward-schedules"),
  id: "variable-reward-schedules",
  category: "Rewards",
  summary: "Reward packages roll lean, standard, or jackpot values each time.",
  detail:
    "The same reward category can arrive as a weak, normal, or boosted package, making the payout cadence itself variable.",
  effectText: "Reward amounts reroll between lean, standard, and jackpot packages each reward screen.",
  onBuildRewardChoices: (context, rewards) =>
    rewards.map((reward) => {
      const scheduleIndex = context.rng.int(0, 2);
      const schedule = scheduleNames[scheduleIndex];
      const delta = scheduleIndex === 0 ? -1 : scheduleIndex === 2 ? 1 : 0;
      const nextAmount = Math.max(1, reward.amount + delta);
      const labelSuffix = reward.type === "max-hp" ? `+${nextAmount}` : `${nextAmount}`;

      return {
        ...reward,
        label: `${reward.label} ${labelSuffix}`,
        amount: nextAmount,
        description: describeReward(reward, nextAmount, schedule),
        secondary: [...reward.secondary, `${schedule} schedule`],
      };
    }),
  getDebugLines: () => ["Var Rewards: reward values reroll between lean, standard, and jackpot."],
};
