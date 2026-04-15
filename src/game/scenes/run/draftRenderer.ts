import type { MechanicId, RunState } from "../../types.js";
import { PhaseView } from "./PhaseView.js";
import { UI_EVENTS } from "../../events.js";
import { renderMainPanel, type RunRenderContext } from "./shared.js";
import { createButton } from "../../ui/widgets.js";
import { UIButton } from "../../ui/objects.js";
import { getMechanicDefinition } from "../../mechanics/index.js";
import { getUpgradeTrackLabel } from "../../mechanics/catalog.js";
import { LAB_THEME, textStyle } from "../../ui/theme.js";
import { makeText } from "../../ui/display.js";
import type { LayoutRect } from "../../ui/layout.js";

interface DraftLayout {
  titleX: number;
  titleY: number;
  descriptionX: number;
  descriptionY: number;
  optionY: number;
  optionWidth: number;
  optionHeight: number;
  optionGap: number;
  skipY: number;
  noteY: number;
}

function getDraftLayout(contentInner: LayoutRect): DraftLayout {
  const bottomY = contentInner.y + contentInner.height;
  const optionGap = 18;
  const optionY = contentInner.y + 54;
  const optionWidth = Math.floor((contentInner.width - optionGap * 2) / 3);
  const reservedBottom = 92;
  const optionHeight = Phaser.Math.Clamp(bottomY - optionY - reservedBottom, 88, 110);
  const skipY = optionY + optionHeight + 12;
  const noteY = Math.min(bottomY - 18, skipY + 40);

  return {
    titleX: contentInner.x + 4,
    titleY: contentInner.y + 6,
    descriptionX: contentInner.x + 4,
    descriptionY: contentInner.y + 28,
    optionY,
    optionWidth,
    optionHeight,
    optionGap,
    skipY,
    noteY,
  };
}

export class DraftPhaseView extends PhaseView {
  private headerContainer!: Phaser.GameObjects.Container;
  private optionsLayer!: Phaser.GameObjects.Container;
  private titleText!: Phaser.GameObjects.Text;
  private descriptionText!: Phaser.GameObjects.Text;
  private noteText!: Phaser.GameObjects.Text;
  private choiceButtons: UIButton[] = [];
  private skipButton!: UIButton;

  constructor(
    scene: Phaser.Scene,
    ctx: RunRenderContext
  ) {
    super(scene, ctx);
  }

  public build(): void {
    const { scene, contentInner } = this.ctx;
    const localCtx = { ...this.ctx, phaseRoot: this.container };
    const layout = getDraftLayout(contentInner);

    renderMainPanel(localCtx);

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
      textStyle(10, LAB_THEME.textMuted, "left", contentInner.width - 8),
      this.headerContainer
    );

    let x = contentInner.x + 4;

    for (let index = 0; index < 3; index += 1) {
      const button = createButton(scene, {
        x,
        y: layout.optionY,
        width: layout.optionWidth,
        height: layout.optionHeight,
        label: "",
        detail: "",
        onClick: () => undefined,
      }, this.optionsLayer);
      this.choiceButtons.push(button);
      x += layout.optionWidth + layout.optionGap;
    }

    this.skipButton = createButton(scene, {
      x: contentInner.x + 4,
      y: layout.skipY,
      width: 180,
      height: 32,
      label: "SKIP",
      detail: "",
      onClick: () => this.scene.events.emit(UI_EVENTS.MECHANIC_SELECTED, null),
      fill: 0x284861,
    }, this.optionsLayer).setVisible(false);

    this.noteText = makeText(
      scene,
      contentInner.x + 4,
      layout.noteY,
      "Choosing a new mechanic rotates out the oldest active one.",
      textStyle(8, LAB_THEME.accent, "left", contentInner.width - 8),
      this.container
    );
  }

  updateState(state: RunState): void {
    const draft = state.draft!;
    const layout = getDraftLayout(this.ctx.contentInner);

    this.titleText.setText(draft.title.toUpperCase());
    this.descriptionText.setText(draft.description);
    this.noteText.setPosition(this.ctx.contentInner.x + 4, layout.noteY);

    for (let index = 0; index < this.choiceButtons.length; index += 1) {
      const button = this.choiceButtons[index];
      const mechanicId = draft.choices[index];

      if (!mechanicId) {
        button.setVisible(false);
        continue;
      }

      button.setPosition(
        this.ctx.contentInner.x + 4 + index * (layout.optionWidth + layout.optionGap),
        layout.optionY
      );
      this.syncChoiceButton(button, mechanicId);
    }

    this.skipButton.setPosition(this.ctx.contentInner.x + 4, layout.skipY);
    this.skipButton.setVisible(draft.canSkip);
  }

  private syncChoiceButton(button: UIButton, mechanicId: MechanicId): void {
    const mechanic = getMechanicDefinition(mechanicId);

      button
        .setVisible(true)
        .setLabelText(mechanic.shortLabel.toUpperCase())
        .setDetailText(`${getUpgradeTrackLabel(mechanic.upgradeTrack)}. ${mechanic.effectText}`)
        .setClickHandler(() => this.scene.events.emit(UI_EVENTS.MECHANIC_SELECTED, mechanicId));
  }
}
