import { BaseScene } from "../../../core/scenes/BaseScene.js";
export const SCENE_KEY_LOOTYBOX_BOOT = "LootyBoxBootScene";
export const SCENE_KEY_LOOTYBOX_PRELOAD = "LootyBoxPreloadScene";
export class LootyBoxBootScene extends BaseScene {
    /**
     * ℹ️ Sets up the boot scene with its unique key. ℹ️
     */
    constructor() {
        super(SCENE_KEY_LOOTYBOX_BOOT);
    }
    /**
     * ℹ️ Preloads shared assets required before the dedicated preload scene. ℹ️
     */
    preload() {
        // Load shared assets here if needed.
    }
    /**
     * ℹ️ Hands control over to the preload scene after the boot sequence. ℹ️
     */
    create() {
        super.create();
        this.scene.start(SCENE_KEY_LOOTYBOX_PRELOAD);
    }
}
