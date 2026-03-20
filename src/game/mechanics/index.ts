import type { MechanicId } from "../types.js";
import type { MechanicDefinition } from "./types.js";
import { biasedExpectations } from "./biasedExpectations.js";
import { environmentalRandomness } from "./environmentalRandomness.js";
import { inputRandomness } from "./inputRandomness.js";
import { layeredRewardStructures } from "./layeredRewardStructures.js";
import { mitigationAgency } from "./mitigationAgency.js";
import { outputRandomness } from "./outputRandomness.js";
import { sessionPersistence } from "./sessionPersistence.js";
import { softFailureCompensation } from "./softFailureCompensation.js";

export const allMechanics: MechanicDefinition[] = [
  inputRandomness,
  outputRandomness,
  environmentalRandomness,
  mitigationAgency,
  biasedExpectations,
  sessionPersistence,
  layeredRewardStructures,
  softFailureCompensation,
];

export const starterMechanicPool: MechanicId[] = [
  "input-randomness",
  "output-randomness",
  "environmental-randomness",
  "mitigation-agency",
];

const mechanicMap = new Map<MechanicId, MechanicDefinition>(
  allMechanics.map((mechanic) => [mechanic.id, mechanic])
);

export function getMechanicDefinition(id: MechanicId): MechanicDefinition {
  const mechanic = mechanicMap.get(id);

  if (!mechanic) {
    throw new Error(`Unknown mechanic: ${id}`);
  }

  return mechanic;
}
