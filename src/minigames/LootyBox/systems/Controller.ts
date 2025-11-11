export class LootyBoxController {
  private score = 0;
  private readonly goalScore: number;
  private resetTimer?: Phaser.Time.TimerEvent;

  /**
   * ℹ️ Keeps track of the running score and optional delayed resets. ℹ️
   */
  constructor(private scene: Phaser.Scene, goalScore = 100) {
    this.goalScore = goalScore;
  }

  /**
   * ℹ️ Adds loot value to the score and reports if the goal has been met. ℹ️
   */
  addLoot(value: number): boolean {
    this.score += value;
    return this.score >= this.goalScore;
  }

  /**
   * ℹ️ Schedules a delayed callback used to reset boxes or UI. ℹ️
   */
  scheduleReset(callback: () => void): void {
    this.resetTimer?.remove();
    this.resetTimer = this.scene.time.delayedCall(2000, callback);
  }

  /**
   * ℹ️ Clears any pending reset timer. ℹ️
   */
  clear(): void {
    this.resetTimer?.remove();
  }

  /**
   * ℹ️ Returns the current player score. ℹ️
   */
  getScore(): number {
    return this.score;
  }
}
