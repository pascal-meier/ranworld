import { Button } from "../../../core/ui/Button.js";
import { generateLoot, RARITY_COLORS, } from "../objects/RNGparcel.js";
export class LootyBoxGameScene extends Phaser.Scene {
    scoreText;
    titleText;
    boxes = [];
    score = 0;
    hasWon = false;
    resetTimer;
    boxScale = 3;
    goalScore = 100;
    constructor() {
        super("LootyBoxGameScene");
    }
    create() {
        this.createBackground();
        this.createUi();
        this.spawnBoxes();
    }
    createBackground() {
        const { width, height } = this.scale;
        this.add.image(width / 2, height / 2, "base-bg").setDisplaySize(width, height).setOrigin(0.5);
    }
    createUi() {
        const { width, height } = this.scale;
        this.titleText = this.add
            .text(width / 2, height * 0.3, `Reach ${this.goalScore}`, {
            fontSize: "32px",
            color: "#ffffff",
            fontFamily: "Ranworldfont01",
        })
            .setOrigin(0.5);
        this.add
            .text(width * 0.75, height * 0.1, "Score:", {
            fontSize: "32px",
            color: "#ffffff",
            fontFamily: "Ranworldfont01",
        })
            .setOrigin(0.5);
        this.scoreText = this.add
            .text(width * 0.85, height * 0.1, this.score.toString(), {
            fontSize: "32px",
            color: "#ffffff",
            fontFamily: "Ranworldfont01",
        })
            .setOrigin(0.5);
        new Button(this, width / 4, height * 0.1, "Back", () => {
            this.scene.start("MainMenuScene");
        });
    }
    spawnBoxes() {
        const { width, height } = this.scale;
        const centerX = width / 2;
        const centerY = height / 2;
        const spacing = 50 * this.boxScale;
        const frames = [0, 2, 4];
        this.boxes = frames.map((frame, index) => {
            const sprite = this.add
                .sprite(centerX + (index - 1) * spacing, centerY, "box", frame)
                .setOrigin(0.5)
                .setScale(this.boxScale)
                .setDataEnabled();
            sprite.setData("tier", (index + 1));
            sprite.setData("closedFrame", frame);
            sprite.setData("openFrame", frame + 1);
            this.registerBoxInteractions(sprite);
            return sprite;
        });
    }
    registerBoxInteractions(box) {
        box.setInteractive({ useHandCursor: true });
        box.on("pointerover", () => {
            this.tweens.add({
                targets: box,
                scale: this.boxScale * 1.2,
                duration: 150,
                ease: "Power1",
            });
        });
        box.on("pointerout", () => {
            this.tweens.add({
                targets: box,
                scale: this.boxScale,
                duration: 150,
                ease: "Power1",
            });
        });
        box.on("pointerdown", () => this.handleBoxClick(box));
    }
    handleBoxClick(box) {
        if (this.hasWon)
            return;
        this.resetTimer?.remove();
        this.disableBoxInteractions();
        this.moveNonSelectedBoxes(box);
        const { width, height } = this.scale;
        this.tweens.add({
            targets: box,
            x: width / 2,
            y: height / 2,
            scale: this.boxScale * 1.2,
            duration: 800,
            ease: "Back.Out",
            onComplete: () => this.openBox(box),
        });
    }
    moveNonSelectedBoxes(selected) {
        const { width } = this.scale;
        this.boxes.forEach((box) => {
            if (box === selected)
                return;
            const isLeft = box.x < selected.x;
            this.tweens.add({
                targets: box,
                x: isLeft ? -200 : width + 200,
                alpha: 0,
                duration: 800,
                ease: "Power2",
            });
        });
    }
    openBox(box) {
        const openFrame = Number(box.getData("openFrame"));
        this.time.delayedCall(300, () => {
            if (!Number.isNaN(openFrame)) {
                box.setFrame(openFrame);
            }
            this.tweens.add({
                targets: box,
                scale: this.boxScale * 1.4,
                yoyo: true,
                duration: 200,
                ease: "Back.Out",
            });
            this.resolveLoot(box);
        });
    }
    resolveLoot(box) {
        const { width, height } = this.scale;
        const tier = Number(box.getData("tier")) || 1;
        const loot = generateLoot(this, tier, width / 2, height / 2 + box.displayHeight);
        this.spawnParticles(box, loot.rarity);
        this.handleLootResult(loot);
    }
    spawnParticles(box, rarity) {
        if (!this.textures.exists("open-particles"))
            return;
        const tint = Phaser.Display.Color.HexStringToColor(RARITY_COLORS[rarity]).color;
        const particles = this.add.particles(0, 0, "open-particles", {
            x: box.x,
            y: box.y,
            speed: { min: -200, max: 800 },
            lifespan: 1800,
            scale: { start: 0.08, end: 0, random: true },
            quantity: 5,
            tint,
            blendMode: "ADD",
        });
        this.time.delayedCall(800, () => particles.destroy());
    }
    handleLootResult(loot) {
        this.score += loot.value;
        this.scoreText.setText(this.score.toString());
        this.updateTitle(`${loot.rarity.toUpperCase()} +${loot.value}`);
        if (this.score >= this.goalScore) {
            this.winGame();
            return;
        }
        this.scheduleReset();
    }
    scheduleReset() {
        this.resetTimer?.remove();
        this.resetTimer = this.time.delayedCall(2000, () => {
            this.resetBoxes();
            this.updateTitle(`Just ${this.goalScore - this.score} more to go`);
        });
    }
    resetBoxes() {
        this.boxes.forEach((box) => box.destroy());
        this.boxes = [];
        this.spawnBoxes();
    }
    disableBoxInteractions() {
        this.boxes.forEach((box) => box.disableInteractive());
    }
    updateTitle(text) {
        this.titleText.setText(text);
    }
    winGame() {
        if (this.hasWon)
            return;
        this.hasWon = true;
        this.resetTimer?.remove();
        this.resetTimer = undefined;
        this.disableBoxInteractions();
        const { width, height } = this.scale;
        const winText = this.add
            .text(width / 2, height / 2, "YOU WIN!", {
            fontSize: "72px",
            color: "#FFD700",
            fontStyle: "bold",
            stroke: "#000",
            strokeThickness: 8,
            fontFamily: "Ranworldfont01",
        })
            .setOrigin(0.5)
            .setScale(0);
        this.tweens.add({
            targets: winText,
            scale: 1,
            duration: 500,
            ease: "Back.Out",
        });
        this.time.delayedCall(3000, () => {
            this.scene.start("MainMenuScene");
        });
    }
}
