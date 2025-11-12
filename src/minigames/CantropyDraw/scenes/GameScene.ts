import { BaseScene } from "../../../core/scenes/BaseScene.js";
import { RandomSeed } from "../systems/RandomSeed.js";
import { CompositionEngine, type EmotionProfile } from "../systems/CompositionEngine.js";
import { LightStroke } from "../objects/LightStroke.js";
import { SoundPalette } from "../systems/SoundPalette.js";
import { ComposerHUD } from "../ui/ComposerHUD.js";

export class CantropyDrawGameScene extends BaseScene {
  private seed!: RandomSeed;
  private composer!: CompositionEngine;
  private strokes!: LightStroke;
  private audioPalette!: SoundPalette;
  private hud!: ComposerHUD;
  private flowKey?: Phaser.Input.Keyboard.Key;
  private flowTimer?: Phaser.Time.TimerEvent;
  private isFlowing = false;
  private lastDragPaint = 0;

  // ℹ️ Provides Phaser with the scene key so it can be registered and referenced ℹ️
  constructor() {
    super("CantropyDrawGameScene");
  }

  // ℹ️ Wires up randomness, audio, visuals, HUD and input for both desktop and mobile interactions ℹ️
  create(): void {
    super.create();

    this.input.addPointer(2);

    this.seed = new RandomSeed();
    this.composer = new CompositionEngine(this.seed);
    this.strokes = new LightStroke(this);
    this.audioPalette = new SoundPalette(this);

    this.hud = new ComposerHUD(this, {
      onReplay: () => this.replayComposition(),
      onNewSeed: () => this.newSeed(),
      onNewComposition: () => this.newComposition(),
      onFlowToggle: () => this.toggleFlow(),
      onBack: () => this.scene.start("MainMenuScene"),
    });
    this.hud.setSeed(this.seed.getSeed());
    this.hud.setMessage("Touch gently to paint with chance.");
    this.hud.setFlowActive(this.isFlowing);

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.paintEvent(pointer.x, pointer.y);
    });
    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown) {
        this.paintEvent(pointer.x, pointer.y, true);
      }
    });

    this.flowKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    this.flowTimer = this.time.addEvent({
      delay: 420,
      loop: true,
      callback: () => {
        if (this.flowKey?.isDown || this.isFlowing) {
          this.paintEvent(
            this.seed.between(0, this.scale.width),
            this.seed.between(0, this.scale.height)
          );
        }
      },
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanup());
  }

  // ℹ️ Relayouts the HUD when the viewport changes to keep controls reachable ℹ️
  protected onResize(gameSize: Phaser.Structs.Size): void {
    super.onResize(gameSize);
    this.hud?.layout(gameSize.width, gameSize.height);
  }

  // ℹ️ Generates a single audiovisual event, throttling drag interactions when needed ℹ️
  private paintEvent(x: number, y: number, isDrag = false): void {
    if (isDrag) {
      const now = this.time.now;
      if (now - this.lastDragPaint < 60) {
        return;
      }
      this.lastDragPaint = now;
    }

    const artEvent = this.composer.craftEvent(x, y);
    this.strokes.emit(artEvent);
    this.audioPalette.play(artEvent.toneKey, artEvent.toneRate, artEvent.brightness, artEvent.chord);

    const descriptor = this.describeEmotion(artEvent.emotion, artEvent.brightness);
    this.hud.setMessage(`${descriptor} · Seed ${this.seed.getSeed()}`);
  }

  // ℹ️ Replays the last generated seed sequence to recreate the same audiovisual composition ℹ️
  private replayComposition(): void {
    this.strokes.clear();
    this.hud.setMessage("Let us listen to recorded echoes...");
    this.scheduleGuidedPulses();
  }

  // ℹ️ Generates an entirely new seed so future strokes form a different composition ℹ️
  private newSeed(): void {
    this.seed.reseed();
    this.composer = new CompositionEngine(this.seed);
    this.strokes.clear();
    this.hud.setSeed(this.seed.getSeed());
    this.hud.setMessage("Fresh seed, fresh emotions.");
  }

  // ℹ️ Creates a new seed and immediately showcases it with a guided pulse sequence ℹ️
  private newComposition(): void {
    this.seed.reseed();
    this.composer = new CompositionEngine(this.seed);
    this.strokes.clear();
    this.hud.setSeed(this.seed.getSeed());
    this.hud.setMessage("New composition blooming...");
    this.scheduleGuidedPulses();
  }

  // ℹ️ Toggles autonomous flow mode so the experience can run hands-free ℹ️
  private toggleFlow(): void {
    this.isFlowing = !this.isFlowing;
    this.hud.setFlowActive(this.isFlowing);
    this.hud.setMessage(
      this.isFlowing ? "Chance paints while you observe." : "Guide the resonance with your touch."
    );
  }

  // ℹ️ Queues up a series of timed strokes to demonstrate the active composition ℹ️
  private scheduleGuidedPulses(): void {
    this.seed.replay();
    const pulses = 12;
    let delay = 0;
    for (let i = 0; i < pulses; i++) {
      delay += 220;
      this.time.delayedCall(delay, () => {
        this.paintEvent(
          this.seed.between(this.scale.width * 0.2, this.scale.width * 0.8),
          this.seed.between(this.scale.height * 0.2, this.scale.height * 0.85)
        );
      });
    }
  }

  // ℹ️ Stops timers and clears lingering strokes when the scene shuts down ℹ️
  private cleanup(): void {
    this.flowTimer?.destroy();
    this.flowTimer = undefined;
    this.strokes.clear();
  }

  private describeEmotion(emotion: EmotionProfile, brightness: number): string {
    const intensity = brightness > 0.75 ? "bright" : brightness > 0.5 ? "glowing" : "soft";
    switch (emotion.label) {
      case "warm":
        return `Warm ${intensity} glow`;
      case "radiant":
        return `Radiant ${intensity} flare`;
      default:
        return `Calm ${intensity} breath`;
    }
  }
}



