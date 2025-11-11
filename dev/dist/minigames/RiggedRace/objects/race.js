// src/games/riggedrace/objects/race.ts
export class Race {
    scene;
    foxes;
    isRunning = false;
    finishLineX;
    winner = null;
    raceTimer;
    constructor(scene, foxes, finishLineX) {
        this.scene = scene;
        this.foxes = foxes;
        this.finishLineX = finishLineX;
    }
    /**
     * Starte das Rennen
     */
    start() {
        if (this.isRunning || !this.scene.scene.isActive())
            return;
        this.isRunning = true;
        this.winner = null;
        console.log("🏁 Rennen gestartet!");
        // ⏱️ Timer speichern
        this.raceTimer = this.scene.time.addEvent({
            delay: 100,
            loop: true,
            callback: () => this.updateRace(),
        });
    }
    /**
     * Rennlogik in jedem Schritt
     */
    updateRace() {
        // Sicherheit: Scene oder Timer zerstört?
        if (!this.isRunning || !this.scene.scene.isActive())
            return;
        for (const fox of this.foxes) {
            const randomBoost = Phaser.Math.Between(0, fox.getLuck());
            const step = (fox.getSpeed() / 50) + randomBoost * 0.2;
            fox.x += step;
            if (fox.x >= this.finishLineX) {
                this.finish(fox);
                break;
            }
        }
    }
    /**
     * Rennen beenden
     */
    finish(winner) {
        if (!this.scene.scene.isActive())
            return;
        this.isRunning = false;
        this.winner = winner;
        console.log(`🏆 Gewinner: ${winner.getName()}`);
        // ⏹️ Timer stoppen
        this.raceTimer?.remove();
        this.raceTimer = undefined;
        // Füchse deaktivieren
        this.foxes.forEach((f) => f.disableInteractive());
        // 🎉 Event an Szene senden (GameScene kann darauf reagieren)
        try {
            this.scene.events.emit("raceFinished", winner);
        }
        catch (e) {
            console.warn("⚠️ Event konnte nicht gesendet werden (Scene evtl. zerstört)", e);
        }
    }
    /**
     * Zugriff auf den Gewinner
     */
    getWinner() {
        return this.winner;
    }
    /**
     * Rennen abbrechen oder resetten
     */
    reset() {
        this.isRunning = false;
        this.winner = null;
        // ⏹️ Timer wirklich beenden
        this.raceTimer?.remove();
        this.raceTimer = undefined;
        // Sicherstellen, dass Scene aktiv ist
        if (!this.scene.scene.isActive())
            return;
        this.foxes.forEach((fox) => {
            fox.resetToSpawn();
            fox.setSelected(false);
            fox.setInteractive({ useHandCursor: true });
            fox.resetStats();
        });
    }
    setFinishLine(x) {
        this.finishLineX = x;
    }
}
