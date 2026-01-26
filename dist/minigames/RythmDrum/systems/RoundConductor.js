export class RoundConductor {
    scene;
    hud;
    drum;
    sound;
    input;
    isRunning = false;
    completion;
    activeTimers = [];
    boundHandlers = [];
    // ?? Subscribes to drum events so HUD, audio, and scoring stay synchronized ??
    constructor(scene, hud, drum, sound, input) {
        this.scene = scene;
        this.hud = hud;
        this.drum = drum;
        this.sound = sound;
        this.input = input;
        this.register("note", (note) => this.handlePlayerNote(note));
        this.register("progress", (payload) => this.hud.showPlayerInput(payload.progress, payload.success));
        this.register("fail", () => this.conclude(false));
        this.register("success", () => this.conclude(true));
    }
    // ?? Plays the reference melody and then hands control to the player ??
    run(plan, onFinish) {
        if (this.isRunning)
            return;
        this.isRunning = true;
        this.completion = onFinish;
        this.hud.setStatus("Listen closely...");
        this.hud.showPlayerInput([], []);
        this.playSequence(plan, () => {
            this.hud.setStatus("Your turn! Stay in sync.");
            this.input.startCapture(plan.notes);
        });
    }
    // ?? Stops any running round, used when the scene shuts down ??
    cancel() {
        this.input.stopCapture();
        this.clearTimers();
        this.isRunning = false;
    }
    destroy() {
        this.cancel();
        this.boundHandlers.forEach(([event, fn]) => this.input.off(event, fn));
        this.boundHandlers = [];
        this.drum.setHitHandler(undefined);
    }
    // ?? Steps through the AI melody, respecting per-note tempo variations ??
    playSequence(plan, onComplete) {
        const { notes, variations } = plan;
        let index = 0;
        const step = () => {
            if (index >= notes.length) {
                onComplete();
                return;
            }
            const note = notes[index];
            const variation = variations[index] ?? { rate: 1, detune: 0, delayFactor: 1 };
            this.pulseNote(note, variation);
            index++;
            const delay = 520 * variation.delayFactor;
            this.queueTimer(delay, step);
        };
        step();
    }
    // ?? Echoes player taps with audiovisual feedback even outside capture windows ??
    handlePlayerNote(note) {
        this.pulseNote(note);
    }
    // ?? Plays a note, flashes the drum, and shows it on the HUD center display ??
    pulseNote(note, config) {
        this.sound.playNote(note, config);
        this.drum.flash(note);
        this.hud.showCenterNote(note);
    }
    // ?? Finalizes a round with success/failure cues and invokes the completion handler ??
    conclude(success) {
        if (!this.isRunning)
            return;
        this.isRunning = false;
        this.input.stopCapture();
        this.clearTimers();
        if (success) {
            this.sound.playSuccess();
            this.drum.winFlash();
            this.hud.setStatus("Sequence locked in! Press Start for more.");
        }
        else {
            this.sound.playFail();
            this.drum.failFlash();
            this.hud.setStatus("Missed beat - try again.");
        }
        this.completion?.(success);
    }
    // ?? Manages delayed callbacks so they can be canceled cleanly if needed ??
    queueTimer(delay, callback) {
        const timer = this.scene.time.delayedCall(delay, () => {
            this.activeTimers = this.activeTimers.filter((t) => t !== timer);
            callback();
        });
        this.activeTimers.push(timer);
    }
    // ?? Removes any scheduled callbacks when the round is aborted ??
    clearTimers() {
        this.activeTimers.forEach((timer) => timer.remove(false));
        this.activeTimers = [];
    }
    register(event, handler) {
        this.input.on(event, handler);
        this.boundHandlers.push([event, handler]);
    }
}
