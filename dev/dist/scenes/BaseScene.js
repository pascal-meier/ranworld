// src/scenes/BaseScene.ts
/**
 * Eine Basisklasse für alle Szenen, die automatisch auf Fenstergröße reagiert.
 * Szenen, die von dieser Klasse erben, können `onResize` überschreiben.
 */
export class BaseScene extends Phaser.Scene {
    constructor(key) {
        super({ key });
    }
    create() {
        // Resize-Listener einrichten
        this.scale.on("resize", this.onResize, this);
        // Direkt einmal beim Start ausführen
        this.onResize(this.scale.gameSize);
    }
    /**
     * Wird automatisch bei Fenstergröße-Änderungen aufgerufen.
     * Kann von abgeleiteten Szenen überschrieben werden.
     */
    onResize(gameSize) {
        const { width, height } = gameSize;
        console.log(`[BaseScene] new size: ${width}x${height}`);
    }
}
