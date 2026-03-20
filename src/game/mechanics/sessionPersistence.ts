import type { MechanicDefinition } from "./types.js";

export const sessionPersistence: MechanicDefinition = {
  id: "session-persistence",
  name: "Session Persistence",
  shortLabel: "Persistence",
  category: "Meta Progression",
  summary: "Archived knowledge from earlier runs becomes a live in-run modifier.",
  detail:
    "Past sessions affect the current run, turning repeat play into a lens for long-term motivation.",
  effectText: "On pickup, stored archive grants up to +4 max HP and extra supplies based on past runs.",
  onAdded: ({ engine, state, log }) => {
    const archive = engine.meta.archive;
    const hpBoost = Math.min(archive, 4);
    const supplyBoost = Math.floor(archive / 2);

    state.player.maxHp += hpBoost;
    state.player.hp = Math.min(state.player.maxHp, state.player.hp + hpBoost);
    state.player.supplies += supplyBoost;
    state.player.legacyBoost = archive;

    log(
      `Session Persistence converted ${archive} archived shards into +${hpBoost} max HP and +${supplyBoost} supplies.`
    );
  },
  getDebugLines: ({ engine, state }) => [
    `Persistence: archive bank ${engine.meta.archive}.`,
    `Persistence: current run legacy boost ${state.player.legacyBoost}.`,
  ],
};
