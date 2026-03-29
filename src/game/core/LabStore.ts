import { LabEngine } from "./LabEngine.js";
import { loadMeta, saveMeta } from "./storage.js";
import type { MechanicId, MetaProgress, RunState, TutorialId } from "../types.js";
import { META_UPGRADES, getUpgradeLevel, canAffordUpgrade, getUpgradeCost } from "./metaUpgrades.js";

export class LabStore extends Phaser.Events.EventEmitter {
  private engine: LabEngine | null = null;
  private meta: MetaProgress = loadMeta();
  private queuedSeed = this.generateSeedValue();
  private devOverlayVisible = false;

  getState(): RunState | null {
    return this.engine?.state ?? null;
  }

  getMeta(): MetaProgress {
    return this.meta;
  }

  hasSeenTutorial(id: TutorialId): boolean {
    return Boolean(this.meta.seenTutorials[id]);
  }

  markTutorialSeen(id: TutorialId): void {
    if (this.meta.seenTutorials[id]) {
      return;
    }

    this.meta = {
      ...this.meta,
      seenTutorials: {
        ...this.meta.seenTutorials,
        [id]: true,
      },
    };
    saveMeta(this.meta);
    this.emitChange();
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

  isDevOverlayVisible(): boolean {
    return this.devOverlayVisible;
  }

  toggleDevOverlay(): void {
    this.devOverlayVisible = !this.devOverlayVisible;
    this.emitChange();
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

  choosePlanet(planetId: string): void {
    this.engine?.choosePlanet(planetId);
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

  rerollCurrentOffer(): void {
    this.engine?.rerollCurrentOffer();
    this.persistAndEmit();
  }

  purchaseMetaUpgrade(upgradeId: string): void {
    const upgrade = META_UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return;

    const currentLevel = getUpgradeLevel(this.meta.upgrades, upgradeId);
    const cost = getUpgradeCost(upgrade, currentLevel);
    
    if (cost !== null && canAffordUpgrade(this.meta.archive, upgrade, currentLevel)) {
      this.meta = {
        ...this.meta,
        archive: this.meta.archive - cost,
        upgrades: {
          ...this.meta.upgrades,
          [upgradeId]: currentLevel + 1
        }
      };
      saveMeta(this.meta);
      this.emitChange();
    }
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
