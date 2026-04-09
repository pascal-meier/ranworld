import { getCategoryName, getLayerName, getUpgradeTrackLabel } from "../../mechanics/catalog.js";
import { getMechanicDefinition } from "../../mechanics/index.js";
import type { TutorialDefinition } from "../../tutorials/catalog.js";
import { LAB_THEME, textStyle } from "../../ui/theme.js";
import { UIButton } from "../../ui/objects.js";
import { createButton, createPanel } from "../../ui/widgets.js";
import { makeRectangle, makeText } from "../../ui/display.js";
import { renderTutorialNodeIcon } from "../../ui/tutorialOverlay.js";
import type { RunRenderContext } from "./shared.js";

interface TutorialRowUi {
  root: Phaser.GameObjects.Container;
  headingText: Phaser.GameObjects.Text;
  bodyText: Phaser.GameObjects.Text;
}

interface TutorialUi {
  root: Phaser.GameObjects.Container;
  blocker: Phaser.GameObjects.Rectangle;
  panel: Phaser.GameObjects.Container;
  titleText: Phaser.GameObjects.Text;
  introText: Phaser.GameObjects.Text;
  closeButton: UIButton;
  confirmButton: UIButton;
  rows: TutorialRowUi[];
}

interface ModifierRowUi {
  root: Phaser.GameObjects.Container;
  titleText: Phaser.GameObjects.Text;
  metaText: Phaser.GameObjects.Text;
  effectText: Phaser.GameObjects.Text;
}

interface ModifiersUi {
  root: Phaser.GameObjects.Container;
  blocker: Phaser.GameObjects.Rectangle;
  panel: Phaser.GameObjects.Container;
  titleText: Phaser.GameObjects.Text;
  subtitleText: Phaser.GameObjects.Text;
  closeButton: UIButton;
  emptyText: Phaser.GameObjects.Text;
  rows: ModifierRowUi[];
}

export class RunOverlayManager {
  private tutorialUi?: TutorialUi;
  private tutorialSignature?: string;
  private tutorialOnClose?: () => void;

  private modifiersUi?: ModifiersUi;
  private modifiersSignature?: string;
  private modifiersOnClose?: () => void;

  constructor(
    private scene: Phaser.Scene,
    private layer: Phaser.GameObjects.Container
  ) {}

  syncTutorial(
    tutorial: TutorialDefinition | undefined,
    onClose: () => void
  ): void {
    this.tutorialOnClose = onClose;

    if (!tutorial) {
      this.tutorialUi?.root.setVisible(false);
      return;
    }

    const { width, height } = this.scene.scale;
    const signature = [width, height, tutorial.id].join(":");
    const panelWidth = Math.min(700, width - 120);
    const panelHeight = Math.min(436, height - 100);
    const panelX = Math.floor((width - panelWidth) / 2);
    const panelY = Math.floor((height - panelHeight) / 2);
    const contentX = 20;

    this.ensureTutorialUi(signature, tutorial, panelX, panelY, panelWidth, panelHeight);
    if (!this.tutorialUi) {
      return;
    }

    this.layer.bringToTop(this.tutorialUi.root);
    this.tutorialUi.root.setVisible(true).setPosition(panelX, panelY);
    this.tutorialUi.titleText.setText(tutorial.title);
    this.tutorialUi.introText.setText(tutorial.intro);
    this.tutorialUi.closeButton.setClickHandler(() => this.triggerTutorialClose());
    this.tutorialUi.confirmButton
      .setLabelText(tutorial.confirmLabel)
      .setClickHandler(() => this.triggerTutorialClose());

    let rowY = 102;
    for (let index = 0; index < this.tutorialUi.rows.length; index += 1) {
      const row = this.tutorialUi.rows[index];
      const item = tutorial.items[index];

      if (!item) {
        row.root.setVisible(false);
        continue;
      }

      row.root.setVisible(true).setPosition(16, rowY);
      row.headingText.setText(item.heading);
      row.bodyText.setText(item.body);
      rowY += 54;
    }
  }

  syncModifiers(
    ctx: RunRenderContext,
    visible: boolean,
    onClose: () => void
  ): void {
    this.modifiersOnClose = onClose;

    if (!visible) {
      this.modifiersUi?.root.setVisible(false);
      return;
    }

    const { width, height, state } = ctx;
    const signature = [width, height].join(":");
    const panelWidth = width - 68;
    const panelHeight = height - 104;

    this.ensureModifiersUi(signature, panelWidth, panelHeight);
    if (!this.modifiersUi) {
      return;
    }

    this.layer.bringToTop(this.modifiersUi.root);
    this.modifiersUi.root.setVisible(true).setPosition(34, 52);
    this.modifiersUi.closeButton.setClickHandler(() => this.triggerModifiersClose());
    this.modifiersUi.emptyText.setVisible(state.activeMechanics.length === 0);

    while (this.modifiersUi.rows.length < state.activeMechanics.length) {
      this.modifiersUi.rows.push(this.createModifierRow(panelWidth));
    }

    let y = 122;
    for (let index = 0; index < this.modifiersUi.rows.length; index += 1) {
      const row = this.modifiersUi.rows[index];
      const mechanicId = state.activeMechanics[index];

      if (!mechanicId) {
        row.root.setVisible(false);
        continue;
      }

      const mechanic = getMechanicDefinition(mechanicId);
      row.root.setVisible(true).setPosition(14, y);
      row.titleText.setText(
        `${mechanic.shortLabel.toUpperCase()}  /  ${mechanic.tableId}  /  ${getUpgradeTrackLabel(mechanic.upgradeTrack).toUpperCase()}`
      );
      row.metaText.setText(`${getLayerName(mechanic.layerId)} / ${getCategoryName(mechanic.categoryId)}`);
      row.effectText.setText(mechanic.effectText);
      y += 84;
    }
  }

  destroy(): void {
    this.tutorialUi?.root.destroy();
    this.modifiersUi?.root.destroy();
  }

  private ensureTutorialUi(
    signature: string,
    tutorial: TutorialDefinition,
    panelX: number,
    panelY: number,
    panelWidth: number,
    panelHeight: number
  ): void {
    if (this.tutorialUi && this.tutorialSignature === signature) {
      return;
    }

    this.tutorialUi?.root.destroy();

    const root = new Phaser.GameObjects.Container(this.scene, 0, 0);
    this.layer.add(root);

    const blocker = makeRectangle(
      this.scene,
      -panelX,
      -panelY,
      this.scene.scale.width,
      this.scene.scale.height,
      0x02060a,
      0.74,
      root
    )
      .setOrigin(0)
      .setInteractive({ useHandCursor: false });
    blocker.on("pointerdown", () => this.triggerTutorialClose());

    const panel = createPanel(this.scene, 0, 0, panelWidth, panelHeight, 0x133229, 0x8ce5c2, root);
    panel
      .setSize(panelWidth, panelHeight)
      .setInteractive(new Phaser.Geom.Rectangle(0, 0, panelWidth, panelHeight), Phaser.Geom.Rectangle.Contains)
      .on("pointerdown", () => this.triggerTutorialClose());

    makeRectangle(this.scene, 10, 14, panelWidth - 20, 8, 0x8ce5c2, 0.75, root).setOrigin(0);
    const titleText = makeText(this.scene, 20, 24, "", textStyle(13, LAB_THEME.positive), root);
    const introText = makeText(this.scene, 20, 52, "", textStyle(9, "#b7d8cc", "left", panelWidth - 40), root);
    const closeButton = createButton(this.scene, {
      x: panelWidth - 148,
      y: 22,
      width: 124,
      height: 26,
      label: "SCHLIESSEN",
      detail: "",
      onClick: () => this.triggerTutorialClose(),
      fill: 0x2a5a47,
      border: 0x8ce5c2,
    }, root);
    const confirmButton = createButton(this.scene, {
      x: panelWidth - 184,
      y: panelHeight - 58,
      width: 160,
      height: 38,
      label: tutorial.confirmLabel,
      detail: "",
      onClick: () => this.triggerTutorialClose(),
      fill: 0x2a5a47,
      border: 0x8ce5c2,
    }, root);

    const rows: TutorialRowUi[] = tutorial.items.map((item) => this.createTutorialRow(panelWidth, item.nodeKind));
    rows.forEach((row) => root.add(row.root));

    this.tutorialUi = {
      root,
      blocker,
      panel,
      titleText,
      introText,
      closeButton,
      confirmButton,
      rows,
    };
    this.tutorialSignature = signature;
  }

  private createTutorialRow(panelWidth: number, nodeKind: TutorialDefinition["items"][number]["nodeKind"]): TutorialRowUi {
    const root = new Phaser.GameObjects.Container(this.scene, 0, 0);
    createPanel(this.scene, 0, 0, panelWidth - 32, 46, 0x1c4238, 0x4f8e79, root);

    if (nodeKind) {
      renderTutorialNodeIcon(this.scene, nodeKind, 24, 23, root);
    }

    const headingText = makeText(this.scene, 52, 8, "", textStyle(8, LAB_THEME.positive), root);
    const bodyText = makeText(this.scene, 52, 22, "", textStyle(8, "#c8ddd5", "left", panelWidth - 116), root);

    return { root, headingText, bodyText };
  }

  private ensureModifiersUi(signature: string, panelWidth: number, panelHeight: number): void {
    if (this.modifiersUi && this.modifiersSignature === signature) {
      return;
    }

    this.modifiersUi?.root.destroy();

    const root = new Phaser.GameObjects.Container(this.scene, 34, 52);
    this.layer.add(root);

    const blocker = makeRectangle(
      this.scene,
      -34,
      -52,
      this.scene.scale.width,
      this.scene.scale.height,
      0x02060a,
      0.72,
      root
    )
      .setOrigin(0)
      .setInteractive({ useHandCursor: false });
    blocker.on("pointerdown", () => this.triggerModifiersClose());

    const panel = createPanel(this.scene, 0, 0, panelWidth, panelHeight, 0x0c1c27, LAB_THEME.border, root);
    panel
      .setSize(panelWidth, panelHeight)
      .setInteractive(new Phaser.Geom.Rectangle(0, 0, panelWidth, panelHeight), Phaser.Geom.Rectangle.Contains)
      .on("pointerdown", () => this.triggerModifiersClose());

    const titleText = makeText(this.scene, 18, 20, "ACTIVE MODIFIERS", textStyle(13), root);
    const subtitleText = makeText(this.scene, 18, 44, "Press M or Esc to close.", textStyle(8, LAB_THEME.textMuted), root);
    const closeButton = createButton(this.scene, {
      x: panelWidth - 142,
      y: 16,
      width: 120,
      height: 26,
      label: "SCHLIESSEN",
      detail: "",
      onClick: () => this.triggerModifiersClose(),
      fill: 0x284861,
      border: LAB_THEME.borderSoft,
    }, root);
    const emptyText = makeText(this.scene, 18, 74, "No active modifiers yet.", textStyle(10, LAB_THEME.textMuted), root);

    this.modifiersUi = {
      root,
      blocker,
      panel,
      titleText,
      subtitleText,
      closeButton,
      emptyText,
      rows: [],
    };
    this.modifiersSignature = signature;
  }

  private createModifierRow(panelWidth: number): ModifierRowUi {
    if (!this.modifiersUi) {
      throw new Error("Modifiers UI must exist before creating rows.");
    }

    const root = new Phaser.GameObjects.Container(this.scene, 0, 0);
    createPanel(this.scene, 0, 0, panelWidth - 28, 76, LAB_THEME.panelAlt, LAB_THEME.borderSoft, root);
    const titleText = makeText(this.scene, 14, 8, "", textStyle(9, LAB_THEME.text), root);
    const metaText = makeText(this.scene, 14, 24, "", textStyle(8, LAB_THEME.accent, "left", panelWidth - 60), root);
    const effectText = makeText(this.scene, 14, 42, "", textStyle(9, LAB_THEME.textMuted, "left", panelWidth - 60), root);

    this.modifiersUi.root.add(root);
    return { root, titleText, metaText, effectText };
  }

  private triggerTutorialClose(): void {
    this.tutorialOnClose?.();
  }

  private triggerModifiersClose(): void {
    this.modifiersOnClose?.();
  }
}
