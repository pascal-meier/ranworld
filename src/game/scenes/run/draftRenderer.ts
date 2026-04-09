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

export class DraftPhaseView extends PhaseView {
  private headerContainer!: Phaser.GameObjects.Container;
  private optionsLayer!: Phaser.GameObjects.Container;
  private titleText!: Phaser.GameObjects.Text;
  private descriptionText!: Phaser.GameObjects.Text;
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

    renderMainPanel(localCtx);

    this.headerContainer = new Phaser.GameObjects.Container(scene, 0, 0);
    this.optionsLayer = new Phaser.GameObjects.Container(scene, 0, 0);
    this.container.add([this.headerContainer, this.optionsLayer]);

    this.titleText = makeText(
      scene,
      contentInner.x + 4,
      contentInner.y + 6,
      "",
      textStyle(13, LAB_THEME.text),
      this.headerContainer
    );
    this.descriptionText = makeText(
      scene,
      contentInner.x + 4,
      contentInner.y + 28,
      "",
      textStyle(10, LAB_THEME.textMuted, "left", contentInner.width - 8),
      this.headerContainer
    );

    const gap = 18;
    const buttonWidth = Math.floor((contentInner.width - gap * 2) / 3);
    let x = contentInner.x + 4;

    for (let index = 0; index < 3; index += 1) {
      const button = createButton(scene, {
        x,
        y: contentInner.y + 54,
        width: buttonWidth,
        height: 110,
        label: "",
        detail: "",
        onClick: () => undefined,
      }, this.optionsLayer);
      this.choiceButtons.push(button);
      x += buttonWidth + gap;
    }

    this.skipButton = createButton(scene, {
      x: contentInner.x + 4,
      y: contentInner.y + 176,
      width: 180,
      height: 32,
      label: "SKIP",
      detail: "",
      onClick: () => this.scene.events.emit(UI_EVENTS.MECHANIC_SELECTED, null),
      fill: 0x284861,
    }, this.optionsLayer).setVisible(false);

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
    const draft = state.draft!;

    this.titleText.setText(draft.title.toUpperCase());
    this.descriptionText.setText(draft.description);

    for (let index = 0; index < this.choiceButtons.length; index += 1) {
      const button = this.choiceButtons[index];
      const mechanicId = draft.choices[index];

      if (!mechanicId) {
        button.setVisible(false);
        continue;
      }

      this.syncChoiceButton(button, mechanicId);
    }

    this.skipButton.setVisible(draft.canSkip);
  }

  private syncChoiceButton(button: UIButton, mechanicId: MechanicId): void {
    const mechanic = getMechanicDefinition(mechanicId);

    button
      .setVisible(true)
      .setLabelText(mechanic.shortLabel.toUpperCase())
      .setDetailText(`${getUpgradeTrackLabel(mechanic.upgradeTrack)}. ${mechanic.effectText}`)
      .setIconKey(mechanic.iconKey)
      .setClickHandler(() => this.scene.events.emit(UI_EVENTS.MECHANIC_SELECTED, mechanicId));
  }
}
