export class BoostManager {
  private readonly scene: Phaser.Scene;
  private readonly duration: number;
  private remainingUses: number;
  private activeBoosts: Map<string, Phaser.Time.TimerEvent> = new Map();

  // ℹ️ Sets up the manual boost system with limited uses and a fixed duration ℹ️
  constructor(scene: Phaser.Scene, uses: number, durationMs: number) {
    this.scene = scene;
    this.duration = durationMs;
    this.remainingUses = uses;
  }

  // ℹ️ Starts a boost for the given runner if uses remain ℹ️
  triggerBoost(runnerId: string): boolean {
    if (this.remainingUses <= 0) {
      return false;
    }

    this.remainingUses--;
    this.activeBoosts.get(runnerId)?.remove(false);

    const timer = this.scene.time.delayedCall(this.duration, () => {
      this.activeBoosts.delete(runnerId);
    });

    this.activeBoosts.set(runnerId, timer);
    return true;
  }

  // ℹ️ Returns the current boost multiplier for a runner ℹ️
  getMultiplier(runnerId: string): number {
    return this.activeBoosts.has(runnerId) ? 1.25 : 1;
  }

  // ℹ️ Reports how many boost uses are still available ℹ️
  getRemainingUses(): number {
    return this.remainingUses;
  }

  // ℹ️ Clears all boosts and restores the remaining uses ℹ️
  reset(uses: number): void {
    this.remainingUses = uses;
    this.activeBoosts.forEach((timer) => timer.remove(false));
    this.activeBoosts.clear();
  }
}
