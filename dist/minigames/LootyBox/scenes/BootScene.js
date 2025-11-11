import { BaseScene } from "../../../core/scenes/BaseScene.js";
export const SCENE_KEY_LOOTYBOX_BOOT = "LootyBoxBootScene";
export const SCENE_KEY_LOOTYBOX_PRELOAD = "LootyBoxPreloadScene";
export class LootyBoxBootScene extends BaseScene {
    constructor() {
        super(SCENE_KEY_LOOTYBOX_BOOT);
    }
    preload() {
        // Falls du gemeinsame Assets brauchst
    }
    create() {
        super.create();
        this.scene.start(SCENE_KEY_LOOTYBOX_PRELOAD);
    }
}
