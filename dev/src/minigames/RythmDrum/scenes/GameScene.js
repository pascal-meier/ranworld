import HUD from "../ui/hud.js";
import SoundManager from "../audio/soundManager.js";
import TongueDrum from "../objects/tongueDrum.js";

export class RythmDrumGameScene extends Phaser.Scene {
    constructor() {
        super("RythmDrumGameScene");
    }

    create() {
        const { width, height } = this.scale;

        // Systems
        this.soundManager = new SoundManager(this);
        this.hud = new HUD(this);

        // Game state
        this.melody = [1, 7, 5];
        this.playerInput = [];
        this.successList = [];
        this.score = 0;
        this.isPlaying = false;
        this.isInputActive = false;

        // Drum object
        this.tongueDrum = new TongueDrum(this, width / 2, height / 2, "drum");

        // Wire HUD buttons
        this.hud.setStartCallback(() => {
            if (!this.isPlaying) this.startMelody();
        });
        this.hud.setBackCallback(() => {
            this.scene.start("MainMenuScene");
        });
        this.hud.setScore(this.score);
        this.hud.setStatus("Start?");

        // central note and input from tongueDrum:
        // tongueDrum calls `scene.onNotePlayed(segment)` internally
        this.onNotePlayed = (segment) => {
            // always play sound & flash the drum
            this.soundManager.playNote(segment);
            this.tongueDrum.flash(segment);
            this.hud.showCenterNote(segment);

            // if not in input-phase -> free-play (no test logic)
            if (!this.isInputActive) return;

            // process input step
            const index = this.playerInput.length;
            const expected = this.melody[index];
            const correct = expected === segment;

            this.playerInput.push(segment);
            this.successList.push(correct);

            this.hud.showPlayerInput(this.playerInput, this.successList);

            if (!correct) {
                // immediate fail on first mistake
                this.isInputActive = false;
                this.isPlaying = false;
                this.hud.setStatus("❌ Try Again!");
                this.soundManager.playFail();
                this.tongueDrum.failFlash();
                return;
            }

            // if completed and all correct
            if (this.playerInput.length === this.melody.length) {
                this.isInputActive = false;
                this.isPlaying = false;
                this.hud.setStatus("🎉 Perfect!");
                this.soundManager.playSuccess();
                this.tongueDrum.winFlash();
                this.score++;
                this.hud.setScore(this.score);
                this.changeMelody();
            }
        };

        // DON'T autoplay melody; start via HUD start button
    }

    startMelody() {
        this.isPlaying = true;
        this.isInputActive = false;
        this.playerInput = [];
        this.successList = [];

        this.hud.setStatus("Listen...");
        this.hud.showPlayerInput([], []);

        let i = 0;
        const playNext = () => {
            if (i >= this.melody.length) {
                this.hud.setStatus("Your Turn!");
                this.isInputActive = true;
                return;
            }
            const note = this.melody[i];
            this.soundManager.playNote(note);
            this.tongueDrum.flash(note);
            this.hud.showCenterNote(note);
            i++;
            this.time.delayedCall(500, playNext, [], this);
        };
        playNext();
    }
    changeMelody(){
        this.melody.push(Math.floor(Math.random() * 8) + 1);
    }
}
