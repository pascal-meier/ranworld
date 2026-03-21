import { getImplementedMechanicMeta } from "./catalog.js";
import type { MechanicDefinition } from "./types.js";

const environments = [
  {
    name: "Ion Storm",
    description: "Static arcs make precision harder but amplify shield timing.",
    hitShift: -8,
    guardShift: 2,
  },
  {
    name: "Clear Corridor",
    description: "Clean lines of sight favor accurate attacks.",
    hitShift: 6,
    guardShift: 0,
  },
  {
    name: "Dust Field",
    description: "Visibility drops and blocks become less dependable.",
    hitShift: -4,
    guardShift: -1,
  },
  {
    name: "Echo Vault",
    description: "Predictable ricochets make defense stronger.",
    hitShift: 0,
    guardShift: 3,
  },
];

export const environmentalRandomness: MechanicDefinition = {
  ...getImplementedMechanicMeta("environmental-randomness"),
  id: "environmental-randomness",
  category: "Context Variance",
  summary: "Every combat rolls a battlefield condition with unique modifiers.",
  detail:
    "The surrounding state changes from encounter to encounter and reframes the same action set.",
  effectText: "Each combat rolls one arena modifier that shifts hit chance and guard strength.",
  onBuildCombat: (context, combat) => {
    const environment = context.rng.pick(environments);
    combat.environmentName = environment.name;
    combat.environmentDescription = environment.description;
    combat.environmentHitShift = environment.hitShift;
    combat.environmentGuardShift = environment.guardShift;
  },
  getDebugLines: ({ state }) => {
    if (!state.combat) {
      return ["Env RNG: inactive outside combat."];
    }

    return [
      `Env RNG: ${state.combat.environmentName} (${state.combat.environmentHitShift >= 0 ? "+" : ""}${state.combat.environmentHitShift}% hit, ${state.combat.environmentGuardShift >= 0 ? "+" : ""}${state.combat.environmentGuardShift} guard).`,
    ];
  },
};
