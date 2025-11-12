import { BaseScene } from "../../../core/scenes/BaseScene.js";
import HUD from "../ui/hud.js";
import TongueDrum from "../objects/tongueDrum.js";
import { DrumInput } from "../systems/DrumInput.js";
import { RhythmPattern } from "../systems/RhythmPattern.js";
import { PhaseManager } from "../systems/PhaseManager.js";
import { RoundConductor } from "../systems/RoundConductor.js";
import SoundController from "../systems/SoundController.js";
export class RythmDrumGameScene extends BaseScene {
    hud;
    drum;
    soundController;
    conductor;
    phases;
    isRoundLocked = false;
    hasAnnouncedPhase = false;
    // ℹ️ Registers the scene key so Phaser can boot this minigame ℹ️
    constructor() {
        super("RythmDrumGameScene");
    }
    // ℹ️ Boots all systems (sound, HUD, drum, phase logic) and wires player input ℹ️
    create() {
        super.create();
        this.soundController = new SoundController(this);
        this.hud = new HUD(this);
        const { width, height } = this.scale;
        this.drum = new TongueDrum(this, width / 2, height / 2, "drum");
        const input = new DrumInput(this.drum);
        const pattern = new RhythmPattern();
        this.phases = new PhaseManager(pattern, {
            onPhaseChanged: (phase) => this.handlePhaseChanged(phase),
            onProgress: (current, total) => this.hud.setPhaseProgress(current, total),
            onScore: (score) => this.hud.setScore(score),
            onChance: (label, intensity) => this.hud.setChanceInfo(label, intensity),
        });
        this.conductor = new RoundConductor(this, this.hud, this.drum, this.soundController, input);
        this.hud.setStartCallback(() => this.handleStartRequested());
        this.hud.setBackCallback(() => this.scene.start("MainMenuScene"));
        this.hud.setChanceInfo("Chance: 0% (pure skill)", 0);
        this.hud.setStatus("Press Start to hear the groove.");
        this.hud.setStartEnabled(true);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.conductor.cancel());
    }
    // ℹ️ Starts a new round only if no other sequence is currently playing ℹ️
    handleStartRequested() {
        if (this.isRoundLocked)
            return;
        this.isRoundLocked = true;
        this.hud.setStartEnabled(false);
        const plan = this.phases.prepareRound();
        this.conductor.run(plan, (success) => {
            this.isRoundLocked = false;
            this.hud.setStartEnabled(true);
            if (success) {
                this.phases.registerSuccess();
            }
            else {
                this.phases.registerFailure();
            }
        });
    }
    // ℹ️ Updates the HUD whenever the skill/chance phase changes ℹ️
    handlePhaseChanged(phase) {
        this.hud.setPhaseInfo(phase.title, phase.description);
        if (this.hasAnnouncedPhase) {
            this.hud.flashPhaseChange(phase.title);
            this.hud.setStatus(`${phase.title} unlocked! Press Start.`);
        }
        else {
            this.hasAnnouncedPhase = true;
        }
    }
}
