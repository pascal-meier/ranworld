import { BaseScene } from "../../../core/scenes/BaseScene.js";
import type { ArtEvent, EmotionProfile } from "../systems/CompositionEngine.js";
import { CompositionEngine } from "../systems/CompositionEngine.js";
import { LightStroke } from "../objects/LightStroke.js";
import { ComposerHUD } from "../ui/ComposerHUD.js";
import { RandomSeed } from "../systems/RandomSeed.js";
import { SoundPalette } from "../systems/SoundPalette.js";
import type { BoundaryMode, CompositionControls, SymmetryMode } from "../types.js";

interface PaintInput {
  x: number;
  y: number;
}

export class CantropyDrawGameScene extends BaseScene {
  private seed!: RandomSeed;
  private composer!: CompositionEngine;
  private strokes!: LightStroke;
  private audioPalette!: SoundPalette;
  private hud!: ComposerHUD;
  private overlay!: Phaser.GameObjects.Graphics;
  private flowKey?: Phaser.Input.Keyboard.Key;
  private flowTimer?: Phaser.Time.TimerEvent;
  private isFlowing = false;
  private lastPaintTime = 0;
  private lastSoundTime = 0;
  private static readonly MIN_PAINT_INTERVAL = 160;
  private static readonly MIN_SOUND_INTERVAL = 90;
  private baseSeed = "";

  private controlState: CompositionControls & { symmetry: SymmetryMode; boundaries: BoundaryMode } = {
    noise: 0.45,
    colorDrift: 0.5,
    variation: 0,
    patternShift: 0,
    symmetry: "radial",
    boundaries: "clamp",
  };

  private inputHistory: PaintInput[] = [];
  private redoHistory: PaintInput[] = [];
  private eventHistory: ArtEvent[] = [];

  constructor() {
    super("CantropyDrawGameScene");
  }

  create(): void {
    super.create();

    this.input.addPointer(2);

    this.seed = new RandomSeed();
    this.baseSeed = this.seed.getSeed();
    this.composer = new CompositionEngine(this.seed, this.controlState);
    this.strokes = new LightStroke(this);
    this.audioPalette = new SoundPalette(this);
    this.overlay = this.add.graphics().setDepth(-1);

    this.hud = new ComposerHUD(this, {
      onReplay: () => this.replayComposition(),
      onNewSeed: () => this.newSeed(),
      onNewComposition: () => this.newComposition(),
      onFlowToggle: () => this.toggleFlow(),
      onBack: () => this.scene.start("MainMenuScene"),
      onUndo: () => this.undo(),
      onRedo: () => this.redo(),
      onVariation: () => this.applyVariation(),
      onPatternShift: () => this.shiftPattern(),
      onSymmetryChange: (mode) => this.setSymmetry(mode),
      onNoiseChange: (value) => this.setNoise(value),
      onColorDriftChange: (value) => this.setColorDrift(value),
      onBoundariesToggle: (mode) => this.setBoundaries(mode),
    });

    this.hud.setSeed(this.baseSeed);
    this.hud.setMessage("Touch gently to paint with chance.");
    this.hud.setFlowActive(this.isFlowing);
    this.hud.setSymmetry(this.controlState.symmetry);
    this.hud.setBoundary(this.controlState.boundaries);
    this.hud.setNoise(this.controlState.noise);
    this.hud.setColorDrift(this.controlState.colorDrift);
    this.hud.setVariationIndex(this.controlState.variation);
    this.hud.layout(this.scale.width, this.scale.height);

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (this.isPointerOverHud(pointer)) return;
      this.paintEvent(pointer.x, pointer.y);
    });
    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown && !this.isPointerOverHud(pointer)) {
        this.paintEvent(pointer.x, pointer.y, true);
      }
    });

    this.flowKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    this.flowTimer = this.time.addEvent({
      delay: 420,
      loop: true,
      callback: () => {
        if (this.flowKey?.isDown || this.isFlowing) {
          const { x, y } = this.randomPointWithinBounds();
          this.paintEvent(x, y);
        }
      },
    });

    this.drawOverlay();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanup());
  }

  protected onResize(gameSize: Phaser.Structs.Size): void {
    super.onResize(gameSize);
    this.hud?.layout(gameSize.width, gameSize.height);
    this.drawOverlay();
  }

  private paintEvent(x: number, y: number, isDrag = false): void {
    const now = this.time.now;
    if (now - this.lastPaintTime < CantropyDrawGameScene.MIN_PAINT_INTERVAL) {
      return;
    }
    if (isDrag) {
      this.lastPaintTime = now;
    } else {
      this.lastPaintTime = now;
    }

    const events = this.createEventsForInput({ x, y }, true, true);
    const last = events[events.length - 1];
    if (last) {
      this.updateMessage(last);
    }
  }

  private createEventsForInput(
    input: PaintInput,
    withSound: boolean,
    recordInput: boolean
  ): ArtEvent[] {
    const points = this.applySymmetry(input.x, input.y);
    const events: ArtEvent[] = [];

    points.forEach((point) => {
      const bounded = this.applyBoundaries(point.x, point.y);
      const artEvent = this.composer.craftEvent(bounded.x, bounded.y);
      events.push(artEvent);
      this.strokes.emit(artEvent);
      if (withSound) {
        this.audioPalette.play(artEvent.toneKey, artEvent.toneRate, artEvent.brightness, artEvent.chord);
      }
    });

    if (recordInput) {
      this.inputHistory.push(input);
      this.redoHistory = [];
      this.eventHistory.push(...events);
    }

    return events;
  }

  private replayComposition(): void {
    if (!this.inputHistory.length) {
      this.scheduleGuidedPulses();
      this.hud.setMessage("Guided pulses are showing the seed.");
      return;
    }

    this.hud.setMessage("Replaying your strokes...");
    this.rebuildFromInputs(true);
  }

  private newSeed(): void {
    this.seed.reseed();
    this.baseSeed = this.seed.getSeed();
    this.resetControlOffsets();
    this.clearHistory();
    this.resetComposer();
    this.hud.setSeed(this.baseSeed);
    this.hud.setVariationIndex(this.controlState.variation);
    this.hud.setMessage("Fresh seed, fresh emotions.");
    this.drawOverlay();
  }

  private newComposition(): void {
    this.seed.reseed();
    this.baseSeed = this.seed.getSeed();
    this.resetControlOffsets();
    this.clearHistory();
    this.resetComposer();
    this.hud.setSeed(this.baseSeed);
    this.hud.setVariationIndex(this.controlState.variation);
    this.hud.setMessage("New composition blooming...");
    this.scheduleGuidedPulses();
    this.drawOverlay();
  }

  private toggleFlow(): void {
    this.isFlowing = !this.isFlowing;
    this.hud.setFlowActive(this.isFlowing);
    this.hud.setMessage(this.isFlowing ? "Chance paints while you observe." : "Guide the resonance with your touch.");
  }

  private scheduleGuidedPulses(): void {
    this.resetComposer(true);
    const pulses = 10;
    let delay = 0;
    for (let i = 0; i < pulses; i++) {
      delay += 180;
      this.time.delayedCall(delay, () => {
        const point = this.randomPointWithinBounds();
        const events = this.createEventsForInput(point, i % 2 === 0, true);
        const last = events[events.length - 1];
        if (last && i === pulses - 1) {
          this.updateMessage(last);
        }
      });
    }
  }

  private undo(): void {
    if (!this.inputHistory.length) return;
    const removed = this.inputHistory.pop();
    if (removed) {
      this.redoHistory.push(removed);
      this.rebuildFromInputs(false);
    }
  }

  private redo(): void {
    if (!this.redoHistory.length) return;
    const input = this.redoHistory.pop();
    if (input) {
      this.inputHistory.push(input);
      this.rebuildFromInputs(false);
    }
  }

  private applyVariation(): void {
    this.controlState.variation += 1;
    this.hud.setVariationIndex(this.controlState.variation);
    this.hud.setMessage("Variation rerolled. Your strokes stay; the randomness shifts.");
    this.rebuildFromInputs(true);
  }

  private shiftPattern(): void {
    this.controlState.patternShift += 1;
    this.hud.setMessage("Pattern shifted. Shapes breathe in a new rhythm.");
    this.rebuildFromInputs(false);
  }

  private setNoise(value: number): void {
    this.controlState.noise = value;
    this.composer.setControls(this.controlState);
    this.drawOverlay();
    this.rebuildFromInputs(false);
  }

  private setColorDrift(value: number): void {
    this.controlState.colorDrift = value;
    this.composer.setControls(this.controlState);
    this.rebuildFromInputs(false);
  }

  private setSymmetry(mode: SymmetryMode): void {
    this.controlState.symmetry = mode;
    this.hud.setSymmetry(mode);
    this.drawOverlay();
    this.rebuildFromInputs(false);
  }

  private setBoundaries(mode: BoundaryMode): void {
    this.controlState.boundaries = mode;
    this.hud.setBoundary(mode);
    this.drawOverlay();
    this.rebuildFromInputs(false);
  }

  private rebuildFromInputs(playSound: boolean): void {
    this.strokes.clear();
    this.resetComposer(true);
    this.eventHistory = [];
    let last: ArtEvent | undefined;
    this.inputHistory.forEach((input) => {
      const events = this.createEventsForInput(input, playSound, false);
      this.eventHistory.push(...events);
      last = events[events.length - 1] ?? last;
    });
    if (last) {
      this.updateMessage(last);
    }
  }

  private resetComposer(restartSeed = false): void {
    const saltedSeed = this.buildSeedSalt();
    if (restartSeed) {
      this.seed.reseed(saltedSeed);
    } else {
      this.seed = new RandomSeed(saltedSeed);
    }
    this.composer = new CompositionEngine(this.seed, this.controlState);
  }

  private clearHistory(): void {
    this.inputHistory = [];
    this.redoHistory = [];
    this.eventHistory = [];
    this.strokes.clear();
  }

  private applySymmetry(x: number, y: number): PaintInput[] {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    switch (this.controlState.symmetry) {
      case "vertical":
        return [
          { x, y },
          { x: centerX * 2 - x, y },
        ];
      case "horizontal":
        return [
          { x, y },
          { x, y: centerY * 2 - y },
        ];
      case "radial":
        return [
          { x, y },
          { x: centerX * 2 - x, y },
          { x, y: centerY * 2 - y },
          { x: centerX * 2 - x, y: centerY * 2 - y },
        ];
      default:
        return [{ x, y }];
    }
  }

  private applyBoundaries(x: number, y: number): PaintInput {
    if (this.controlState.boundaries === "bleed") {
      return { x, y };
    }
    const { width, height } = this.scale;
    const padding = Math.max(Math.min(width, height) * 0.06, 24);
    return {
      x: Phaser.Math.Clamp(x, padding, width - padding),
      y: Phaser.Math.Clamp(y, padding, height - padding),
    };
  }

  private randomPointWithinBounds(): PaintInput {
    const { width, height } = this.scale;
    if (this.controlState.boundaries === "bleed") {
      return { x: this.seed.between(0, width), y: this.seed.between(0, height) };
    }
    const padding = Math.max(Math.min(width, height) * 0.06, 24);
    return {
      x: this.seed.between(padding, width - padding),
      y: this.seed.between(padding, height - padding),
    };
  }

  private isPointerOverHud(pointer: Phaser.Input.Pointer): boolean {
    const hits =
      this.input.manager?.hitTest(pointer, this.children.list, this.cameras.main) ??
      [];
    return hits.some(
      (obj: any) =>
        obj?.getData?.("hud") === true || obj?.name === "hud-ui"
    );
  }

  private drawOverlay(): void {
    if (!this.overlay) {
      this.overlay = this.add.graphics().setDepth(-1);
    }
    const { width, height } = this.scale;
    this.overlay.clear();

    if (this.controlState.boundaries === "clamp") {
      const padding = Math.max(Math.min(width, height) * 0.06, 24);
      this.overlay.lineStyle(2, 0xffffff, 0.14);
      this.overlay.strokeRect(padding, padding, width - padding * 2, height - padding * 2);
    } else {
      this.overlay.lineStyle(1, 0xffffff, 0.08);
      this.overlay.strokeRect(0, 0, width, height);
    }

    this.overlay.lineStyle(1.5, 0xffffff, 0.12);
    if (this.controlState.symmetry === "vertical" || this.controlState.symmetry === "radial") {
      this.overlay.lineBetween(width / 2, 0, width / 2, height);
    }
    if (this.controlState.symmetry === "horizontal" || this.controlState.symmetry === "radial") {
      this.overlay.lineBetween(0, height / 2, width, height / 2);
    }

    const radius = Phaser.Math.Linear(Math.min(width, height) * 0.12, Math.min(width, height) * 0.34, this.controlState.noise);
    this.overlay.fillStyle(0x00c8ff, 0.06 + this.controlState.noise * 0.08);
    this.overlay.fillCircle(width * 0.5, height * 0.55, radius);
  }

  private updateMessage(event: ArtEvent): void {
    const descriptor = this.describeEmotion(event.emotion, event.brightness);
    this.hud.setMessage(`${descriptor} | Seed ${this.baseSeed}`);
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

  private buildSeedSalt(): string {
    return `${this.baseSeed}-v${this.controlState.variation}-p${this.controlState.patternShift}`;
  }

  private resetControlOffsets(): void {
    this.controlState.variation = 0;
    this.controlState.patternShift = 0;
    this.hud.setVariationIndex(0);
  }

  private cleanup(): void {
    this.flowTimer?.destroy();
    this.flowTimer = undefined;
    this.strokes.clear();
  }
}
