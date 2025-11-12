export class Track extends Phaser.GameObjects.Graphics {
    length;
    // ℹ️ Creates the track graphics with an optional initial length ℹ️
    constructor(scene, length) {
        super(scene);
        scene.add.existing(this);
        this.length = length ?? scene.scale.width * 0.8;
        this.drawTrack();
    }
    // ℹ️ Redraws the track to match a new desired length ℹ️
    resize(length) {
        this.length = length;
        this.drawTrack();
    }
    // ℹ️ Renders the asphalt band plus highlighted center line ℹ️
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
