export class PhaseManager {
    pattern;
    events;
    phases = [
        {
            key: "memoryWarmup",
            title: "Memory Warmup",
            description: "Repeat the revealed pattern without any randomness.",
            roundsRequired: 2,
        },
        {
            key: "syncShift",
            title: "Sync Shift",
            description: "Adapt to slight pitch and tempo shifts while staying precise.",
            roundsRequired: 3,
        },
        {
            key: "chaosGroove",
            title: "Chaos Groove",
            description: "Unpredictable breaks appear, but rhythm mastery keeps control.",
            roundsRequired: null,
        },
    ];
    phaseIndex = 0;
    roundsCleared = 0;
    score = 0;
    reuseLastPlan = false;
    // ℹ️ Initializes phase state and immediately informs listeners about the starting phase ℹ️
    constructor(pattern, events = {}) {
        this.pattern = pattern;
        this.events = events;
        this.dispatchPhaseChange();
        this.emitProgress();
    }
    // ℹ️ Requests a melody plan from the pattern engine and forwards chance telemetry ℹ️
    prepareRound() {
        const plan = this.pattern.nextPlan(this.getPhase(), this.roundsCleared, this.reuseLastPlan);
        this.reuseLastPlan = false;
        this.events.onChance?.(plan.chanceLabel, plan.chanceIntensity);
        return plan;
    }
    // ℹ️ Updates score/progress after a correct round and advances phases when needed ℹ️
    registerSuccess() {
        this.score++;
        this.roundsCleared++;
        this.events.onScore?.(this.score);
        if (this.shouldAdvancePhase()) {
            this.advancePhase();
        }
        else {
            this.emitProgress();
        }
    }
    // ℹ️ Flags that the previous melody should be replayed because the player failed ℹ️
    registerFailure() {
        this.reuseLastPlan = true;
    }
    // ℹ️ Returns the current phase descriptor so other systems can reference it ℹ️
    getPhase() {
        return this.phases[this.phaseIndex];
    }
    // ℹ️ Provides the accumulated score for HUD display ℹ️
    getScore() {
        return this.score;
    }
    // ℹ️ Determines whether the phase criteria have been satisfied ℹ️
    shouldAdvancePhase() {
        const current = this.getPhase();
        if (current.roundsRequired === null)
            return false;
        return this.roundsCleared >= current.roundsRequired;
    }
    // ℹ️ Switches to the next phase or refreshes Chaos Groove if already at the end ℹ️
    advancePhase() {
        if (this.phaseIndex >= this.phases.length - 1) {
            this.roundsCleared = 0;
            this.pattern.resetCache();
            this.emitProgress();
            return;
        }
        this.phaseIndex++;
        this.roundsCleared = 0;
        this.pattern.resetCache();
        this.dispatchPhaseChange();
        this.emitProgress();
    }
    // ℹ️ Notifies listeners that the current phase object has changed ℹ️
    dispatchPhaseChange() {
        this.events.onPhaseChanged?.(this.getPhase());
    }
    // ℹ️ Emits progress info so the HUD can show round counters ℹ️
    emitProgress() {
        const phase = this.getPhase();
        const total = phase.roundsRequired ?? "∞";
        const current = phase.roundsRequired
            ? Math.min(this.roundsCleared + 1, phase.roundsRequired)
            : this.roundsCleared + 1;
        this.events.onProgress?.(current, total);
    }
}
