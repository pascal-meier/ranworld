export default class TongueDrum extends Phaser.GameObjects.Image {
    numSegments;
    offset;
    hitHandler;
    // ℹ️ Creates the interactive drum and hooks pointer events so segments can be identified ℹ️
    constructor(scene, x, y, textureKey = "drum") {
        super(scene, x, y, textureKey);
        scene.add.existing(this);
        this.setInteractive();
        this.numSegments = 8;
        this.offset = (360 / this.numSegments) * 2.5;
        this.on("pointerdown", (pointer) => {
            const segment = this.getSegmentFromPointer(pointer);
            this.hitHandler?.(segment);
        });
    }
    // ℹ️ Allows other systems to respond whenever a specific drum segment is hit ℹ️
    setHitHandler(handler) {
        this.hitHandler = handler;
    }
    // ℹ️ Computes which drum slice a pointer interaction falls into ℹ️
    getSegmentFromPointer(pointer) {
        const dx = pointer.x - this.x;
        const dy = pointer.y - this.y;
        let angle = Phaser.Math.RadToDeg(Math.atan2(dy, dx));
        if (angle < 0)
            angle += 360;
        angle = (angle + this.offset) % 360;
        const segment = Math.floor(angle / (360 / this.numSegments)) + 1;
        return segment;
    }
    // ℹ️ Provides a short highlight on the active segment for player feedback ℹ️
    flash(segment) {
        this.setTint(0xffcc00);
        this.setTexture(`d${segment}`);
        this.scene.time.delayedCall(300, () => {
            this.clearTint();
            this.setTexture("drum");
        });
    }
    // ℹ️ Pulses the drum red when a mistake occurs ℹ️
    failFlash() {
        this.scene.tweens.add({
            targets: this,
            tint: 0xff3333,
            duration: 250,
        });
    }
    // ℹ️ Pulses the drum green after a successful round ℹ️
    winFlash() {
        this.scene.tweens.add({
            targets: this,
            tint: 0x33ff33,
            duration: 250,
        });
    }
}
