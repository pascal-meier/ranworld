export class RaceController {
    scene;
    runners;
    dimensions;
    tickMs;
    fairnessLabelCallback;
    boostManager;
    timer;
    running = false;
    finishHandler;
    // ℹ️ Coordinates the race updates, randomness sampling, and finish detection ℹ️
    constructor(scene, runners, dimensions, options = {}) {
        this.scene = scene;
        this.runners = runners;
        this.dimensions = dimensions;
        this.tickMs = options.tickMs ?? 80;
        this.fairnessLabelCallback = options.fairnessLabelCallback;
    }
    // ℹ️ Injects the boost manager so the controller can factor boosts per runner ℹ️
    setBoostManager(manager) {
        this.boostManager = manager;
    }
    // ℹ️ Starts the race by resetting runners and scheduling the update loop ℹ️
    start(onFinish) {
        if (this.running)
            return;
        this.finishHandler = onFinish;
        this.running = true;
        this.runners.forEach((runner) => runner.resetToStart());
        this.timer = this.scene.time.addEvent({
            delay: this.tickMs,
            loop: true,
            callback: () => this.step(),
        });
        this.updateFairnessLabel(0);
    }
    // ℹ️ Stops the race loop if it is currently running ℹ️
    stop() {
        this.running = false;
        this.timer?.remove(false);
        this.timer = undefined;
    }
    // ℹ️ Adjusts finish-line coordinates when the scene is resized ℹ️
    setDimensions(dimensions) {
        this.dimensions = dimensions;
    }
    // ℹ️ Executes a single race step, applying bounded randomness to each runner ℹ️
    step() {
        if (!this.running)
            return;
        let highestVariance = 0;
        for (const runner of this.runners) {
            const profile = runner.getProfile();
            const randomSwing = Phaser.Math.FloatBetween(-profile.variance, profile.variance);
            const varianceRatio = profile.variance === 0 ? 0 : randomSwing / profile.variance;
            highestVariance = Math.max(highestVariance, Math.abs(varianceRatio));
            runner.updateLuckIndicator(varianceRatio);
            const basePerTick = (profile.baseSpeed * this.tickMs) / 1000;
            const variancePerTick = (randomSwing * this.tickMs) / 1000;
            const boostMultiplier = this.boostManager?.getMultiplier(profile.id) ?? 1;
            runner.advance((basePerTick + variancePerTick) * boostMultiplier);
            if (runner.x >= this.dimensions.finishX) {
                this.complete(runner);
                return;
            }
        }
        this.updateFairnessLabel(highestVariance);
    }
    // ℹ️ Handles winner detection and stops the loop ℹ️
    complete(runner) {
        this.stop();
        this.finishHandler?.(runner);
    }
    // ℹ️ Updates the fairness label to show how extreme the last variance was ℹ️
    updateFairnessLabel(extent) {
        if (!this.fairnessLabelCallback)
            return;
        const percent = Math.round(extent * 100);
        this.fairnessLabelCallback(`Variance pulse ±${percent}%`);
    }
}
