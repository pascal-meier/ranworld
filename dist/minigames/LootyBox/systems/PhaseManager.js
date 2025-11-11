const DEFAULT_PHASES = [
    {
        key: "blind",
        title: "Phase 1 - Mystery Odds",
        description: "Nur das Ergebnis ist sichtbar. Keine Wahrscheinlichkeiten oder Roll-Details.",
        feedbackLevel: 1,
    },
    {
        key: "odds",
        title: "Phase 2 - Odds Preview",
        description: "Zeigt dir die prozentualen Chancen pro Box, bevor du sie oeffnest.",
        feedbackLevel: 2,
    },
    {
        key: "reveal",
        title: "Phase 3 - Full Transparency",
        description: "Visualisiert den zugrunde liegenden Zufallswert und die getroffene Schwelle.",
        feedbackLevel: 3,
    },
];
/**
 * Kombiniert Spielfluss (ready/reveal/cooldown) und Transparenz-Phasen
 * fuer das LootyBox-Minispiel.
 */
export class PhaseManager {
    scene;
    config;
    flowState = "boot";
    phases;
    transparencyIndex = 0;
    cooldownTimer;
    constructor(scene, config = {}) {
        this.scene = scene;
        this.config = config;
        this.phases = config.phases ?? DEFAULT_PHASES;
        this.config.onTransparencyChange?.(this.getTransparencyPhase());
    }
    destroy() {
        this.clearTimer();
    }
    canInteract() {
        return this.flowState === "ready";
    }
    getFlowState() {
        return this.flowState;
    }
    getTransparencyPhase() {
        return this.phases[this.transparencyIndex];
    }
    cycleTransparencyPhase() {
        this.transparencyIndex = (this.transparencyIndex + 1) % this.phases.length;
        const next = this.getTransparencyPhase();
        this.config.onTransparencyChange?.(next);
        return next;
    }
    enterReady() {
        this.clearTimer();
        this.setFlowState("ready");
    }
    enterReveal() {
        this.clearTimer();
        this.setFlowState("revealing");
    }
    startCooldown(onShuffleComplete, duration) {
        const delay = duration ?? this.config.cooldownDuration ?? 1500;
        this.clearTimer();
        this.setFlowState("cooldown");
        this.cooldownTimer = this.scene.time.delayedCall(delay, () => {
            onShuffleComplete();
            if (this.flowState !== "win") {
                this.enterReady();
            }
        });
    }
    enterWin() {
        this.clearTimer();
        this.setFlowState("win");
    }
    setFlowState(state) {
        if (this.flowState === state)
            return;
        this.flowState = state;
        this.config.onFlowStateChange?.(state);
    }
    clearTimer() {
        this.cooldownTimer?.remove();
        this.cooldownTimer = undefined;
    }
}
