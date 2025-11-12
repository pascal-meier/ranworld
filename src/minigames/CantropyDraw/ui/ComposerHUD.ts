import { Button } from "../../../core/ui/Button.js";

type Callback = () => void;

interface HUDCallbacks {
  onReplay: Callback;
  onNewSeed: Callback;
  onNewComposition: Callback;
  onFlowToggle: Callback;
  onBack: Callback;
}

export class ComposerHUD {
  private seedText: Phaser.GameObjects.Text;
  private messageText: Phaser.GameObjects.Text;
  private replayButton: Button;
  private newSeedButton: Button;
  private compositionButton: Button;
  private flowButton: Button;
  private backButton: Button;

  // ℹ️ Builds the overlay texts and touch-friendly buttons using the provided callbacks ℹ️
  constructor(private scene: Phaser.Scene, callbacks: HUDCallbacks) {
    const { width, height } = scene.scale;

    this.seedText = scene.add
      .text(width * 0.05, height * 0.05, "Seed: ----", {
        fontSize: "20px",
        color: "#ededed",
      })
      .setOrigin(0, 0.5);

    this.messageText = scene.add
      .text(width * 0.05, height * 0.1, "Tap anywhere to paint sound", {
        fontSize: "18px",
        color: "#c8c8c8",
      })
      .setOrigin(0, 0.5);

    this.replayButton = new Button(scene, width * 0.2, height * 0.08, "Replay", callbacks.onReplay);
    this.newSeedButton = new Button(scene, width * 0.35, height * 0.08, "New Seed", callbacks.onNewSeed);
    this.compositionButton = new Button(
      scene,
      width * 0.5,
      height * 0.08,
      "New Composition",
      callbacks.onNewComposition
    );
    this.flowButton = new Button(scene, width * 0.65, height * 0.08, "Flow Mode", callbacks.onFlowToggle);
    this.backButton = new Button(scene, width * 0.8, height * 0.08, "Back", callbacks.onBack);
  }

  // ℹ️ Updates the visible seed label so players can reproduce compositions ℹ️
  setSeed(seed: string): void {
    this.seedText.setText(`Seed: ${seed}`);
  }

  // ℹ️ Refreshes the descriptive helper text under the seed label ℹ️
  setMessage(text: string): void {
    this.messageText.setText(text);
  }

  // ℹ️ Reflects whether autonomous flow mode is currently active ℹ️
  setFlowActive(active: boolean): void {
    this.flowButton.setLabel(active ? "Flowing..." : "Flow Mode");
  }

  // ℹ️ Rearranges labels and buttons to suit landscape or portrait aspect ratios ℹ️
  layout(width: number, height: number): void {
    const isVertical = height > width * 1.1;
    if (isVertical) {
      this.seedText.setPosition(width * 0.5, height * 0.06).setOrigin(0.5, 0.5);
      this.messageText.setPosition(width * 0.5, height * 0.11).setOrigin(0.5, 0.5);

      const buttons = [
        this.replayButton,
        this.newSeedButton,
        this.compositionButton,
        this.flowButton,
        this.backButton,
      ];
      buttons.forEach((button, index) => {
        button.setPosition(width * 0.5, height * (0.2 + index * 0.1));
      });
      return;
    }

    this.seedText.setOrigin(0, 0.5).setPosition(width * 0.05, height * 0.05);
    this.messageText.setOrigin(0, 0.5).setPosition(width * 0.05, height * 0.1);

    const buttons = [
      this.replayButton,
      this.newSeedButton,
      this.compositionButton,
      this.flowButton,
      this.backButton,
    ];
    buttons.forEach((button, index) => {
      const spacing = width * 0.12;
      button.setPosition(width * 0.3 + index * spacing, height * 0.08);
    });
  }
}
