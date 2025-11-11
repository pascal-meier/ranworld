export class Box extends Phaser.GameObjects.Sprite {
    tier;
    closedFrame;
    openFrame;
    boxScale;
    onClick;
    /**
     * ℹ️ Creates a new loot box sprite and wires up pointer events. ℹ️
     */
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
    /**
     * ℹ️ Registers hover and click reactions for the box sprite. ℹ️
     */
    registerEvents() {
        this.on("pointerover", () => this.scene.tweens.add({ targets: this, scale: this.boxScale * 1.2, duration: 150 }));
        this.on("pointerout", () => this.scene.tweens.add({ targets: this, scale: this.boxScale, duration: 150 }));
        this.on("pointerdown", () => this.onClick(this));
    }
    /**
     * ℹ️ Switches to the open frame and plays a bounce animation. ℹ️
     */
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
    /**
     * ℹ️ Returns the configured tier of the box. ℹ️
     */
    getTier() {
        return this.tier;
    }
    /**
     * ℹ️ Adjusts the base scale so the box looks correct on varying screen sizes. ℹ️
     */
    setBaseScale(scale) {
        this.boxScale = scale;
        this.setScale(this.boxScale);
    }
}
