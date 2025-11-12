import type { MelodyPlan, NoteVariation, PhaseDefinition } from "./types.js";

export class RhythmPattern {
  private readonly memoryPatterns: number[][] = [
    [1, 3, 5, 1],
    [2, 4, 6, 2],
    [3, 1, 6, 5],
    [4, 2, 7, 4, 1],
    [5, 3, 8, 5, 2],
  ];

  private memoryIndex = 0;
  private lastPlan?: MelodyPlan;
  private chaosAugments = 0;

  // ℹ️ Builds or reuses a melody plan depending on the current phase and reuse flag ℹ️
  nextPlan(phase: PhaseDefinition, roundsCleared: number, reuseLast: boolean): MelodyPlan {
    if (reuseLast && this.lastPlan) {
      return this.lastPlan;
    }

    const notes = this.buildNotes(phase, roundsCleared);
    const variations = this.buildVariations(phase.key, notes.length);
    const chanceIntensity = this.evaluateChance(phase.key, variations, notes.length);
    const chanceLabel = this.describeChance(phase.key, chanceIntensity);

    this.lastPlan = { notes, variations, chanceIntensity, chanceLabel };
    return this.lastPlan;
  }

  // ℹ️ Clears the cached plan so the next request forces recomputation ℹ️
  resetCache(): void {
    this.lastPlan = undefined;
  }

  // ℹ️ Generates note sequences tailored to each phase’s desired behavior ℹ️
  private buildNotes(phase: PhaseDefinition, roundsCleared: number): number[] {
    switch (phase.key) {
      case "memoryWarmup":
        return this.nextMemoryPattern();
      case "syncShift":
        return this.buildSyncPattern(roundsCleared);
      default:
        return this.buildChaosPattern(roundsCleared);
    }
  }

  // ℹ️ Cycles through the predefined memory warmup patterns ℹ️
  private nextMemoryPattern(): number[] {
    const pattern = this.memoryPatterns[this.memoryIndex % this.memoryPatterns.length];
    this.memoryIndex++;
    return [...pattern];
  }

  // ℹ️ Offsets warmup patterns and appends extra hits as Sync Shift ramps up ℹ️
  private buildSyncPattern(roundsCleared: number): number[] {
    const baseIndex = (this.memoryIndex + roundsCleared) % this.memoryPatterns.length;
    const basePattern = this.memoryPatterns[baseIndex];
    const offset = Phaser.Math.Between(-1, 1);
    const shifted = basePattern.map((note) => this.wrapNote(note + offset));

    if (roundsCleared > 0) {
      shifted.push(...this.generateRandomNotes(1 + Phaser.Math.Between(0, 1)));
    }

    return shifted;
  }

  // ℹ️ Creates longer randomized sequences with surprise insertions for Chaos Groove ℹ️
  private buildChaosPattern(roundsCleared: number): number[] {
    const baseLength = 5 + roundsCleared;
    const base = this.generateRandomNotes(baseLength);
    const extraHits = Phaser.Math.Between(1, Math.max(2, Math.ceil(baseLength / 2)));
    this.chaosAugments = extraHits;

    for (let i = 0; i < extraHits; i++) {
      const index = Phaser.Math.Between(0, base.length);
      const note = Phaser.Math.Between(1, 8);
      base.splice(index, 0, note);
    }

    return base;
  }

  // ℹ️ Produces a run of non-identical random notes within the drum’s range ℹ️
  private generateRandomNotes(length: number): number[] {
    const notes: number[] = [];
    let last = Phaser.Math.Between(1, 8);

    for (let i = 0; i < length; i++) {
      let next = Phaser.Math.Between(1, 8);
      if (next === last) {
        next = this.wrapNote(next + 1);
      }
      notes.push(next);
      last = next;
    }

    return notes;
  }

  // ℹ️ Defines per-note tempo/detune variations driven by the active phase ℹ️
  private buildVariations(phaseKey: PhaseDefinition["key"], length: number): NoteVariation[] {
    if (phaseKey === "memoryWarmup") {
      return Array.from({ length }, () => ({ rate: 1, detune: 0, delayFactor: 1 }));
    }

    if (phaseKey === "syncShift") {
      return Array.from({ length }, () => ({
        rate: Phaser.Math.FloatBetween(0.9, 1.12),
        detune: Phaser.Math.Between(-80, 80),
        delayFactor: Phaser.Math.FloatBetween(0.85, 1.15),
      }));
    }

    return Array.from({ length }, () => {
      const interruption = Math.random() < 0.35;
      return {
        rate: Phaser.Math.FloatBetween(0.92, 1.08),
        detune: Phaser.Math.Between(-60, 60),
        delayFactor: interruption
          ? Phaser.Math.FloatBetween(1.2, 1.45)
          : Phaser.Math.FloatBetween(0.95, 1.15),
      };
    });
  }

  // ℹ️ Scores how much randomness influences the current plan for HUD messaging ℹ️
  private evaluateChance(
    phaseKey: PhaseDefinition["key"],
    variations: NoteVariation[],
    noteCount: number
  ): number {
    if (phaseKey === "memoryWarmup") return 0;
    if (!variations.length) return 0;

    if (phaseKey === "syncShift") {
      const deviation =
        variations.reduce((sum, variation) => {
          const rateDelta = Math.abs(variation.rate - 1);
          const delayDelta = Math.abs(variation.delayFactor - 1);
          const detuneDelta = Math.abs(variation.detune) / 120;
          return sum + rateDelta + delayDelta + detuneDelta;
        }, 0) / variations.length;

      return Phaser.Math.Clamp(deviation / 0.9, 0, 1);
    }

    const delayPressure =
      variations.reduce((sum, variation) => sum + Math.max(0, variation.delayFactor - 1), 0) /
      variations.length;
    const chaosWeight = this.chaosAugments / Math.max(1, noteCount);
    return Phaser.Math.Clamp(delayPressure + chaosWeight, 0, 1);
  }

  // ℹ️ Converts the numeric chance intensity into a friendly HUD label ℹ️
  private describeChance(phaseKey: PhaseDefinition["key"], intensity: number): string {
    if (phaseKey === "memoryWarmup") return "Chance: 0% (pure skill)";
    const percent = Math.round(intensity * 100);

    if (intensity < 0.25) return `Chance: ${percent}% (subtle drift)`;
    if (intensity < 0.55) return `Chance: ${percent}% (noticeable sway)`;
    return `Chance: ${percent}% (wild card)`;
  }

  // ℹ️ Wraps note values back into the 1–8 drum segment range ℹ️
  private wrapNote(value: number): number {
    const offset = ((value - 1) % 8 + 8) % 8;
    return offset + 1;
  }
}
