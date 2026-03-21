import { getImplementedMechanicMeta } from "./catalog.js";
import type { MechanicDefinition } from "./types.js";

const actionPool = [
  {
    id: "strike",
    label: "Balanced Attack",
    description: "78% hit chance, 6 damage.",
    kind: "attack" as const,
    baseHitChance: 78,
    baseDamage: 6,
    guardGain: 0,
    focusGain: 0,
  },
  {
    id: "jab",
    label: "Quick Attack",
    description: "88% hit chance, 4 damage.",
    kind: "attack" as const,
    baseHitChance: 88,
    baseDamage: 4,
    guardGain: 0,
    focusGain: 0,
  },
  {
    id: "heavy",
    label: "Heavy Attack",
    description: "66% hit chance, 8 damage.",
    kind: "attack" as const,
    baseHitChance: 66,
    baseDamage: 8,
    guardGain: 0,
    focusGain: 0,
  },
  {
    id: "guard",
    label: "Guard",
    description: "Gain 6 guard. Blocks the next enemy attack.",
    kind: "guard" as const,
    baseHitChance: 100,
    baseDamage: 0,
    guardGain: 6,
    focusGain: 0,
  },
  {
    id: "focus",
    label: "Calibrate",
    description: "Gain +16 hit chance for your next attack.",
    kind: "focus" as const,
    baseHitChance: 100,
    baseDamage: 0,
    guardGain: 0,
    focusGain: 16,
  },
];

export const inputRandomness: MechanicDefinition = {
  ...getImplementedMechanicMeta("input-randomness"),
  id: "input-randomness",
  category: "Action Space",
  summary: "Combat options are drawn from a rotating action pool each round.",
  detail:
    "The decision space shifts before the player acts, making planning less stable but more varied.",
  effectText: "Each combat round redraws 3 non-guard actions from the pool, then keeps Guard available.",
  onBuildCombatActions: (context, actions) => {
    const baseGuard = actions.find((action) => action.id === "guard");
    const randomOptions = context.rng
      .shuffle(actionPool.filter((action) => action.id !== "guard"))
      .slice(0, 3);

    return [...randomOptions, ...(baseGuard ? [baseGuard] : [])];
  },
  getDebugLines: () => [
    "Input RNG: 3 of 4 attack/support actions are sampled each combat round.",
  ],
};
