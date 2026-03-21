import { labStore } from "../core/LabStore.js";
import { getMechanicDefinition } from "../mechanics/index.js";
import { LAB_THEME, textStyle } from "../ui/theme.js";
import { createPanel } from "../ui/widgets.js";

export class OverlayScene extends Phaser.Scene {
  private readonly handleChange = () => this.render();

  constructor() {
    super({ key: "OverlayScene" });
  }

  create(): void {
    labStore.on("changed", this.handleChange);

    this.input.keyboard?.on("keydown-TAB", (event: KeyboardEvent) => {
      event.preventDefault();
      labStore.toggleDevOverlay();
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      labStore.off("changed", this.handleChange);
    });

    this.render();
  }

  private render(): void {
    this.children.removeAll(true);

    if (!labStore.isDevOverlayVisible()) {
      return;
    }

    const state = labStore.getState();
    const meta = labStore.getMeta();
    const { width } = this.scale;

    createPanel(this, width - 248, 16, 232, 146, 0x081723, 0x4cc9f0);
    this.add.text(width - 228, 30, "DEV OVERLAY", textStyle(10)).setOrigin(0);

    const lines = [
      `Queued seed: ${state?.seed ?? labStore.getSeedPreview()}`,
      `Phase: ${state?.phase ?? "setup"}`,
      `RNG draws: ${labStore.getRngDrawCount()}`,
      `Meta archive: ${meta.archive}`,
      `Tab toggles overlay`,
    ];

    this.add.text(width - 228, 48, lines.join("\n"), textStyle(8, LAB_THEME.textMuted)).setOrigin(0);

    let y = 102;

    if (state) {
      const mechanicText =
        state.activeMechanics.length > 0
          ? state.activeMechanics
              .map((id) => getMechanicDefinition(id).shortLabel)
              .join(", ")
          : "none";

      this.add.text(width - 228, y, `Active: ${mechanicText}`, textStyle(8)).setOrigin(0);
      y += 14;

      for (const entry of state.currentProbabilities.slice(0, 2)) {
        this.add
          .text(
            width - 228,
            y,
            `${entry.label}: shown ${entry.shown} | actual ${entry.actual}`,
            textStyle(7, LAB_THEME.accent)
          )
          .setOrigin(0);
        y += 12;
      }

      for (const debugLine of labStore.getDebugLines().slice(0, 2)) {
        this.add.text(width - 228, y, debugLine, textStyle(7, LAB_THEME.textMuted)).setOrigin(0);
        y += 10;
      }
    }
  }
}
