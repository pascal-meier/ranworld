export class CantropyDrawPreloadScene extends Phaser.Scene {
    constructor() {
        super("CantropyDrawPreloadScene");
    }
    preload() {
        // Lade alle benötigten Assets für das Minispiel
        this.load.image("base-bg", "public/assets/common/backgrounds/base-bg.png");
        this.load.audio('ping', 'public/assets/cantropydraw/sounds/7.wav');
        this.load.audio('tone', 'public/assets/cantropydraw/sounds/6.wav');
        // Fortschrittsanzeige (optional)
        const { width, height } = this.scale;
        const loadingText = this.add
            .text(width / 2, height / 2, "Loading...", {
            fontSize: "24px",
            color: "#ffffff",
        })
            .setOrigin(0.5);
        this.load.on("progress", (value) => {
            loadingText.setText(`Loading... ${Math.round(value * 100)}%`);
        });
        this.load.on("complete", () => {
            loadingText.destroy();
        });
    }
    create() {
        this.scene.start("CantropyDrawGameScene");
    }
}
