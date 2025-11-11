export class LootyBoxController {
  private score = 0;
  private readonly goalScore: number;
  private resetTimer?: Phaser.Time.TimerEvent;

  constructor(private scene: Phaser.Scene, goalScore = 100) {
    this.goalScore = goalScore;
  }

  addLoot(value: number): boolean {
    this.score += value;
    return this.score >= this.goalScore;
  }

  scheduleReset(callback: () => void): void {
    this.resetTimer?.remove();
    this.resetTimer = this.scene.time.delayedCall(2000, callback);
  }

  clear(): void {
    this.resetTimer?.remove();
  }

  getScore(): number {
    return this.score;
  }
}
