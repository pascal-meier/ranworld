export class LootyBoxController {
    scene;
    score = 0;
    goalScore;
    resetTimer;
    constructor(scene, goalScore = 100) {
        this.scene = scene;
        this.goalScore = goalScore;
    }
    addLoot(value) {
        this.score += value;
        return this.score >= this.goalScore;
    }
    scheduleReset(callback) {
        this.resetTimer?.remove();
        this.resetTimer = this.scene.time.delayedCall(2000, callback);
    }
    clear() {
        this.resetTimer?.remove();
    }
    getScore() {
        return this.score;
    }
}
