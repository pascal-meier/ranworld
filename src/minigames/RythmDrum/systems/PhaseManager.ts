import type { MelodyPlan, PhaseDefinition } from "./types.js";
import { RhythmPattern } from "./RhythmPattern.js";

export interface PhaseManagerEvents {
  onPhaseChanged?(phase: PhaseDefinition): void;
  onProgress?(current: number, total: number | string): void;
  onScore?(score: number): void;
  onChance?(label: string, intensity: number): void;
}

export class PhaseManager {
  private readonly phases: PhaseDefinition[] = [
    {
      key: "memoryWarmup",
      title: "Memory Warmup",
      description: "Repeat the revealed pattern without any randomness.",
      roundsRequired: 2,
    },
    {
      key: "syncShift",
      title: "Sync Shift",
      description: "Adapt to slight pitch and tempo shifts while staying precise.",
      roundsRequired: 3,
    },
    {
      key: "chaosGroove",
      title: "Chaos Groove",
      description: "Unpredictable breaks appear, but rhythm mastery keeps control.",
      roundsRequired: null,
    },
  ];

  private phaseIndex = 0;
  private roundsCleared = 0;
  private score = 0;
  private reuseLastPlan = false;

  // ℹ️ Initializes phase state and immediately informs listeners about the starting phase ℹ️
  constructor(private pattern: RhythmPattern, private events: PhaseManagerEvents = {}) {
    this.dispatchPhaseChange();
    this.emitProgress();
  }

  // ℹ️ Requests a melody plan from the pattern engine and forwards chance telemetry ℹ️
  prepareRound(): MelodyPlan {
    const plan = this.pattern.nextPlan(
      this.getPhase(),
      this.roundsCleared,
      this.reuseLastPlan
    );
    this.reuseLastPlan = false;
    this.events.onChance?.(plan.chanceLabel, plan.chanceIntensity);
    return plan;
  }

  // ℹ️ Updates score/progress after a correct round and advances phases when needed ℹ️
  registerSuccess(): void {
    this.score++;
    this.roundsCleared++;
    this.events.onScore?.(this.score);

    if (this.shouldAdvancePhase()) {
      this.advancePhase();
    } else {
      this.emitProgress();
    }
  }

  // ℹ️ Flags that the previous melody should be replayed because the player failed ℹ️
  registerFailure(): void {
    this.reuseLastPlan = true;
  }

  // ℹ️ Returns the current phase descriptor so other systems can reference it ℹ️
  getPhase(): PhaseDefinition {
    return this.phases[this.phaseIndex];
  }

  // ℹ️ Provides the accumulated score for HUD display ℹ️
  getScore(): number {
    return this.score;
  }

  // ℹ️ Determines whether the phase criteria have been satisfied ℹ️
  private shouldAdvancePhase(): boolean {
    const current = this.getPhase();
    if (current.roundsRequired === null) return false;
    return this.roundsCleared >= current.roundsRequired;
  }

  // ℹ️ Switches to the next phase or refreshes Chaos Groove if already at the end ℹ️
  private advancePhase(): void {
    if (this.phaseIndex >= this.phases.length - 1) {
      this.roundsCleared = 0;
      this.pattern.resetCache();
      this.emitProgress();
      return;
    }

    this.phaseIndex++;
    this.roundsCleared = 0;
    this.pattern.resetCache();
    this.dispatchPhaseChange();
    this.emitProgress();
  }

  // ℹ️ Notifies listeners that the current phase object has changed ℹ️
  private dispatchPhaseChange(): void {
    this.events.onPhaseChanged?.(this.getPhase());
  }

  // ℹ️ Emits progress info so the HUD can show round counters ℹ️
  private emitProgress(): void {
    const phase = this.getPhase();
    const total = phase.roundsRequired ?? "∞";
    const current = phase.roundsRequired
      ? Math.min(this.roundsCleared + 1, phase.roundsRequired)
      : this.roundsCleared + 1;
    this.events.onProgress?.(current, total);
  }
}
