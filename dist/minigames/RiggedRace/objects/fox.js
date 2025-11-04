// src/games/riggedrace/objects/fox.ts
export class Fox extends Phaser.GameObjects.Container {
    sprite;
    nameText;
    speed;
    luck;
    isSelected = false;
    constructor(scene, name, textureKey) {
        super(scene);
        this.speed = Phaser.Math.Between(60, 120);
        this.luck = Phaser.Math.Between(1, 10);
        // 🦊 Sprite hinzufügen
        this.sprite = scene.add.sprite(0, 0, textureKey).setOrigin(0.5);
        this.sprite.setScale(2);
        // 📛 Name darunter anzeigen
        this.nameText = scene.add.text(0, 40, name, {
            fontSize: "18px",
            color: "#ffffff",
        }).setOrigin(0.5);
        // Beide Objekte in Container hinzufügen
        this.add([this.sprite, this.nameText]);
        // Szene hinzufügen
        scene.add.existing(this);
        // Interaktivität
        this.setSize(this.sprite.width, this.sprite.height);
        this.setInteractive({ useHandCursor: true });
        this.on("pointerdown", () => this.onClick());
    }
    onClick() {
        this.isSelected = !this.isSelected;
        this.sprite.setTint(this.isSelected ? 0xffcc00 : 0xffffff);
        // Optional: Ausgabe oder Szene-Event
        this.scene.events.emit("foxSelected", this);
    }
    setPosition(x, y) {
        super.setPosition(x, y);
        return this;
    }
    getSpeed() {
        return this.speed;
    }
    getLuck() {
        return this.luck;
    }
    getName() {
        return this.nameText.text;
    }
    setSelected(value) {
        this.isSelected = value;
        this.sprite.setTint(value ? 0xffcc00 : 0xffffff);
    }
}
