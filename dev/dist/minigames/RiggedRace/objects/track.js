/**
 * Zeichnet eine einfache horizontale Rennstrecke, die über Position verschoben werden kann.
 */
export class Track extends Phaser.GameObjects.Graphics {
    length;
    constructor(scene, length) {
        super(scene);
        scene.add.existing(this);
        this.length = length ?? scene.scale.width * 0.8;
        this.drawTrack();
    }
    drawTrack() {
        const startX = 0;
        const endX = this.length;
        this.clear();
        this.lineStyle(20, 0x222222, 1);
        this.beginPath();
        this.moveTo(startX, 0);
        this.lineTo(endX, 0);
        this.strokePath();
        this.lineStyle(2, 0xffff00, 1);
        this.beginPath();
        this.moveTo(startX, 0);
        this.lineTo(endX, 0);
        this.strokePath();
    }
}
