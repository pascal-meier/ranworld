import type { RunState } from "../../types.js";
import { PhaseView } from "./PhaseView.js";
import { renderMainPanel, type RunRenderContext } from "./shared.js";
import { createPanel } from "../../ui/widgets.js";
import { LAB_THEME, textStyle } from "../../ui/theme.js";
import { makeImage, makeText } from "../../ui/display.js";
import { UIEventChoice } from "../../ui/components/EventChoice.js";
import type { LayoutRect } from "../../ui/layout.js";

interface EventLayout {
  titleX: number;
  titleY: number;
  descriptionX: number;
  descriptionY: number;
  descriptionWidth: number;
  illustrationX: number;
  illustrationY: number;
  illustrationWidth: number;
  illustrationHeight: number;
  optionsRect: LayoutRect;
}

function getEventLayout(contentInner: LayoutRect): EventLayout {
  const illustrationWidth = 140;
  const illustrationHeight = 126;

  return {
    titleX: contentInner.x + 4,
    titleY: contentInner.y + 6,
    descriptionX: contentInner.x + 4,
    descriptionY: contentInner.y + 28,
    descriptionWidth: contentInner.width - illustrationWidth - 40,
    illustrationX: contentInner.x + contentInner.width - illustrationWidth - 8,
    illustrationY: contentInner.y + 8,
    illustrationWidth,
    illustrationHeight,
    optionsRect: {
      x: contentInner.x + 24,
      y: contentInner.y + 112,
      width: contentInner.width - 48,
      height: contentInner.height - 136,
    },
  };
}

function getIllustrationKey(scene: Phaser.Scene, title: string): string | null {
  let illustrationKey = "event-analyst";
  const lowerTitle = title.toLowerCase();

  if (lowerTitle.includes("signal") || lowerTitle.includes("storm") || lowerTitle.includes("ion")) {
    illustrationKey = "illustration-ion-storm";
  } else if (lowerTitle.includes("vault") || lowerTitle.includes("echo") || lowerTitle.includes("ancient")) {
    illustrationKey = "illustration-echo-vault";
  } else if (!scene.textures.exists(illustrationKey)) {
    illustrationKey = "event-terminal";
  }

  return scene.textures.exists(illustrationKey) ? illustrationKey : null;
}

export class EventPhaseView extends PhaseView {
  private headerContainer!: Phaser.GameObjects.Container;
  private optionsLayer!: Phaser.GameObjects.Container;
  private titleText!: Phaser.GameObjects.Text;
  private descriptionText!: Phaser.GameObjects.Text;
  private illustrationImage?: Phaser.GameObjects.Image;
  private choices: UIEventChoice[] = [];

  constructor(
    scene: Phaser.Scene,
    ctx: RunRenderContext
  ) {
    super(scene, ctx);
  }

  public build(): void {
    const { scene, contentInner } = this.ctx;
    const localCtx = { ...this.ctx, phaseRoot: this.container };
    const layout = getEventLayout(contentInner);

    renderMainPanel(localCtx);

    this.headerContainer = new Phaser.GameObjects.Container(scene, 0, 0);
    this.optionsLayer = new Phaser.GameObjects.Container(scene, 0, 0);
    this.optionsLayer.setDepth(10);
    this.container.add([this.headerContainer, this.optionsLayer]);

    createPanel(
      scene,
      layout.illustrationX,
      layout.illustrationY,
      layout.illustrationWidth,
      layout.illustrationHeight,
      0x1a3342,
      undefined,
      this.headerContainer
    );

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
      layout.optionsRect.x,
      layout.optionsRect.y,
      layout.optionsRect.width,
      layout.optionsRect.height,
      0x1a3342,
      LAB_THEME.borderSoft,
      this.optionsLayer
    );
  }

  updateState(state: RunState): void {
    const { scene } = this.ctx;
    const event = state.event!;
    const layout = getEventLayout(this.ctx.contentInner);

    this.titleText.setText(`${event.title.toUpperCase()} / ${state.planetName.toUpperCase()}`);
    this.descriptionText.setText(event.description);

    const illustrationKey = getIllustrationKey(scene, event.title);
    if (illustrationKey) {
      if (!this.illustrationImage) {
        this.illustrationImage = makeImage(
          scene,
          layout.illustrationX + layout.illustrationWidth / 2,
          layout.illustrationY + layout.illustrationHeight / 2,
          illustrationKey,
          this.headerContainer
        ).setOrigin(0.5);
      } else {
        this.illustrationImage
          .setTexture(illustrationKey)
          .setVisible(true)
          .setPosition(
            layout.illustrationX + layout.illustrationWidth / 2,
            layout.illustrationY + layout.illustrationHeight / 2
          );
      }

      this.illustrationImage.displayHeight = 110;
      this.illustrationImage.scaleX = this.illustrationImage.scaleY;
    } else if (this.illustrationImage) {
      this.illustrationImage.setVisible(false);
    }

    while (this.choices.length < event.options.length) {
      const choice = new UIEventChoice(this.scene, 0, 0, layout.optionsRect.width - 32, 42);
      this.optionsLayer.add(choice);
      this.choices.push(choice);
    }

    const gap = 12;
    const choiceHeight = 42;
    const totalHeight = (event.options.length * choiceHeight) + (Math.max(0, event.options.length - 1) * gap);
    const startY = layout.optionsRect.y + Math.max(16, Math.floor((layout.optionsRect.height - totalHeight) / 2));
    const choiceX = layout.optionsRect.x + 16;

    for (let index = 0; index < this.choices.length; index += 1) {
      const choice = this.choices[index];
      const option = event.options[index];

      if (!option) {
        choice.setVisible(false);
        continue;
      }

      choice
        .setVisible(true)
        .setPosition(choiceX, startY + (index * (choiceHeight + gap)))
        .setChoice(option);
    }
  }
}
