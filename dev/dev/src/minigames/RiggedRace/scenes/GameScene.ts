import { Button } from "../../../common/ui/Button.js";
import { Track } from "../objects/track.js";
import { Fox } from "../objects/fox.js";
import { Race } from "../objects/race.js";

export class RiggedRaceGameScene extends Phaser.Scene {
  private foxes: Fox[] = [];
  private selectedFox: Fox | null = null;
  private race!: Race;

  constructor() {
    super("RiggedRaceGameScene");
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;

    // 🖼️ Hintergrundbild
    const baseBG = this.add.image(width / 2, height / 2, "base-bg");
    baseBG.setDisplaySize(width, height);
    baseBG.setOrigin(0.5);

    // 🏁 Titel
    const titeltext = this.add.text(centerX, height * 0.2, "CHOOSE RACER", {
      fontSize: "32px",
      color: "#ffffff",
    }).setOrigin(0.5).setName("titeltext");

    // 🛤️ Rennstrecken
    const spacing = 100;
    const startY = 50;
    new Track(this).setPosition(0, startY - 2 * spacing);
    new Track(this).setPosition(0, startY - spacing);
    new Track(this).setPosition(0, startY);

    // 🦊 Füchse erzeugen
    const fox1 = new Fox(this, "Miyo", "fox01").setPosition(75, innerHeight * 0.5 - 2 * spacing);
    const fox2 = new Fox(this, "Anber", "fox02").setPosition(75, innerHeight * 0.5 - spacing);
    const fox3 = new Fox(this, "Ret", "fox03").setPosition(75, innerHeight * 0.5);
    this.foxes = [fox1, fox2, fox3];

    // 🎧 Reagiere auf Klicks eines Fuchses (korrekt registriert!)
    this.events.on("foxSelected", this.handleFoxSelection, this);

    // 🏁 Rennen erstellen (Ziellinie rechts vom Bildschirm)
    this.race = new Race(this, this.foxes, this.scale.width - 100);

    // ▶️ Start-Button
    new Button(this, this.scale.width * 0.75, this.scale.height * 0.1, "Start Race", () => {
      if (!this.selectedFox) {
        titeltext.text = "⚠️ Bitte zuerst einen Fuchs auswählen!";
        return;
      }
      titeltext.text = "🏁 Running...";
      this.race.start();
    });

    // 🔙 Zurück-Button
    new Button(this, width / 4, height * 0.1, "Back", () => {
      // Auswahl zurücksetzen
      if (this.selectedFox) {
        this.selectedFox.setSelected(false);
        this.selectedFox = null;
      }

      // Rennen resetten
      this.race?.reset();

      // Event sauber abmelden
      this.events.off("foxSelected", this.handleFoxSelection, this);

      // Szene wechseln
      this.scene.start("MainMenuScene");
    });

    // 🎉 Gewinner-Event
    this.events.on("raceFinished", (winner: Fox) => {
      console.log("🎉 Der Gewinner ist:", winner.getName());
      titeltext.text = `${winner.getName()} wins!`;

      this.time.delayedCall(3000, () => {
        this.race.reset();
        this.selectedFox = null;
        titeltext.text = "CHOOSE RACER";
      });
    });
    
    // 🧹 Scene-Cleanup hinzufügen (GANZ UNTEN in create)
this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
  console.log("🧹 GameScene wird beendet — cleanup läuft");

  // Rennen beenden/resetten
  this.race?.reset();
  this.race = null!;

  // Alle Timer entfernen
  this.time.removeAllEvents();

  // Eventlistener abmelden
  this.events.off("foxSelected", this.handleFoxSelection, this);
  this.events.off("raceFinished");

  // Optional: Textobjekte zerstören
  const titeltext = this.children.getByName("titeltext") as Phaser.GameObjects.Text | undefined;
  titeltext?.destroy();
});
  }

  /**
   * Auswahl eines Fuchses behandeln
   */
  private handleFoxSelection(clickedFox: Fox): void {
    const titeltext = this.children.getByName("titeltext") as Phaser.GameObjects.Text | undefined;

    // Wenn derselbe Fuchs erneut geklickt wurde → abwählen
    if (this.selectedFox === clickedFox) {
      clickedFox.setSelected(false);
      this.selectedFox = null;
      if (titeltext) titeltext.text = "CHOOSE RACER";
      return;
    }

    // Alten abwählen
    if (this.selectedFox) {
      this.selectedFox.setSelected(false);
    }

    // Neuen aktivieren
    clickedFox.setSelected(true);
    this.selectedFox = clickedFox;

    if (titeltext) titeltext.text = "Press Start";
    console.log("Aktuell gewählter Fuchs:", this.selectedFox.getName());
  }
}
