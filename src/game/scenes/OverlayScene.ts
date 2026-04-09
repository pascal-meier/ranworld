import { getMechanicDefinition } from "../mechanics/index.js";
import { LAB_THEME, textStyle } from "../ui/theme.js";
import { createPanel } from "../ui/widgets.js";
import { makeText } from "../ui/display.js";
import { BaseScene } from "./BaseScene.js";

export class OverlayScene extends BaseScene {
  private readonly handleChange = () => this.render();
  private readonly handleToggleOverlay = (event: KeyboardEvent) => {
    event.preventDefault();
    this.lab.toggleDevOverlay();
  };
  private overlayRoot?: Phaser.GameObjects.Container;
  private titleText?: Phaser.GameObjects.Text;
  private bodyText?: Phaser.GameObjects.Text;
  private activeText?: Phaser.GameObjects.Text;
  private probabilityTexts: Phaser.GameObjects.Text[] = [];
  private debugTexts: Phaser.GameObjects.Text[] = [];
  private layoutSignature?: string;

  constructor() {
    super({ key: "OverlayScene" });
  }

  create(): void {
    this.overlayRoot = this.add.container(0, 0);
    this.lab.on("changed", this.handleChange);

    this.input.keyboard?.on("keydown-TAB", this.handleToggleOverlay);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.lab.off("changed", this.handleChange);
      this.input.keyboard?.off("keydown-TAB", this.handleToggleOverlay);
    });

    this.render();
  }

  private render(): void {
    if (!this.overlayRoot) {
      return;
    }

    const { width } = this.scale;
    const signature = `${width}`;

    if (this.layoutSignature !== signature) {
      this.rebuildUi(width);
      this.layoutSignature = signature;
    }

    if (!this.lab.isDevOverlayVisible()) {
      this.overlayRoot.setVisible(false);
      return;
    }

    const state = this.lab.getState();
    const meta = this.lab.getMeta();
    const lines = [
      `Queued seed: ${state?.seed ?? this.lab.getSeedPreview()}`,
      `Phase: ${state?.phase ?? "setup"}`,
      `RNG draws: ${this.lab.getRngDrawCount()}`,
      `Meta archive: ${meta.archive}`,
      `Tab toggles overlay`,
    ];

    this.overlayRoot.setVisible(true);
    this.bodyText?.setText(lines.join("\n"));

    const mechanicText =
      state && state.activeMechanics.length > 0
        ? state.activeMechanics.map((id) => getMechanicDefinition(id).shortLabel).join(", ")
        : "none";

    this.activeText?.setText(`Active: ${mechanicText}`).setVisible(Boolean(state));

    const probabilities = state?.currentProbabilities.slice(0, 2) ?? [];
    this.probabilityTexts.forEach((text, index) => {
      const entry = probabilities[index];
      if (!entry) {
        text.setVisible(false);
        return;
      }

      text
        .setVisible(true)
        .setText(`${entry.label}: shown ${entry.shown} | actual ${entry.actual}`);
    });

    const debugLines = state ? this.lab.getDebugLines().slice(0, 2) : [];
    this.debugTexts.forEach((text, index) => {
      const line = debugLines[index];
      if (!line) {
        text.setVisible(false);
        return;
      }

      text.setVisible(true).setText(line);
    });
  }

  private rebuildUi(width: number): void {
    this.overlayRoot?.removeAll(true);
    this.probabilityTexts = [];
    this.debugTexts = [];

    if (!this.overlayRoot) {
      return;
    }

    createPanel(this, width - 248, 16, 232, 146, 0x081723, 0x4cc9f0, this.overlayRoot);
    this.titleText = makeText(this, width - 228, 30, "DEV OVERLAY", textStyle(10), this.overlayRoot);
    this.bodyText = makeText(this, width - 228, 48, "", textStyle(8, LAB_THEME.textMuted), this.overlayRoot);
    this.activeText = makeText(this, width - 228, 102, "", textStyle(8), this.overlayRoot);

    this.probabilityTexts.push(
      makeText(this, width - 228, 116, "", textStyle(7, LAB_THEME.accent), this.overlayRoot),
      makeText(this, width - 228, 128, "", textStyle(7, LAB_THEME.accent), this.overlayRoot)
    );
    this.debugTexts.push(
      makeText(this, width - 228, 140, "", textStyle(7, LAB_THEME.textMuted), this.overlayRoot),
      makeText(this, width - 228, 150, "", textStyle(7, LAB_THEME.textMuted), this.overlayRoot)
    );
  }
}
