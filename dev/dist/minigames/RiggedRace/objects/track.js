/**
 * Eine einfache Rennstrecke, die als GameObject gezeichnet wird.
 */
export class Track extends Phaser.GameObjects.Graphics {
    pathPoints;
    constructor(scene) {
        super(scene);
        scene.add.existing(this);
        // Beispielhafte Punkte für eine kurvige Strecke
        this.pathPoints = [
            new Phaser.Math.Vector2(100, 500),
            new Phaser.Math.Vector2(300, 400),
        ];
        this.drawTrack();
    }
    drawTrack() {
        this.clear();
        // Straße zeichnen
        this.lineStyle(20, 0x222222, 1); // Straße (dunkelgrau)
        this.beginPath();
        this.moveTo(this.pathPoints[0].x, this.pathPoints[0].y);
        for (let i = 1; i < this.pathPoints.length; i++) {
            this.lineTo(this.pathPoints[i].x, this.pathPoints[i].y);
        }
        this.strokePath();
        // Mittellinie
        this.lineStyle(2, 0xffff00, 1);
        this.beginPath();
        this.moveTo(this.pathPoints[0].x, this.pathPoints[0].y);
        for (let i = 1; i < this.pathPoints.length; i++) {
            this.lineTo(this.pathPoints[i].x, this.pathPoints[i].y);
        }
        this.strokePath();
    }
}
