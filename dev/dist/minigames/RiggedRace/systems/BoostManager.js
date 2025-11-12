export class BoostManager {
    scene;
    duration;
    remainingUses;
    activeBoosts = new Map();
    // ℹ️ Sets up the manual boost system with limited uses and a fixed duration ℹ️
    constructor(scene, uses, durationMs) {
        this.scene = scene;
        this.duration = durationMs;
        this.remainingUses = uses;
    }
    // ℹ️ Starts a boost for the given runner if uses remain ℹ️
    triggerBoost(runnerId) {
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
    getMultiplier(runnerId) {
        return this.activeBoosts.has(runnerId) ? 1.25 : 1;
    }
    // ℹ️ Reports how many boost uses are still available ℹ️
    getRemainingUses() {
        return this.remainingUses;
    }
    // ℹ️ Clears all boosts and restores the remaining uses ℹ️
    reset(uses) {
        this.remainingUses = uses;
        this.activeBoosts.forEach((timer) => timer.remove(false));
        this.activeBoosts.clear();
    }
}
