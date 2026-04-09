import type { RunState } from "../../types.js";
import { PhaseView } from "./PhaseView.js";
import { renderMainPanel, getCenteredX, type RunRenderContext } from "./shared.js";
import { createPanel } from "../../ui/widgets.js";
import { LAB_THEME, textStyle } from "../../ui/theme.js";
import { makeText } from "../../ui/display.js";
import { UIRewardCard } from "../../ui/components/RewardCard.js";
import type { LayoutRect } from "../../ui/layout.js";

interface RewardLayout {
  titleX: number;
  titleY: number;
  descriptionX: number;
  descriptionY: number;
  descriptionWidth: number;
  backdropX: number;
  backdropY: number;
  backdropWidth: number;
  backdropHeight: number;
  selectionRect: LayoutRect;
}

function getRewardLayout(contentInner: LayoutRect): RewardLayout {
  return {
    titleX: contentInner.x + 4,
    titleY: contentInner.y + 6,
    descriptionX: contentInner.x + 4,
    descriptionY: contentInner.y + 28,
    descriptionWidth: contentInner.width - 180,
    backdropX: contentInner.x + contentInner.width - 140,
    backdropY: contentInner.y + 60,
    backdropWidth: 120,
    backdropHeight: 110,
    selectionRect: {
      x: contentInner.x + 8,
      y: contentInner.y + contentInner.height - 116,
      width: contentInner.width - 16,
      height: 108,
    },
  };
}

export class RewardPhaseView extends PhaseView {
  private headerContainer!: Phaser.GameObjects.Container;
  private optionsLayer!: Phaser.GameObjects.Container;
  private titleText!: Phaser.GameObjects.Text;
  private descriptionText!: Phaser.GameObjects.Text;
  private cards: UIRewardCard[] = [];

  constructor(
    scene: Phaser.Scene,
    ctx: RunRenderContext
  ) {
    super(scene, ctx);
  }

  public build(): void {
    const { scene, contentInner } = this.ctx;
    const localCtx = { ...this.ctx, phaseRoot: this.container };
    const layout = getRewardLayout(contentInner);

    renderMainPanel(localCtx);

    createPanel(
      scene,
      layout.backdropX,
      layout.backdropY,
      layout.backdropWidth,
      layout.backdropHeight,
      0x1a3342,
      undefined,
      this.container
    );

    this.headerContainer = new Phaser.GameObjects.Container(scene, 0, 0);
    this.optionsLayer = new Phaser.GameObjects.Container(scene, 0, 0);
    this.container.add([this.headerContainer, this.optionsLayer]);

    this.titleText = makeText(
      scene,
      layout.titleX,
      layout.titleY,
      "",
      textStyle(13, LAB_THEME.text),
      this.headerContainer
    );
    this.descriptionText = makeText(
      scene,
      layout.descriptionX,
      layout.descriptionY,
      "",
      textStyle(10, LAB_THEME.textMuted, "left", layout.descriptionWidth),
      this.headerContainer
    );

    createPanel(
      scene,
      layout.selectionRect.x,
      layout.selectionRect.y,
      layout.selectionRect.width,
      layout.selectionRect.height,
      0x1a3342,
      LAB_THEME.borderSoft,
      this.optionsLayer
    );
  }

  updateState(state: RunState): void {
    const reward = state.reward!;
    const layout = getRewardLayout(this.ctx.contentInner);

    this.titleText.setText(`${reward.title.toUpperCase()} / ${state.planetName.toUpperCase()}`);
    this.descriptionText.setText(reward.description);

    while (this.cards.length < reward.choices.length) {
      const card = new UIRewardCard(this.scene, 0, 0, 160, 92);
      this.optionsLayer.add(card);
      this.cards.push(card);
    }

    const cardWidth = 160;
    const cardHeight = 92;
    const gap = 16;
    const totalWidth = (reward.choices.length * cardWidth) + (Math.max(0, reward.choices.length - 1) * gap);
    let x = layout.selectionRect.x + getCenteredX(totalWidth, layout.selectionRect.width);
    const y = layout.selectionRect.y + Math.floor((layout.selectionRect.height - cardHeight) / 2);

    for (let index = 0; index < this.cards.length; index += 1) {
      const card = this.cards[index];
      const choice = reward.choices[index];

      if (!choice) {
        card.setVisible(false);
        continue;
      }

      card
        .setVisible(true)
        .setPosition(x, y)
        .setReward(choice);

      x += cardWidth + gap;
    }
  }
}
