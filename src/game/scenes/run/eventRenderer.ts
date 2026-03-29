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
    const { phaseRoot } = this.ctx;
    const localCtx = { ...this.ctx, phaseRoot: this.container };
    
    renderMainPanel(localCtx);

    this.headerContainer = this.scene.add.container(0, 0);
    this.optionsLayer = this.scene.add.container(0, 0);
    this.container.add([this.headerContainer, this.optionsLayer]);
  }

  updateState(state: RunState): void {
    const { scene, width, contentInner } = this.ctx;
    const event = state.event!;

    // 1. Re-render Illustration Backdrop & Dynamic Icon/Illustration
    const illustrationW = 140;
    const illustrationX = contentInner.x + contentInner.width - illustrationW - 8;
    const illustrationY = contentInner.y + 8;
    
    // Clear old illustration elements (hack: simple way is to manage a sub-container or just redraw)
    // Here we'll just add it to the headerContainer since it's wiped every update
    createPanel(scene, illustrationX, illustrationY, illustrationW, 126, 0x1a3342, undefined, this.headerContainer);

    let illustrationKey = "event-analyst";
    const title = event.title.toLowerCase();
    
    if (title.includes("signal") || title.includes("storm") || title.includes("ion")) {
      illustrationKey = "illustration-ion-storm";
    } else if (title.includes("vault") || title.includes("echo") || title.includes("ancient")) {
      illustrationKey = "illustration-echo-vault";
    } else if (!scene.textures.exists(illustrationKey)) {
      illustrationKey = "event-terminal";
    }

    if (scene.textures.exists(illustrationKey)) {
      const img = makeImage(scene, illustrationX + illustrationW / 2, illustrationY + 62, illustrationKey, this.headerContainer).setOrigin(0.5);
      img.displayHeight = 110;
      img.scaleX = img.scaleY;
    }

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

    const panelPadding = 16;
    // Simple, reliable order-based layering in the container
    createPanel(scene, contentInner.x + 32, optionsStartY - panelPadding, optionsW + 32, totalOptionsH + panelPadding * 2, 0x1a3342, LAB_THEME.borderSoft, this.optionsLayer);
    
    event.options.forEach((option, index) => {
      const choiceY = optionsStartY + index * (choiceH + gap);
      const choice = this.scene.add.uiEventChoice(contentInner.x + 48, choiceY, optionsW, choiceH);
      choice.setChoice(option);
      this.optionsLayer.add(choice);
    });
  }
}
