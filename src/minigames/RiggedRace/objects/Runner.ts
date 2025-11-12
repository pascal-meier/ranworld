import type { RunnerConfig } from "../systems/types.js";

export class Runner extends Phaser.GameObjects.Container {
  private readonly sprite: Phaser.GameObjects.Sprite;
  private readonly nameText: Phaser.GameObjects.Text;
  private readonly luckBarBg: Phaser.GameObjects.Rectangle;
  private readonly luckBarRange: Phaser.GameObjects.Rectangle;
  private readonly luckCursor: Phaser.GameObjects.Rectangle;
  private readonly selectionRing: Phaser.GameObjects.Graphics;
  private readonly config: RunnerConfig;
  private selectCallback?: (runner: Runner) => void;
  private spawnX = 0;
  private spawnY = 0;

  // ℹ️ Constructs the runner visuals (sprite, name, luck bar) and wires interactivity ℹ️
  constructor(scene: Phaser.Scene, config: RunnerConfig) {
    super(scene);
    this.config = config;
    scene.add.existing(this);

    this.sprite = scene.add.sprite(0, -10, config.texture).setOrigin(0.5).setScale(2);
    this.nameText = scene.add
      .text(0, 50, `${config.name}`, {
        fontSize: "20px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.luckBarBg = scene.add.rectangle(0, 70, 140, 14, 0x0b0d10, 0.7).setOrigin(0.5);
    this.luckBarRange = scene.add.rectangle(0, 70, 130, 10, config.color, 0.35).setOrigin(0.5);
    this.luckCursor = scene.add.rectangle(0, 70, 6, 16, config.color, 1).setOrigin(0.5);

    this.selectionRing = scene.add.graphics({ x: 0, y: 0 });
    this.selectionRing.lineStyle(4, config.color, 0.8);
    this.selectionRing.strokeCircle(0, -10, 36);
    this.selectionRing.setVisible(false);

    this.add([
      this.selectionRing,
      this.sprite,
      this.nameText,
      this.luckBarBg,
      this.luckBarRange,
      this.luckCursor,
    ]);

    this.setSize(150, 100);
    this.setInteractive({ useHandCursor: true });
    this.on("pointerdown", () => this.selectCallback?.(this));
  }

  // ℹ️ Registers the callback that fires when this runner is tapped ℹ️
  setSelectCallback(callback: (runner: Runner) => void): void {
    this.selectCallback = callback;
  }

  // ℹ️ Positions the runner within its lane and records the spawn location ℹ️
  placeAt(x: number, y: number): void {
    this.spawnX = x;
    this.spawnY = y;
    this.setPosition(x, y);
  }

  // ℹ️ Repositions the runner without altering its spawn anchor ℹ️
  reposition(x: number, y: number): void {
    this.setPosition(x, y);
  }

  // ℹ️ Resets the runner back to its start line position ℹ️
  resetToStart(): void {
    this.setPosition(this.spawnX, this.spawnY);
    this.updateLuckIndicator(0);
    this.setSelected(false);
  }

  // ℹ️ Moves the runner forward by the provided distance ℹ️
  advance(distance: number): void {
    this.x += distance;
  }

  // ℹ️ Highlights or clears the selection ring ℹ️
  setSelected(selected: boolean): void {
    this.selectionRing.setVisible(selected);
  }

  // ℹ️ Updates the luck indicator cursor to visualize the current variance sample ℹ️
  updateLuckIndicator(ratio: number): void {
    const clamped = Phaser.Math.Clamp(ratio, -1, 1);
    this.luckCursor.x = clamped * (this.luckBarRange.width / 2);
    const fromColor = Phaser.Display.Color.HexStringToColor("#52f091");
    const toColor = Phaser.Display.Color.HexStringToColor("#ff7f50");
    const interpolated = Phaser.Display.Color.Interpolate.ColorWithColor(
      fromColor,
      toColor,
      100,
      Math.round((clamped + 1) * 50)
    );
    this.luckCursor.fillColor = Phaser.Display.Color.GetColor(interpolated.r, interpolated.g, interpolated.b);
  }

  // ℹ️ Returns the immutable runner configuration ℹ️
  getProfile(): RunnerConfig {
    return this.config;
  }
}
