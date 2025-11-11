export class Box extends Phaser.GameObjects.Sprite {
    tier;
    closedFrame;
    openFrame;
    boxScale;
    onClick;
    constructor(scene, x, y, frame, tier, onClick) {
        super(scene, x, y, "box", frame);
        this.tier = tier;
        this.closedFrame = frame;
        this.openFrame = frame + 1;
        this.boxScale = 3;
        this.onClick = onClick;
        this.setInteractive({ useHandCursor: true });
        this.setOrigin(0.5).setScale(this.boxScale);
        this.registerEvents();
        scene.add.existing(this);
    }
    registerEvents() {
        this.on("pointerover", () => this.scene.tweens.add({ targets: this, scale: this.boxScale * 1.2, duration: 150 }));
        this.on("pointerout", () => this.scene.tweens.add({ targets: this, scale: this.boxScale, duration: 150 }));
        this.on("pointerdown", () => this.onClick(this));
    }
    open() {
        this.setFrame(this.openFrame);
        this.scene.tweens.add({
            targets: this,
            scale: this.boxScale * 1.4,
            yoyo: true,
            duration: 200,
            ease: "Back.Out",
        });
    }
    getTier() {
        return this.tier;
    }
    /**
     * Passt die Basis-Skalierung an, damit die Box auf unterschiedlichen Bildschirmgroessen sinnvoll wirkt.
     */
    setBaseScale(scale) {
        this.boxScale = scale;
        this.setScale(this.boxScale);
    }
}
