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
        // Beim Szenenende sauber abklemmen, damit keine toten Listener in Folgeszenen feuern
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.scale.off("resize", this.onResize, this);
        });
        this.events.once(Phaser.Scenes.Events.DESTROY, () => {
            this.scale.off("resize", this.onResize, this);
        });
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
