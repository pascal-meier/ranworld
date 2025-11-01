export const SCENE_KEY_LOOTYBOX_BOOT = "LootyBoxBootScene";
export const SCENE_KEY_LOOTYBOX_PRELOAD = "LootyBoxPreloadScene";
export class LootyBoxBootScene extends Phaser.Scene {
    constructor() {
        super(SCENE_KEY_LOOTYBOX_BOOT);
    }
    preload() {
        // Falls du gemeinsame Assets brauchst
    }
    create() {
        this.scene.start(SCENE_KEY_LOOTYBOX_PRELOAD);
    }
}
