import { BaseScene } from "../../../core/scenes/BaseScene.js";
import HUD from "../ui/hud.js";
import TongueDrum from "../objects/tongueDrum.js";
import { DrumInput } from "../systems/DrumInput.js";
import { RhythmPattern } from "../systems/RhythmPattern.js";
import { PhaseManager } from "../systems/PhaseManager.js";
import { RoundConductor } from "../systems/RoundConductor.js";
import SoundController from "../systems/SoundController.js";
import type { PhaseDefinition } from "../systems/types.js";

export class RythmDrumGameScene extends BaseScene {
  private hud!: HUD;
  private drum!: TongueDrum;
  private soundController!: SoundController;
  private conductor!: RoundConductor;
  private phases!: PhaseManager;
  private isRoundLocked = false;
  private hasAnnouncedPhase = false;
  private viewport = { width: 0, height: 0 };

  // ℹ️ Registers the scene key so Phaser can boot this minigame ℹ️
  constructor() {
    super("RythmDrumGameScene");
  }

  // ℹ️ Boots all systems (sound, HUD, drum, phase logic) and wires player input ℹ️
  create(): void {
    super.create();

    this.updateViewport(this.scale.gameSize);

    this.soundController = new SoundController(this);
    this.hud = new HUD(this);

    const { width, height } = this.scale.gameSize;
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
    this.hud.setStartState("ready");

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanup());

    this.applyResponsiveLayout();
  }

  // ℹ️ Starts a new round only if no other sequence is currently playing ℹ️
  private handleStartRequested(): void {
    if (this.isRoundLocked) return;

    this.isRoundLocked = true;
    this.hud.setStartState("playing");

    const plan = this.phases.prepareRound();
    this.conductor.run(plan, (success) => {
      this.isRoundLocked = false;
      this.hud.setStartState("ready");

      if (success) {
        this.phases.registerSuccess();
      } else {
        this.phases.registerFailure();
      }
    });
  }

  // ℹ️ Updates the HUD whenever the skill/chance phase changes ℹ️
  private handlePhaseChanged(phase: PhaseDefinition): void {
    this.hud.setPhaseInfo(phase.title, phase.description);

    if (this.hasAnnouncedPhase) {
      this.hud.flashPhaseChange(phase.title);
      this.hud.setStatus(`${phase.title} unlocked! Press Start.`);
    } else {
      this.hasAnnouncedPhase = true;
    }
  }

  protected onResize(gameSize: Phaser.Structs.Size): void {
    this.updateViewport(gameSize);
    this.applyResponsiveLayout();
  }

  private updateViewport(gameSize: Phaser.Structs.Size): void {
    this.viewport.width = gameSize.width;
    this.viewport.height = gameSize.height;
  }

  private applyResponsiveLayout(): void {
    if (!this.hud || !this.drum) {
      return;
    }

    const width = this.viewport.width || this.scale.gameSize.width;
    const height = this.viewport.height || this.scale.gameSize.height;
    const isPortrait = height >= width;

    const drumDiameter = Math.min(width, height) * (isPortrait ? 0.78 : 0.68);
    const drumY = isPortrait ? height * 0.58 : height * 0.56;

    this.drum.setDisplaySize(drumDiameter, drumDiameter);
    this.drum.setPosition(width / 2, drumY);

    this.hud.resize(width, height);
    this.hud.syncDrumOverlay(this.drum.x, this.drum.y, this.drum.displayWidth);
  }

  destroy(): void {
    this.cleanup();
  }

  private cleanup(): void {
    this.conductor?.destroy();
    this.drum?.destroy();
    this.hud?.destroy();
  }
}
