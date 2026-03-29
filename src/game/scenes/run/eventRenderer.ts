import type { RunState } from "../../types.js";
import { PhaseView } from "./PhaseView.js";
import { UI_EVENTS } from "../../events.js";
import { renderMainPanel, renderRerollButton, type RunRenderContext } from "./shared.js";
import type { UIEventChoice } from "../../ui/components/EventChoice.js";
import { renderSectionHeader } from "../../ui/components.js";
import { createPanel } from "../../ui/widgets.js";
import { LAB_THEME } from "../../ui/theme.js";
import { makeImage } from "../../ui/display.js";

export class EventPhaseView extends PhaseView {
  private headerContainer!: Phaser.GameObjects.Container;
  private optionsLayer!: Phaser.GameObjects.Container;

  constructor(
    scene: Phaser.Scene,
    ctx: RunRenderContext
  ) {
    super(scene, ctx);
  }

  public build(): void {
    const { scene, width, contentInner } = this.ctx;
    const localCtx = { ...this.ctx, phaseRoot: this.container };
    
    renderMainPanel(localCtx);

    // Illustration Backdrop (Right Side)
    const illustrationW = 140;
    const illustrationX = contentInner.x + contentInner.width - illustrationW - 8;
    createPanel(scene, illustrationX, contentInner.y + 8, illustrationW, 126, 0x1a3342, undefined, this.container);

    const eventIcon = scene.textures.exists("event-analyst") ? "event-analyst" : "event-terminal";
    if (scene.textures.exists(eventIcon)) {
      const img = makeImage(scene, illustrationX + illustrationW / 2, contentInner.y + 70, eventIcon, this.container).setOrigin(0.5);
      img.displayHeight = 110;
      img.scaleX = img.scaleY;
    }

    this.headerContainer = scene.add.container(0, 0);
    this.optionsLayer = scene.add.container(0, 0);
    this.container.add([this.headerContainer, this.optionsLayer]);
  }

  updateState(state: RunState): void {
    const { scene, width, contentInner } = this.ctx;
    const event = state.event!;

    this.headerContainer.removeAll(true);
    renderSectionHeader(
      scene,
      contentInner.x + 4,
      contentInner.y + 6,
      `${event.title.toUpperCase()} / ${state.planetName.toUpperCase()}`,
      event.description,
      contentInner.width - 180,
      this.headerContainer
    );

    this.optionsLayer.removeAll(true).setVisible(true).setAlpha(1).setDepth(10);
    
    const optionsW = contentInner.width - 96;
    const choiceH = 42;
    const gap = 12;
    const totalOptionsH = (event.options.length * choiceH) + ((event.options.length - 1) * gap);
    const optionsStartY = contentInner.y + contentInner.height - totalOptionsH - 36;

    // Background for choice area 
    const panelPadding = 16;
    createPanel(scene, contentInner.x + 32, optionsStartY - panelPadding, optionsW + 32, totalOptionsH + panelPadding * 2, 0x1a3342, LAB_THEME.borderSoft, this.optionsLayer);
    
    event.options.forEach((option, index) => {
      const choiceY = optionsStartY + index * (choiceH + gap);
      const choice = this.scene.add.uiEventChoice(contentInner.x + 48, choiceY, optionsW, choiceH);
      choice.setChoice(option);
      choice.setDepth(1); // Higher than the panel within the same layer
      this.optionsLayer.add(choice);
    });
  }
}
