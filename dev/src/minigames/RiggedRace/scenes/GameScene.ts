import { BaseScene } from "../../../core/scenes/BaseScene.js";
import { Track } from "../objects/track.js";
import { Runner } from "../objects/Runner.js";
import { RaceHUD } from "../ui/RaceHUD.js";
import { RaceController } from "../systems/RaceController.js";
import { BoostManager } from "../systems/BoostManager.js";
import type { RunnerConfig, RaceDimensions } from "../systems/types.js";

export class RiggedRaceGameScene extends BaseScene {
  private background!: Phaser.GameObjects.Image;
  private tracks: Track[] = [];
  private runners: Runner[] = [];
  private hud!: RaceHUD;
  private raceController!: RaceController;
  private boostManager!: BoostManager;
  private selectedRunner?: Runner;
  private dimensions: RaceDimensions = { startX: 0, finishX: 0 };
  private readonly boostUses = 2;
  private static readonly MIN_LANE_SPACING = 120;
  private readonly runnerConfigs: RunnerConfig[] = [
    { id: "ember", name: "Ember", texture: "fox01", color: 0xffb347, baseSpeed: 125, variance: 18 },
    { id: "sol", name: "Sol", texture: "fox02", color: 0x4dd1ff, baseSpeed: 118, variance: 20 },
    { id: "ash", name: "Ash", texture: "fox03", color: 0xb88bff, baseSpeed: 132, variance: 16 },
  ];

  // ℹ️ Registers the scene key with Phaser ℹ️
  constructor() {
    super("RiggedRaceGameScene");
  }

  // ℹ️ Sets up background, tracks, runners, HUD, and race systems ℹ️
  create(): void {
    this.configureDimensions();
    this.createBackground();
    this.createTracks();
    this.createRunners();
    this.setupHud();
    this.setupRaceSystems();
    this.registerShutdownHook();
    super.create();
  }

  // ℹ️ Initializes start/finish coordinates based on current viewport ℹ️
  private configureDimensions(): void {
    const { width } = this.scale;
    this.dimensions = {
      startX: width * 0.18,
      finishX: width * 0.9,
    };
  }

  // ℹ️ Draws the parallax background covering the full viewport ℹ️
  private createBackground(): void {
    const { width, height } = this.scale;
    this.background = this.add.image(width / 2, height / 2, "base-bg");
    this.background.setDisplaySize(width, height);
  }

  // ℹ️ Creates lane graphics spaced evenly across the playfield ℹ️
  private createTracks(): void {
    this.tracks.forEach((track) => track.destroy());
    this.tracks = [];
    const { width, height } = this.scale;
    const laneSpacing = this.getLaneSpacing(height);
    const startY = height * 0.35;
    const trackLength = this.dimensions.finishX - this.dimensions.startX + 40;

    for (let i = 0; i < this.runnerConfigs.length; i++) {
      const track = new Track(this, trackLength);
      track.setPosition(this.dimensions.startX - 20, startY + i * laneSpacing);
      this.tracks.push(track);
    }
  }

  // ℹ️ Instantiates runners according to configuration and positions them on lanes ℹ️
  private createRunners(): void {
    this.runners.forEach((runner) => runner.destroy());
    this.runners = [];
    const { height } = this.scale;
    const laneSpacing = this.getLaneSpacing(height);
    const startY = height * 0.35;

    this.runners = this.runnerConfigs.map((config, index) => {
      const runner = new Runner(this, config);
      runner.placeAt(this.dimensions.startX, startY + index * laneSpacing);
      runner.setSelectCallback((selected) => this.handleRunnerSelection(selected));
      return runner;
    });
  }

  // ℹ️ Builds the HUD and wires button callbacks ℹ️
  private setupHud(): void {
    this.hud = new RaceHUD(this, {
      onStart: () => this.handleStartRequested(),
      onBoost: () => this.handleBoostRequested(),
      onBack: () => this.handleBackRequested(),
    });
    this.hud.setBoostState(this.boostUses, false);
  }

  // ℹ️ Configures the race controller and boost manager ℹ️
  private setupRaceSystems(): void {
    this.boostManager = new BoostManager(this, this.boostUses, 1600);
    this.raceController = new RaceController(this, this.runners, this.dimensions, {
      tickMs: 110,
      fairnessLabelCallback: (text) => this.hud.setFairnessLabel(text),
    });
    this.raceController.setBoostManager(this.boostManager);
  }

  // ℹ️ Handles selection toggles when a runner is tapped ℹ️
  private handleRunnerSelection(runner: Runner): void {
    if (this.selectedRunner === runner) {
      runner.setSelected(false);
      this.selectedRunner = undefined;
      this.hud.setSelectionSummary();
      this.hud.setTitle("Tap a runner to inspect");
      this.hud.setBoostState(this.boostManager.getRemainingUses(), false);
      return;
    }

    this.selectedRunner?.setSelected(false);
    runner.setSelected(true);
    this.selectedRunner = runner;
    const profile = runner.getProfile();
    this.hud.setSelectionSummary(profile.name, profile.baseSpeed, profile.variance);
    this.hud.setTitle("Press start when ready");
    this.hud.setBoostState(this.boostManager.getRemainingUses(), this.boostManager.getRemainingUses() > 0);
  }

  // ℹ️ Starts the race if a runner is selected and no race is active ℹ️
  private handleStartRequested(): void {
    if (!this.selectedRunner) {
      this.hud.setTitle("Select a runner first");
      return;
    }

    this.hud.setTitle("Controlled uncertainty in motion");
    this.raceController.start((winner) => this.handleRaceFinished(winner));
  }

  // ℹ️ Attempts to trigger a manual boost for the selected runner ℹ️
  private handleBoostRequested(): void {
    if (!this.selectedRunner) {
      this.hud.setTitle("Select a runner before boosting");
      return;
    }

    if (!this.boostManager.triggerBoost(this.selectedRunner.getProfile().id)) {
      this.hud.setTitle("No boosts left");
      return;
    }

    const remaining = this.boostManager.getRemainingUses();
    this.hud.setBoostState(remaining, remaining > 0);
    this.hud.setTitle("Boost engaged for a moment");
  }

  // ℹ️ Returns to the main menu after stopping ongoing race logic ℹ️
  private handleBackRequested(): void {
    this.resetState();
    this.scene.start("MainMenuScene");
  }

  // ℹ️ Updates the HUD and resets state once a winner is declared ℹ️
  private handleRaceFinished(winner: Runner): void {
    this.hud.setTitle(`${winner.getProfile().name} crosses first!`);
    this.time.delayedCall(3000, () => this.resetState());
  }

  // ℹ️ Resets runners, selections, boosts, and HUD text ℹ️
  private resetState(): void {
    this.resetCoreRaceState();
    this.refreshHudAfterReset();
  }

  // ℹ️ Responds to viewport changes by repositioning elements ℹ️
  protected onResize(gameSize: Phaser.Structs.Size): void {
    super.onResize(gameSize);
    this.configureDimensions();
    this.background?.setPosition(gameSize.width / 2, gameSize.height / 2).setDisplaySize(gameSize.width, gameSize.height);
    this.createTracks();
    const laneSpacing = this.getLaneSpacing(gameSize.height);
    const startY = gameSize.height * 0.35;
    this.runners.forEach((runner, index) => {
      const progress = Phaser.Math.Clamp(
        (runner.x - this.dimensions.startX) / (this.dimensions.finishX - this.dimensions.startX),
        0,
        1
      );
      const newX = this.dimensions.startX + progress * (this.dimensions.finishX - this.dimensions.startX);
      runner.reposition(newX, startY + index * laneSpacing);
    });
    this.raceController.setDimensions(this.dimensions);
    this.hud.layout(gameSize.width, gameSize.height);
  }

  // ℹ️ Calculates vertical spacing between lanes, ensuring a reasonable minimum ℹ️
  private getLaneSpacing(height: number): number {
    return Math.max(RiggedRaceGameScene.MIN_LANE_SPACING, height * 0.18);
  }

  // ℹ️ Stops timers and boosts when the scene shuts down ℹ️
  private registerShutdownHook(): void {
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.resetCoreRaceState();
    });
  }

  private resetCoreRaceState(): void {
    this.raceController.stop();
    this.boostManager.reset(this.boostUses);
    this.runners.forEach((runner) => runner.resetToStart());
    this.selectedRunner?.setSelected(false);
    this.selectedRunner = undefined;
  }

  private refreshHudAfterReset(): void {
    this.hud.setSelectionSummary();
    this.hud.setBoostState(this.boostManager.getRemainingUses(), false);
    this.hud.setTitle("Tap a runner to inspect");
  }
}
