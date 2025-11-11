export class LootyBoxController {
    scene;
    score = 0;
    goalScore;
    resetTimer;
    /**
     * ℹ️ Keeps track of the running score and optional delayed resets. ℹ️
     */
    constructor(scene, goalScore = 100) {
        this.scene = scene;
        this.goalScore = goalScore;
    }
    /**
     * ℹ️ Adds loot value to the score and reports if the goal has been met. ℹ️
     */
    addLoot(value) {
        this.score += value;
        return this.score >= this.goalScore;
    }
    /**
     * ℹ️ Schedules a delayed callback used to reset boxes or UI. ℹ️
     */
    scheduleReset(callback) {
        this.resetTimer?.remove();
        this.resetTimer = this.scene.time.delayedCall(2000, callback);
    }
    /**
     * ℹ️ Clears any pending reset timer. ℹ️
     */
    clear() {
        this.resetTimer?.remove();
    }
    /**
     * ℹ️ Returns the current player score. ℹ️
     */
    getScore() {
        return this.score;
    }
}
