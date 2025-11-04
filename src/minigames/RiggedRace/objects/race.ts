// src/games/riggedrace/objects/race.ts

import { Fox } from "./fox.js";

export class Race {
  private scene: Phaser.Scene;
  private foxes: Fox[];
  private isRunning: boolean = false;
  private finishLineX: number;
  private winner: Fox | null = null;
  private raceTimer?: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene, foxes: Fox[], finishLineX: number) {
    this.scene = scene;
    this.foxes = foxes;
    this.finishLineX = finishLineX;
  }

  /**
   * Starte das Rennen
   */
  public start(): void {
    if (this.isRunning) return;

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
  private updateRace(): void {
    if (!this.isRunning) return;

    for (const fox of this.foxes) {
      // Zufällige Variation + Glücksfaktor
      const randomBoost = Phaser.Math.Between(0, fox.getLuck());
      const step = (fox.getSpeed() / 50) + randomBoost * 0.2;

      // 🦊 Bewegung nach rechts
      fox.x += step;

      // Prüfen, ob dieser Fuchs die Ziellinie erreicht hat
      if (fox.x >= this.finishLineX) {
        this.finish(fox);
        break;
      }
    }
  }

  /**
   * Rennen beenden
   */
  private finish(winner: Fox): void {
    this.isRunning = false;
    this.winner = winner;

    console.log(`🏆 Gewinner: ${winner.getName()}`);

     // ⏹️ Timer stoppen
    this.raceTimer?.remove();

    this.foxes.forEach((f) => {
      //f.stopRunAnimation();
      f.disableInteractive();
    });

    // Optional: Alle Füchse stoppen
    this.foxes.forEach(f => {
      f.disableInteractive();
    });

    // 🎉 Event an Szene senden (GameScene kann darauf reagieren)
    this.scene.events.emit("raceFinished", winner);
    
  }

  /**
   * Zugriff auf den Gewinner
   */
  public getWinner(): Fox | null {
    return this.winner;
  }

  /**
   * Rennen abbrechen oder resetten
   */
  public reset(): void {
    this.isRunning = false;
    this.winner = null;

    // ⏹️ Timer wirklich beenden
    this.raceTimer?.remove();
    this.raceTimer = undefined;

    // Füchse zurücksetzen
    this.foxes.forEach((fox, i) => {
      fox.setX(75); // Startposition links
      fox.setSelected(false);
      fox.setInteractive();
      fox.resetStats();
    });
  }
}
