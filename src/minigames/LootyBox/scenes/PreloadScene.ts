import { BaseScene } from "../../../core/scenes/BaseScene.js";

export class LootyBoxPreloadScene extends BaseScene {
  constructor() {
    super("LootyBoxPreloadScene");
  }

  preload(): void {
    // Lade alle benötigten Assets für das Minispiel
    this.load.image("base-bg", "public/assets/common/space_bg.png");
    this.load.spritesheet("box", "public/assets/lootybox/boxes.png", {
      frameWidth: 40,
      frameHeight: 32,
    });
    this.load.image("open-particles", "public/assets/lootybox/spark.png");

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
    super.create();
    this.scene.start("LootyBoxGameScene");
  }
}
