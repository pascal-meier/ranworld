import type { MechanicId, RunState } from "../../types.js";
import { PhaseView } from "./PhaseView.js";
import { UI_EVENTS } from "../../events.js";
import { renderMainPanel, type RunRenderContext } from "./shared.js";
import { renderSectionHeader } from "../../ui/components.js";
import { createButton } from "../../ui/widgets.js";
import { getMechanicDefinition } from "../../mechanics/index.js";
import { getUpgradeTrackLabel } from "../../mechanics/catalog.js";
import { LAB_THEME, textStyle } from "../../ui/theme.js";
import { makeText } from "../../ui/display.js";

export class DraftPhaseView extends PhaseView {
  private headerContainer!: Phaser.GameObjects.Container;
  private optionsLayer!: Phaser.GameObjects.Container;

  constructor(
    scene: Phaser.Scene,
    ctx: RunRenderContext
  ) {
    super(scene, ctx);
  }

  public build(): void {
    const { scene, contentInner } = this.ctx;
    const localCtx = { ...this.ctx, phaseRoot: this.container };
    
    // Background and base layout
    renderMainPanel(localCtx);

    // Static containers
    this.headerContainer = scene.add.container(0, 0);
    this.optionsLayer = scene.add.container(0, 0);
    this.container.add([this.headerContainer, this.optionsLayer]);

    makeText(
      scene,
      contentInner.x + 4,
      contentInner.y + 214,
      "Choosing a new mechanic rotates out the oldest active one.",
      textStyle(8, LAB_THEME.accent, "left", contentInner.width - 8),
      this.container
    );
  }

  updateState(state: RunState): void {
    const { scene, contentInner } = this.ctx;
    const draft = state.draft!;

    // Fast-rebuild header (texts only)
    this.headerContainer.removeAll(true);
    renderSectionHeader(
      scene, 
      contentInner.x + 4, 
      contentInner.y + 6, 
      draft.title.toUpperCase(), 
      draft.description, 
      contentInner.width - 8, 
      this.headerContainer
    );

    // Fast-rebuild dynamic buttons
    this.optionsLayer.removeAll(true);
    const gap = 18;
    const buttonWidth = Math.floor((contentInner.width - gap * 2) / 3);
    let x = contentInner.x + 4;

    for (const mechanicId of draft.choices) {
      const mechanic = getMechanicDefinition(mechanicId);
      createButton(scene, {
        x,
        y: contentInner.y + 54,
        width: buttonWidth,
        height: 110,
        label: mechanic.shortLabel.toUpperCase(),
        detail: `${getUpgradeTrackLabel(mechanic.upgradeTrack)}. ${mechanic.effectText}`,
        onClick: () => this.scene.events.emit(UI_EVENTS.MECHANIC_SELECTED, mechanicId),
        iconKey: mechanic.iconKey,
      }, this.optionsLayer);
      x += buttonWidth + gap;
    }

    if (draft.canSkip) {
      createButton(scene, {
        x: contentInner.x + 4,
        y: contentInner.y + 176,
        width: 180,
        height: 32,
        label: "SKIP",
        detail: "",
        onClick: () => this.scene.events.emit(UI_EVENTS.MECHANIC_SELECTED, null),
        fill: 0x284861,
      }, this.optionsLayer);
    }
  }
}
