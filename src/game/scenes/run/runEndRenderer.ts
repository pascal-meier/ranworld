import type { RunState } from "../../types.js";
import { PhaseView } from "./PhaseView.js";
import { UI_EVENTS } from "../../events.js";
import { renderMainPanel, type RunRenderContext } from "./shared.js";
import { createButton } from "../../ui/widgets.js";
import { LAB_THEME, textStyle } from "../../ui/theme.js";
import { makeText } from "../../ui/display.js";
import type { LayoutRect } from "../../ui/layout.js";

interface RunEndLayout {
  titleX: number;
  titleY: number;
  statsX: number;
  statsY: number;
  buttonY: number;
}

function getRunEndLayout(contentInner: LayoutRect): RunEndLayout {
  const bottomY = contentInner.y + contentInner.height;

  return {
    titleX: contentInner.x + 4,
    titleY: contentInner.y + 6,
    statsX: contentInner.x + 4,
    statsY: contentInner.y + 38,
    buttonY: Math.max(contentInner.y + 124, bottomY - 86),
  };
}

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
    const layout = getRunEndLayout(contentInner);
    
    // Create a local context that mounts to this view's container instead of the global phaseRoot
    const localCtx = { ...this.ctx, phaseRoot: this.container };
    renderMainPanel(localCtx);

    makeText(scene, layout.titleX, layout.titleY, "EXPEDITION FAILED", textStyle(16, LAB_THEME.danger), this.container);
    
    this.statsText = makeText(
      scene,
      layout.statsX,
      layout.statsY,
      "",
      textStyle(10, LAB_THEME.text, "left", contentInner.width - 8),
      this.container
    );

    createButton(scene, {
      x: contentInner.x + 4,
      y: layout.buttonY,
      width: 220,
      height: 54,
      label: "SAME SEED",
      detail: "",
      onClick: () => this.scene.events.emit(UI_EVENTS.RETURN_TO_SETUP, "same"),
      fill: 0x1d4d6c,
    }, this.container);

    createButton(scene, {
      x: contentInner.x + 240,
      y: layout.buttonY,
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
