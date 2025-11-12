export class LightStroke {
    scene;
    strokes = [];
    // ℹ️ Retains the scene reference so the stroke pool can spawn and animate display objects ℹ️
    constructor(scene) {
        this.scene = scene;
    }
    // ℹ️ Creates a glowing stroke for the supplied art event and animates its echo tail ℹ️
    emit(event) {
        const colorObj = Phaser.Display.Color.HSLToColor(event.hue / 360, event.emotion.saturation, Phaser.Math.Clamp(event.brightness, 0, 1));
        const color = colorObj.color;
        const glow = this.scene.add.circle(event.x, event.y, event.size * 0.6, color, event.alpha * 0.35);
        glow.setBlendMode(Phaser.BlendModes.ADD);
        const shape = this.makeShape(event, color);
        shape.setBlendMode(Phaser.BlendModes.SCREEN);
        shape.setAlpha(0);
        shape.setScale(0.25);
        this.strokes.push(glow, shape);
        this.scene.tweens.add({
            targets: shape,
            alpha: { from: 0, to: event.alpha },
            scale: { from: 0.25, to: 1 },
            duration: 220,
            ease: "Sine.easeOut",
        });
        this.scene.tweens.add({
            targets: glow,
            alpha: { from: glow.alpha, to: 0 },
            scale: { from: 0.6, to: 1.75 },
            duration: event.echoDuration,
            ease: "Sine.easeInOut",
            onComplete: () => this.dispose(glow),
        });
        this.scene.tweens.add({
            targets: shape,
            alpha: { from: event.alpha, to: event.alpha * 0.4 },
            scale: { from: 1, to: 1.25 },
            duration: event.echoDuration * 0.65,
            yoyo: true,
            ease: "Sine.easeInOut",
            onComplete: () => this.dispose(shape),
        });
    }
    // ℹ️ Destroys all pooled shapes to reset the canvas between compositions ℹ️
    clear() {
        this.strokes.forEach((shape) => shape.destroy());
        this.strokes = [];
    }
    // ℹ️ Instantiates the proper primitive (circle, rect, triangle) for the art event ℹ️
    makeShape(event, color) {
        let shape;
        switch (event.shape) {
            case "circle":
                shape = this.scene.add.circle(event.x, event.y, event.size / 2, color, event.alpha);
                break;
            case "rect":
                shape = this.scene.add.rectangle(event.x, event.y, event.size, event.size * 0.65, color, event.alpha);
                break;
            default:
                shape = this.scene.add.triangle(event.x, event.y, 0, event.size, event.size * 0.5, 0, event.size, event.size, color, event.alpha);
                break;
        }
        shape.setRotation(Phaser.Math.DegToRad(event.rotation));
        return shape;
    }
    // ℹ️ Removes a stroke from the pool once its fade-out completes ℹ️
    dispose(shape) {
        const index = this.strokes.indexOf(shape);
        if (index >= 0)
            this.strokes.splice(index, 1);
        shape.destroy();
    }
}
