// src/scenes/BootScene.ts
import { BaseScene } from "../core/scenes/BaseScene.js";
export class BootScene extends BaseScene {
    constructor() {
        super("BootScene");
    }
    preload() {
        this.load.image("base-bg", "public/assets/backgrounds/Start.png");
    }
    create() {
        super.create(); // wichtig, um Resize-Listener einzurichten
        const bg = this.add.image(0, 0, "base-bg").setOrigin(0).setName("base-bg");
        // Direkt danach schon mal das Layout aktualisieren
        this.onResize(this.scale.gameSize);
        this.scene.start("PlanetHitterScene");
    }
    onResize(gameSize) {
        const { width, height } = gameSize;
        const bg = this.children.getByName("base-bg");
        if (bg) {
            bg.setDisplaySize(width, height);
        }
    }
}
