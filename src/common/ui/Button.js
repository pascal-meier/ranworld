export class Button extends Phaser.GameObjects.Container {
    constructor(scene, x, y, text, callback) {
        super(scene, x, y);

        this.scene = scene;
        this._callback = callback;

        // Hintergrund
        this.bg = scene.add.rectangle(0, 0, 200, 60, 0x1e1e1e, 0.8)
            .setStrokeStyle(2, 0xffffff)
            .setOrigin(0.5);

        // Label
        this.label = scene.add.text(0, 0, text, {
            fontSize: "24px",
            fontFamily: "Arial",
            color: "#ffffff"
        }).setOrigin(0.5);

        this.add([this.bg, this.label]);
        scene.add.existing(this);

        this.setSize(200, 60);

        // Interaktivität
        this.bg.setInteractive({ useHandCursor: true })
            .on("pointerover", () => this.bg.setFillStyle(0x444444, 1))
            .on("pointerout", () => this.bg.setFillStyle(0x1e1e1e, 0.8))
            .on("pointerdown", () => this.handleClick());
    }

    handleClick() {
        // Kleine Klickanimation
        this.scene.tweens.add({
            targets: this,
            scale: { from: 0.95, to: 1 },
            duration: 120,
            ease: "Quad.easeOut"
        });

        if (this._callback) this._callback();
    }

    setCallback(cb) {
        this._callback = cb;
    }

    /**
     * Aktiviert/Deaktiviert den Button (eigene Funktion!)
     */
    setInteractionEnabled(enabled) {
        this.bg.disableInteractive();
        if (enabled) this.bg.setInteractive({ useHandCursor: true });
        this.alpha = enabled ? 1 : 0.5;
    }
}
