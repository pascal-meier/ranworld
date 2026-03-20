import { LabEngine } from "./LabEngine.js";
import { loadMeta, saveMeta } from "./storage.js";
import type { MechanicId, MetaProgress, RunState } from "../types.js";

class LabStore extends Phaser.Events.EventEmitter {
  private engine: LabEngine | null = null;
  private meta: MetaProgress = loadMeta();
  private queuedSeed = this.generateSeedValue();

  getState(): RunState | null {
    return this.engine?.state ?? null;
  }

  getMeta(): MetaProgress {
    return this.meta;
  }

  getSeedPreview(): number {
    return this.queuedSeed;
  }

  getRngDrawCount(): number {
    return this.engine?.rng.drawCount ?? 0;
  }

  getDebugLines(): string[] {
    return this.engine?.getDebugLines() ?? [];
  }

  rerollSeed(): void {
    this.queuedSeed = this.generateSeedValue();
    this.emitChange();
  }

  startRun(seed = this.queuedSeed): void {
    this.meta = loadMeta();
    this.engine = new LabEngine(seed, this.meta);
    this.emitChange();
  }

  chooseMechanic(id: MechanicId | null): void {
    this.engine?.chooseMechanic(id);
    this.persistAndEmit();
  }

  chooseNode(nodeId: string): void {
    this.engine?.chooseNode(nodeId);
    this.persistAndEmit();
  }

  resolveCombatAction(actionId: string): void {
    this.engine?.resolveCombatAction(actionId);
    this.persistAndEmit();
  }

  resolveEventChoice(choiceId: string): void {
    this.engine?.resolveEventChoice(choiceId);
    this.persistAndEmit();
  }

  chooseReward(choiceId: string): void {
    this.engine?.chooseReward(choiceId);
    this.persistAndEmit();
  }

  returnToSetup(mode: "same" | "new" = "new"): void {
    if (mode === "same" && this.engine) {
      this.queuedSeed = this.engine.state.seed;
    } else {
      this.queuedSeed = this.generateSeedValue();
    }

    this.engine = null;
    this.meta = loadMeta();
    this.emitChange();
  }

  private generateSeedValue(): number {
    return Math.floor(Date.now() % 1_000_000) + Math.floor(Math.random() * 997);
  }

  private persistAndEmit(): void {
    saveMeta(this.meta);
    this.emitChange();
  }

  private emitChange(): void {
    this.emit("changed");
  }
}

export const labStore = new LabStore();
