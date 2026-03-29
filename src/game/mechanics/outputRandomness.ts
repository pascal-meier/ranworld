import { getImplementedMechanicMeta } from "./catalog.js";
import type { MechanicDefinition } from "./types.js";

export const outputRandomness: MechanicDefinition = {
  ...getImplementedMechanicMeta("output-randomness"),
  id: "output-randomness",
  category: "Outcome Variance",
  summary: "Attacks add hit jitter, damage spread, and rare crit swings.",
  detail:
    "The chosen action stays the same, but its result varies, which raises suspense and swinginess.",
  effectText: "Attack rolls add +/-10 hit chance, +/-2 damage, and a 12% crit chance for +2 damage.",
  iconKey: "mechanic-output-randomness",
  onResolveCombatAction: (context, resolution) => {
    if (resolution.action.kind !== "attack") {
      return;
    }

    const hitJitter = context.rng.int(-10, 10);
    const damageSwing = context.rng.int(-2, 2);

    resolution.chanceShift += hitJitter;
    resolution.damageShift += damageSwing;
    resolution.critChance = 12;
    resolution.critBonus = 2;
    resolution.notes.push(
      `Output RNG rolled ${hitJitter >= 0 ? "+" : ""}${hitJitter}% hit jitter and ${
        damageSwing >= 0 ? "+" : ""
      }${damageSwing} damage swing.`
    );
  },
  getDebugLines: () => [
    "Output RNG: attack resolution adds +/-10 hit jitter and +/-2 damage spread.",
    "Output RNG: 12% crit chance for +2 damage.",
  ],
};
