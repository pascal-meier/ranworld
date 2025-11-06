export const SCENE_KEY_CantropyDraw_BOOT = "CantropyDrawBootScene";
export const SCENE_KEY_CantropyDraw_PRELOAD = "CantropyDrawPreloadScene";
export class CantropyDrawBootScene extends Phaser.Scene {
    constructor() {
        super(SCENE_KEY_CantropyDraw_BOOT);
    }
    preload() {
        // Falls du gemeinsame Assets brauchst
    }
    create() {
        this.scene.start(SCENE_KEY_CantropyDraw_PRELOAD);
    }
}
