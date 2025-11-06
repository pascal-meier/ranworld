export const SCENE_KEY_RiggedRace_BOOT = "RiggedRaceBootScene";
export const SCENE_KEY_RiggedRace_PRELOAD = "RiggedRacePreloadScene";
export class RiggedRaceBootScene extends Phaser.Scene {
    constructor() {
        super(SCENE_KEY_RiggedRace_BOOT);
    }
    preload() {
        // Falls du gemeinsame Assets brauchst
    }
    create() {
        this.scene.start(SCENE_KEY_RiggedRace_PRELOAD);
    }
}
