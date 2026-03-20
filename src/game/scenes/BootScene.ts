import { labStore } from "../core/LabStore.js";

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload(): void {
    this.load.image(
      "player-idle",
      "assets/actors/player/static/player-idle-static-v1.png"
    );
    this.load.image(
      "enemy-calibration-drone",
      "assets/actors/enemies/enemy-calibration-drone-idle-v1.png"
    );
    this.load.image(
      "event-terminal",
      "assets/actors/events/event-terminal-v1.png"
    );
    this.load.image(
      "reward-cache-sheet",
      "assets/actors/rewards/reward-cache-sheet-v1.png"
    );
    this.load.image(
      "node-base",
      "assets/ui/icons/nodes/node-base-style-v1.png"
    );
    this.load.image(
      "node-combat-symbol",
      "assets/ui/icons/nodes/node-combat-symbol-v1.png"
    );
    this.load.image(
      "node-event-symbol",
      "assets/ui/icons/nodes/node-event-symbol-v1.png"
    );
    this.load.image(
      "node-reward-symbol",
      "assets/ui/icons/nodes/node-reward-symbol-v1.png"
    );
  }

  create(): void {
    labStore.returnToSetup("new");
    this.scene.launch("OverlayScene");
    this.scene.start("SetupScene");
  }
}
