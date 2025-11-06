import { Button } from "../../../common/ui/Button.js";
import { generateLoot } from "../objects/RNGparcel.js";

export class LootyBoxGameScene extends Phaser.Scene {
  private scoreValue!: Phaser.GameObjects.Text;
  private titelText!: Phaser.GameObjects.Text;

  constructor() {
    super("LootyBoxGameScene");
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    // 🖼️ Hintergrundbild
    const baseBG = this.add.image(width / 2, height / 2, "base-bg");
    baseBG.setDisplaySize(width, height);
    baseBG.setOrigin(0.5);

    // Titel
    this.titelText = this.add.text(centerX, height * 0.3, "REACH 100", {
      fontSize: "32px",
      color: "#ffffff",
    }).setOrigin(0.5);

    // Score
    this.add.text(width * 0.75, height * 0.1, "Score:", {
      fontSize: "32px",
      color: "#ffffff",
    }).setOrigin(0.5);

    this.scoreValue = this.add.text(width * 0.85, height * 0.1, "0", {
      fontSize: "32px",
      color: "#ffffff",
    }).setOrigin(0.5);

    // Zurück-Button
    new Button(this, width / 4, height * 0.1, "Back", () => {
      this.scene.start("MainMenuScene");
    });

    const boxScale = 3;
    const rarityColors: Record<string, number> = {
      common: 0xcccccc,
      rare: 0x3399ff,
      epic: 0xaa33ff,
      legendary: 0xffd700,
    };

    const createBoxes = (): Phaser.GameObjects.Sprite[] => {
      const box01 = this.add
        .sprite(centerX - 50 * boxScale, centerY, "box", 0)
        .setOrigin(0.5)
        .setScale(boxScale);
      const box02 = this.add
        .sprite(centerX, centerY, "box", 2)
        .setOrigin(0.5)
        .setScale(boxScale);
      const box03 = this.add
        .sprite(centerX + 50 * boxScale, centerY, "box", 4)
        .setOrigin(0.5)
        .setScale(boxScale);

      const boxes = [box01, box02, box03];

      boxes.forEach((box) => {
        box.setInteractive({ useHandCursor: true });

        // Hover-Effekt
        box.on("pointerover", () => {
          this.tweens.add({
            targets: box,
            scale: boxScale * 1.2,
            duration: 150,
            ease: "Power1",
          });
        });

        box.on("pointerout", () => {
          this.tweens.add({
            targets: box,
            scale: boxScale,
            duration: 150,
            ease: "Power1",
          });
        });

        // Klick-Effekt
        box.on("pointerdown", () => onBoxClick(box, boxes));
      });

      return boxes;
    };

    const onBoxClick = (
      clickedBox: Phaser.GameObjects.Sprite,
      allBoxes: Phaser.GameObjects.Sprite[]
    ): void => {
      allBoxes.forEach((b) => b.disableInteractive());

      // Andere Boxen ausblenden
      allBoxes.forEach((b) => {
        if (b !== clickedBox) {
          this.tweens.add({
            targets: b,
            x: b.x < centerX ? -200 : width + 200,
            alpha: 0,
            duration: 800,
            ease: "Power2",
          });
        }
      });

      // Die geklickte Box in die Mitte
      this.tweens.add({
        targets: clickedBox,
        x: centerX,
        y: centerY,
        scale: boxScale * 1.2,
        duration: 800,
        ease: "Back.Out",
        onComplete: () => {
          const nextFrame = clickedBox.frame.name + 1;

          this.time.delayedCall(300, () => {
            clickedBox.setFrame(nextFrame);

            // Bounce
            this.tweens.add({
              targets: clickedBox,
              scale: boxScale * 1.4,
              yoyo: true,
              duration: 200,
              ease: "Back.Out",
            });

            // Loot erzeugen
            const loot = generateLoot(
              this,
              parseInt(clickedBox.frame.name),
              width / 2,
              height / 2 + clickedBox.height
            );

            // Partikel-Effekt
            if (this.textures.exists("open-particles")) {
              const particles = this.add.particles(0, 0, "open-particles", {
                x: clickedBox.x,
                y: clickedBox.y,
                speed: { min: -200, max: 800 },
                lifespan: 1800,
                scale: { start: 0.08, end: 0, random: true },
                quantity: 5,
                tint: rarityColors[loot[0]],
                blendMode: "ADD",
              });
              this.time.delayedCall(800, () => particles.destroy());
            }

            //Verrechnung mit Score
            //this.scoreValue.setText((Number(this.scoreValue.text) + loot[1]).toString());
            this.scoreValue.setText((Number(this.scoreValue.text) + loot[1]).toString());
            this.titelText.setText((loot[1]).toString());
            if (Number(this.scoreValue.text)>=100){
              this.winGame();
            } else{
            // Reset nach 2 Sekunden
            this.time.delayedCall(2000, () => {
              allBoxes.forEach((b) => b.destroy());
              createBoxes();
              this.titelText.setText("Just " + ((100-Number(this.scoreValue.text)).toString()) + " more to go");
            });
          }
          });
        },
      });
    };

    createBoxes();
  }

  private winGame(): void {
  const { width, height } = this.scale;

  // 🎉 Win-Text in der Mitte
  const winText = this.add.text(width / 2, height / 2, "YOU WIN!", {
    fontSize: "72px",
    color: "#FFD700",
    fontStyle: "bold",
    stroke: "#000",
    strokeThickness: 8,
  }).setOrigin(0.5).setScale(0);

  // 🟩 Animation (reinzoomen)
  this.tweens.add({
    targets: winText,
    scale: 1,
    duration: 500,
    ease: "Back.Out",
  });

  // 🔁 Nach 3 Sekunden zur Startszene zurück
  this.time.delayedCall(3000, () => {
    this.scene.start("MainMenuScene");
  });
}

}
