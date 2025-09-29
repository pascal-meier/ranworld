export class Button extends Phaser.GameObjects.Container {
    constructor(scene, x, y, text, callback) {
        super(scene, x, y);

        this.scene = scene;

        // Hintergrund-Rechteck
        this.bg = scene.add.rectangle(0, 0, 200, 60, 0x1e1e1e, 0.8)
            .setStrokeStyle(2, 0xffffff)
            .setOrigin(0.5);

        // Text
        this.label = scene.add.text(0, 0, text, {
            fontSize: "24px",
            fontFamily: "Arial",
            color: "#ffffff"
        }).setOrigin(0.5);

        this.add([this.bg, this.label]);

        // Interaktivität
        this.setSize(200, 60);
        this.setInteractive({ useHandCursor: true })
            .on("pointerover", () => {
                this.bg.setFillStyle(0x444444, 1);
            })
            .on("pointerout", () => {
                this.bg.setFillStyle(0x1e1e1e, 0.8);
            })
            .on("pointerdown", () => {
                callback();
            });

        // In Szene hinzufügen
        scene.add.existing(this);
    }
}
