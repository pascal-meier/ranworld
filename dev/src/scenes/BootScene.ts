// src/scenes/BootScene.ts
import { BaseScene } from "../core/scenes/BaseScene.js";

export class BootScene extends BaseScene {
  constructor() {
    super("BootScene");
  }

  preload(): void {
    this.load.image("base-bg", "public/assets/backgrounds/Start.png");
    this.load.image("ui_button_menu", "public/assets/common/menu_button.png");
    this.load.image("ui_button_back", "public/assets/common/back_button.png");
  }

  create(): void {
    super.create(); // wichtig, um Resize-Listener einzurichten

    const bg = this.add.image(0, 0, "base-bg").setOrigin(0).setName("base-bg");

    // Direkt danach schon mal das Layout aktualisieren
    this.onResize(this.scale.gameSize);

    this.scene.start("PlanetHitterScene");
  }

  protected onResize(gameSize: Phaser.Structs.Size): void {
    const { width, height } = gameSize;

    const bg = this.children.getByName("base-bg") as Phaser.GameObjects.Image;
    if (bg) {
      bg.setDisplaySize(width, height);
    }
  }
}
