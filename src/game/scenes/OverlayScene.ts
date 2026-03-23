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
    this.overlayRoot?.removeAll(true);

    if (!this.overlayRoot || !this.lab.isDevOverlayVisible()) {
      return;
    }

    const state = this.lab.getState();
    const meta = this.lab.getMeta();
    const { width } = this.scale;

    createPanel(this, width - 248, 16, 232, 146, 0x081723, 0x4cc9f0, this.overlayRoot);
    makeText(this, width - 228, 30, "DEV OVERLAY", textStyle(10), this.overlayRoot);

    const lines = [
      `Queued seed: ${state?.seed ?? this.lab.getSeedPreview()}`,
      `Phase: ${state?.phase ?? "setup"}`,
      `RNG draws: ${this.lab.getRngDrawCount()}`,
      `Meta archive: ${meta.archive}`,
      `Tab toggles overlay`,
    ];

    makeText(this, width - 228, 48, lines.join("\n"), textStyle(8, LAB_THEME.textMuted), this.overlayRoot);

    let y = 102;

    if (state) {
      const mechanicText =
        state.activeMechanics.length > 0
          ? state.activeMechanics
              .map((id) => getMechanicDefinition(id).shortLabel)
              .join(", ")
          : "none";

      makeText(this, width - 228, y, `Active: ${mechanicText}`, textStyle(8), this.overlayRoot);
      y += 14;

      for (const entry of state.currentProbabilities.slice(0, 2)) {
        makeText(
          this,
          width - 228,
          y,
          `${entry.label}: shown ${entry.shown} | actual ${entry.actual}`,
          textStyle(7, LAB_THEME.accent),
          this.overlayRoot
        );
        y += 12;
      }

      for (const debugLine of this.lab.getDebugLines().slice(0, 2)) {
        makeText(this, width - 228, y, debugLine, textStyle(7, LAB_THEME.textMuted), this.overlayRoot);
        y += 10;
      }
    }
  }
}
