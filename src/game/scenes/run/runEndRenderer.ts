import type { RunState } from "../../types.js";
import { PhaseView } from "./PhaseView.js";
import { UI_EVENTS } from "../../events.js";
import { renderMainPanel, type RunRenderContext } from "./shared.js";
import { createButton } from "../../ui/widgets.js";
import { LAB_THEME, textStyle } from "../../ui/theme.js";
import { makeText } from "../../ui/display.js";
import type { UIButton } from "../../ui/objects.js";

export class RunEndPhaseView extends PhaseView {
  private statsText!: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    ctx: RunRenderContext
  ) {
    super(scene, ctx);
  }

  build(): void {
    const { scene, contentInner } = this.ctx;
    
    // Create a local context that mounts to this view's container instead of the global phaseRoot
    const localCtx = { ...this.ctx, phaseRoot: this.container };
    renderMainPanel(localCtx);

    makeText(scene, contentInner.x + 4, contentInner.y + 6, "EXPEDITION FAILED", textStyle(16, LAB_THEME.danger), this.container);
    
    this.statsText = makeText(
      scene,
      contentInner.x + 4,
      contentInner.y + 38,
      "",
      textStyle(10, LAB_THEME.text, "left", contentInner.width - 8),
      this.container
    );

    createButton(scene, {
      x: contentInner.x + 4,
      y: contentInner.y + 140,
      width: 220,
      height: 54,
      label: "SAME SEED",
      detail: "",
      onClick: () => this.scene.events.emit(UI_EVENTS.RETURN_TO_SETUP, "same"),
      fill: 0x1d4d6c,
    }, this.container);

    createButton(scene, {
      x: contentInner.x + 240,
      y: contentInner.y + 140,
      width: 220,
      height: 54,
      label: "NEW SEED",
      detail: "",
      onClick: () => this.scene.events.emit(UI_EVENTS.RETURN_TO_SETUP, "new"),
    }, this.container);
  }

  updateState(state: RunState): void {
    this.statsText.setText(`Planets crossed ${Math.max(0, state.planet - 1)}\nSurface sites cleared ${state.depth}\nMeta archive ${state.player.archiveGain}`);
  }
}
