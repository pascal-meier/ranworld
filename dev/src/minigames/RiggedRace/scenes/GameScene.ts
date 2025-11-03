import { Button } from "../../../common/ui/Button.js";
import { Track } from "../objects/track.js";

export class RiggedRaceGameScene extends Phaser.Scene {
  private scoreValue!: Phaser.GameObjects.Text;

  constructor() {
    super("RiggedRaceGameScene");
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    // 🖼️ Hintergrundbild
    const baseBG = this.add.image(width / 2, height / 2, "base-bg");
    baseBG.setDisplaySize(width, height); // skaliert sauber statt innerWidth
    baseBG.setOrigin(0.5);

    // Zurück-Button
    new Button(this, width / 4, height * 0.1, "Back", () => {
      this.scene.start("MainMenuScene");
    });

    // Titel
    this.add.text(centerX, height * 0.1, "CHOOSE RACER", {
      fontSize: "32px",
      color: "#ffffff",
    }).setOrigin(0.5);

    // Rennstrecken
    const spacing = 100;
    let startY = height * 0.1;

    new Track(this).setPosition(0, startY - 2*spacing);
    new Track(this).setPosition(0, startY- spacing);
    new Track(this).setPosition(0, startY);
    
        
  }
}
