export const SCENE_KEY_LOOTYBOX_BOOT = "LootyBoxBootScene";
export const SCENE_KEY_LOOTYBOX_PRELOAD = "LootyBoxPreloadScene";

export class LootyBoxBootScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEY_LOOTYBOX_BOOT);
  }

  preload(): void {
    // Falls du gemeinsame Assets brauchst
  }

  create(): void {
    this.scene.start(SCENE_KEY_LOOTYBOX_PRELOAD);
  }
}
