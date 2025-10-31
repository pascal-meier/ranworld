import { Button } from "../../../common/ui/Button.js";
import { generateLoot } from "../objects/RNGparcel.js";

export class LootyBoxGameScene extends Phaser.Scene {
    constructor() {
        super("LootyBoxGameScene");
    }

    create() {
        const { width, height } = this.scale;
        const centerX = width / 2;
        const centerY = height / 2;

        // Hintergrund
        this.add.image(centerX, centerY, "base-bg").setDepth(-1);

        // Titel
        this.add.text(centerX, height * 0.3, "REACH 100", {
            fontSize: "32px",
            color: "#ffffff",
        }).setOrigin(0.5);

        // Score
        this.add.text(width * 0.75, height * 0.1, "Score:", {
            fontSize: "32px",
            color: "#ffffff",
        }).setOrigin(0.5);

        const scoreValue = this.add.text(width * 0.85, height * 0.1, "0", {
            fontSize: "32px",
            color: "#ffffff",
        }).setOrigin(0.5);

        // Zurück-Button
        new Button(this, width / 4, height * 0.1, "Back", () => {
            this.scene.start("MainMenuScene");
        });

        const boxScale = 3;

        const createBoxes = () => {
            const box01 = this.add.sprite(centerX - (50 * boxScale), centerY, "box", 0)
                .setOrigin(0.5)
                .setScale(boxScale);
            const box02 = this.add.sprite(centerX, centerY, "box", 2)
                .setOrigin(0.6, 0.5)
                .setScale(boxScale);
            const box03 = this.add.sprite(centerX + (50 * boxScale), centerY, "box", 4)
                .setOrigin(0.6, 0.5)
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
                        ease: "Power1"
                    });
                });

                box.on("pointerout", () => {
                    this.tweens.add({
                        targets: box,
                        scale: boxScale,
                        duration: 150,
                        ease: "Power1"
                    });
                });

                // Klick-Effekt
                box.on("pointerdown", () => onBoxClick(box, boxes));
            });

            return boxes;
        };

        const boxes = createBoxes();

        const rarityColors = {
            common: 0xcccccc,
            rare: 0x3399ff,
            epic: 0xaa33ff,
            legendary: 0xffd700
        };

        // Klickfunktion mit Reset
        const onBoxClick = (clickedBox, allBoxes) => {
            allBoxes.forEach(b => b.disableInteractive());

            // Andere Boxen ausblenden
            allBoxes.forEach(b => {
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
                    // Frame wechseln (öffnen)
                    const nextFrame = clickedBox.frame.name + 1;
                    this.time.delayedCall(300, () => {
                        clickedBox.setFrame(nextFrame);

                        // Bounce
                        this.tweens.add({
                            targets: clickedBox,
                            scale: boxScale * 1.4,
                            yoyo: true,
                            duration: 200,
                            ease: "Back.Out"
                        });

                        // Loot erzeugen
                        const rarity = generateLoot(this, clickedBox.frame.name, width/2, height/2 + clickedBox.height);
                        console.log("Rarity:", rarity);

                        // Partikel-Effekt
                        if (this.textures.exists("open-particles")) {
                            const particles = this.add.particles(0, 0, "open-particles", {
                                x: clickedBox.x,
                                y: clickedBox.y,
                                speed: { min: -200, max: 800 },
                                lifespan: 1800,
                                scale: { start: 0.08, end: 0, random: true },
                                quantity: 5,
                                tint: rarityColors[rarity],
                                blendMode: "ADD"
                            });
                            this.time.delayedCall(800, () => particles.destroy());
                        }

                        // Nach kurzer Pause: Reset (alles wiederherstellen)
                        this.time.delayedCall(2000, () => {
                            // Alte Boxen entfernen
                            allBoxes.forEach(b => b.destroy());
                            // Neue Boxen erstellen
                            createBoxes();
                        });
                    });
                },
            });
        };
    }
}
