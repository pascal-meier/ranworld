export class RiggedRacePreloadScene extends Phaser.Scene {
  constructor() {
    super("RiggedRacePreloadScene");
  }

  preload(): void {
    // Lade alle benötigten Assets für das Minispiel
    this.load.image("base-bg", "public/assets/common/backgrounds/base-bg.png");

    // Fortschrittsanzeige (optional)
    const { width, height } = this.scale;
    const loadingText = this.add
      .text(width / 2, height / 2, "Loading...", {
        fontSize: "24px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.load.on("progress", (value: number) => {
      loadingText.setText(`Loading... ${Math.round(value * 100)}%`);
    });

    this.load.on("complete", () => {
      loadingText.destroy();
    });
  }

  create(): void {
    this.scene.start("RiggedRaceGameScene");
  }
}
