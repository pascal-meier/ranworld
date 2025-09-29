// prefab-button.js
export default class PrefabButton extends Phaser.GameObjects.Container {
    constructor(scene, x, y, label, callback, options = {}) {
        super(scene, x, y);

        // Default-Optionen
        const {
            width = 150,
            height = 50,
            bgColor = 0x1d3557,
            hoverColor = 0x457b9d,
            textColor = '#ffffff',
            fontSize = '20px',
            radius = 10
        } = options;

        // Hintergrund (abgerundetes Rechteck)
        this.bg = scene.add.rectangle(0, 0, width, height, bgColor, 1)
            .setOrigin(0.5)
            .setStrokeStyle(2, 0xffffff, 0.8);

        // Abgerundete Ecken simulieren
        this.bg.setRadius ? this.bg.setRadius(radius) : null;

        // Label
        this.text = scene.add.text(0, 0, label, {
            fontSize,
            color: textColor,
            fontFamily: 'Arial',
        }).setOrigin(0.5);

        // Elemente in Container
        this.add([this.bg, this.text]);

        // Interaktivität
        this.setSize(width, height);
        this.setInteractive(
            new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
            Phaser.Geom.Rectangle.Contains
        );

        // Events
        this.on('pointerover', () => {
            this.bg.setFillStyle(hoverColor);
            this.scene.input.setDefaultCursor('pointer');
        });

        this.on('pointerout', () => {
            this.bg.setFillStyle(bgColor);
            this.scene.input.setDefaultCursor('default');
        });

        this.on('pointerdown', () => {
            if (callback) callback();
        });

        // In Szene hinzufügen
        scene.add.existing(this);
    }
}
