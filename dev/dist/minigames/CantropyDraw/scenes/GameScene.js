// src/minigames/CantropyDraw/scenes/GameScene.ts
import { Button } from "../../../core/ui/Button.js";
export class CantropyDrawGameScene extends Phaser.Scene {
    shapes;
    seed;
    constructor() {
        super('CantropyDrawGameScene');
    }
    create() {
        const { width, height } = this.scale;
        this.shapes = this.add.group();
        this.seed = Phaser.Math.Between(0, 99999);
        this.add.text(10, 10, `Seed: ${this.seed}`, {
            fontSize: '14px',
            color: '#888'
        }).setScrollFactor(0);
        this.input.on('pointerdown', (pointer) => {
            this.spawnRandomShape(pointer.x, pointer.y);
            this.playRandomSound();
        });
        // Zurück-Button
        new Button(this, width / 4, height * 0.1, "Back", () => {
            this.scene.start("MainMenuScene");
        });
        // Optional Flow Mode
        this.time.addEvent({
            delay: 500,
            loop: true,
            callback: () => {
                if (this.input.keyboard?.checkDown(this.input.keyboard.addKey('F'))) {
                    this.spawnRandomShape(Phaser.Math.Between(0, this.scale.width), Phaser.Math.Between(0, this.scale.height));
                }
            },
        });
    }
    spawnRandomShape(x, y) {
        const shapeType = Phaser.Math.RND.pick(['circle', 'rect', 'triangle']);
        const color = Phaser.Display.Color.RandomRGB(100, 255).color;
        const size = Phaser.Math.Between(20, 120);
        const alpha = Phaser.Math.FloatBetween(0.4, 1);
        let shape;
        switch (shapeType) {
            case 'circle':
                shape = this.add.circle(x, y, size / 2, color, alpha);
                break;
            case 'rect':
                shape = this.add.rectangle(x, y, size, size, color, alpha);
                break;
            default:
                shape = this.add.triangle(x, y, 0, size, size / 2, 0, size, size, color, alpha);
        }
        this.shapes.add(shape);
        this.playRandomSound();
        this.tweens.add({
            targets: shape,
            scale: { from: 0.5, to: 2.2 },
            alpha: { from: 0, to: alpha },
            yoyo: true,
            ease: 'Sine.easeInOut',
            duration: Phaser.Math.Between(1800, 2500),
        });
    }
    playRandomSound() {
        const soundKey = Phaser.Math.RND.pick(['ping', 'tone']);
        const sound = this.sound.add(soundKey);
        sound.setRate(Phaser.Math.FloatBetween(0.7, 1.5));
        sound.play({ volume: 0.2 });
    }
}
