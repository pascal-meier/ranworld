export class RoundConductor {
    scene;
    hud;
    drum;
    sound;
    input;
    isRunning = false;
    completion;
    activeTimers = [];
    // ℹ️ Subscribes to drum events so HUD, audio, and scoring stay synchronized ℹ️
    constructor(scene, hud, drum, sound, input) {
        this.scene = scene;
        this.hud = hud;
        this.drum = drum;
        this.sound = sound;
        this.input = input;
        this.input.on("note", (note) => this.handlePlayerNote(note));
        this.input.on("progress", (payload) => this.hud.showPlayerInput(payload.progress, payload.success));
        this.input.on("fail", () => this.conclude(false));
        this.input.on("success", () => this.conclude(true));
    }
    // ℹ️ Plays the reference melody and then hands control to the player ℹ️
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
    // ℹ️ Stops any running round, used when the scene shuts down ℹ️
    cancel() {
        this.input.stopCapture();
        this.clearTimers();
        this.isRunning = false;
    }
    // ℹ️ Steps through the AI melody, respecting per-note tempo variations ℹ️
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
    // ℹ️ Echoes player taps with audiovisual feedback even outside capture windows ℹ️
    handlePlayerNote(note) {
        this.pulseNote(note);
    }
    // ℹ️ Plays a note, flashes the drum, and shows it on the HUD center display ℹ️
    pulseNote(note, config) {
        this.sound.playNote(note, config);
        this.drum.flash(note);
        this.hud.showCenterNote(note);
    }
    // ℹ️ Finalizes a round with success/failure cues and invokes the completion handler ℹ️
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
    // ℹ️ Manages delayed callbacks so they can be canceled cleanly if needed ℹ️
    queueTimer(delay, callback) {
        const timer = this.scene.time.delayedCall(delay, () => {
            this.activeTimers = this.activeTimers.filter((t) => t !== timer);
            callback();
        });
        this.activeTimers.push(timer);
    }
    // ℹ️ Removes any scheduled callbacks when the round is aborted ℹ️
    clearTimers() {
        this.activeTimers.forEach((timer) => timer.remove(false));
        this.activeTimers = [];
    }
}
