import type { RunState } from "../../types.js";
import { PhaseView } from "./PhaseView.js";
import { UI_EVENTS } from "../../events.js";
import { renderMainPanel, renderRerollButton, renderActiveMechanicEffects, getCenteredX, type RunRenderContext } from "./shared.js";
import type { UIRewardCard } from "../../ui/components/RewardCard.js";
import { renderSectionHeader } from "../../ui/components.js";
import { createPanel } from "../../ui/widgets.js";
import { LAB_THEME } from "../../ui/theme.js";
import { makeImage } from "../../ui/display.js";

export class RewardPhaseView extends PhaseView {
  private headerContainer!: Phaser.GameObjects.Container;
  private optionsLayer!: Phaser.GameObjects.Container;

  constructor(
    scene: Phaser.Scene,
    ctx: RunRenderContext
  ) {
    super(scene, ctx);
  }

  public build(): void {
    const { scene, width, contentInner, layout } = this.ctx;
    const localCtx = { ...this.ctx, phaseRoot: this.container };
    
    // Background and frame
    renderMainPanel(localCtx);

    // Illustration Backdrop (Right Side)
    const backdropX = contentInner.x + contentInner.width - 80;
    const backdropY = contentInner.y + 60;
    createPanel(scene, backdropX - 60, backdropY - 45, 120, 110, 0x1a3342, undefined, this.container);
    
    this.headerContainer = scene.add.container(0, 0);
    this.optionsLayer = scene.add.container(0, 0);
    this.container.add([this.headerContainer, this.optionsLayer]);
  }

  updateState(state: RunState): void {
    const { scene, width, contentInner } = this.ctx;
    const reward = state.reward!;

    this.headerContainer.removeAll(true);
    renderSectionHeader(
      scene,
      contentInner.x + 4,
      contentInner.y + 6,
      `${reward.title.toUpperCase()} / ${state.planetName.toUpperCase()}`,
      reward.description,
      contentInner.width - 180,
      this.headerContainer
    );

    this.optionsLayer.removeAll(true).setVisible(true).setAlpha(1);
    
    const count = reward.choices.length;
    const gap = 16;
    const cardW = 160;
    const cardH = 92;
    const totalW = (count * cardW) + ((count - 1) * gap);
    
    let x = contentInner.x + getCenteredX(totalW, contentInner.width);
    const selectionY = contentInner.y + contentInner.height - cardH - 12;

    // Background Panel for selections
    createPanel(scene, contentInner.x + 8, selectionY - 8, contentInner.width - 16, cardH + 16, 0x1a3342, LAB_THEME.borderSoft, this.optionsLayer);

    for (const choice of reward.choices) {
      const card = this.scene.add.uiRewardCard(x, selectionY, cardW, cardH);
      card.setReward(choice);
      this.optionsLayer.add(card);
      x += cardW + gap;
    }
  }
}
