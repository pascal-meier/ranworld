import HUD from "../ui/hud.js";
import SoundManager from "../audio/soundManager.js";
import TongueDrum from "../objects/tongueDrum.js";

export class RythmDrumGameScene extends Phaser.Scene {
    private soundManager!: SoundManager;
    private hud!: HUD;
    private tongueDrum!: TongueDrum;

    private melody: number[] = [1, 7, 5];
    private playerInput: number[] = [];
    private successList: boolean[] = [];
    private score: number = 0;
    private isPlaying: boolean = false;
    private isInputActive: boolean = false;

    constructor() {
        super("RythmDrumGameScene");
    }

    create(): void {
        const { width, height } = this.scale;

        // ⚙️ Systems
        this.soundManager = new SoundManager(this);
        this.hud = new HUD(this);

        // 🥁 Drum object
        this.tongueDrum = new TongueDrum(this, width / 2, height / 2, "drum");

        // 🧭 HUD setup
        this.hud.setStartCallback(() => {
            if (!this.isPlaying) this.startMelody();
        });

        this.hud.setBackCallback(() => {
            this.scene.start("MainMenuScene");
        });

        this.hud.setScore(this.score);
        this.hud.setStatus("Start?");

        // 🎹 Input von TongueDrum
        // TongueDrum ruft scene.onNotePlayed(segment) intern auf
        (this as any).onNotePlayed = (segment: number) => {
            this.soundManager.playNote(segment);
            this.tongueDrum.flash(segment);
            this.hud.showCenterNote(segment);

            // Wenn nicht in Eingabephase → nur frei spielen
            if (!this.isInputActive) return;

            const index = this.playerInput.length;
            const expected = this.melody[index];
            const correct = expected === segment;

            this.playerInput.push(segment);
            this.successList.push(correct);
            this.hud.showPlayerInput(this.playerInput, this.successList);

            if (!correct) {
                // ❌ Falsch: sofort abbrechen
                this.isInputActive = false;
                this.isPlaying = false;
                this.hud.setStatus("❌ Try Again!");
                this.soundManager.playFail();
                this.tongueDrum.failFlash();
                return;
            }

            // 🎉 Wenn komplett richtig
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
    }

    private startMelody(): void {
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

    private changeMelody(): void {
        this.melody.push(Math.floor(Math.random() * 8) + 1);
    }
}
