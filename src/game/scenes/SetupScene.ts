import { allMechanics, getMechanicDefinition } from "../mechanics/index.js";
import { getSessionPersistenceBonus } from "../mechanics/sessionPersistence.js";
import { LAB_THEME, textStyle } from "../ui/theme.js";
import { createButton, createPanel, createTag } from "../ui/widgets.js";
import { createScreenLayout, insetRect } from "../ui/layout.js";
import { makeImage, makeRectangle, makeText } from "../ui/display.js";
import { attachImageTooltip } from "../ui/tooltip.js";
import { UIButton } from "../ui/objects.js";
import { VerticalScrollViewport } from "../ui/scroll.js";
import { BaseScene } from "./BaseScene.js";
import { META_UPGRADES, getUpgradeLevel, canAffordUpgrade, getUpgradeCost } from "../core/metaUpgrades.js";

type SetupLayout = ReturnType<typeof createScreenLayout>;

interface UpgradeRow {
  nameText: Phaser.GameObjects.Text;
  descriptionText: Phaser.GameObjects.Text;
  button: UIButton;
  upgradeId: typeof META_UPGRADES[number]["id"];
}

export class SetupScene extends BaseScene {
  private readonly handleChange = () => this.render();
  private readonly handleResize = () => this.render();
  private readonly handleEnter = () => {
    this.lab.startRun();
    this.scene.start("RunScene");
  };
  private readonly handleReroll = () => this.lab.rerollSeed();
  private backgroundLayer?: Phaser.GameObjects.Container;
  private chromeLayer?: Phaser.GameObjects.Container;
  private contentLayer?: Phaser.GameObjects.Container;
  private footerLayer?: Phaser.GameObjects.Container;
  private tooltipLayer?: Phaser.GameObjects.Container;
  private researchScroll?: VerticalScrollViewport;
  private layoutSignature?: string;
  private isUiBuilt = false;

  private titleText?: Phaser.GameObjects.Text;
  private subtitleText?: Phaser.GameObjects.Text;
  private seedText?: Phaser.GameObjects.Text;
  private runsText?: Phaser.GameObjects.Text;
  private bestPlanetText?: Phaser.GameObjects.Text;
  private archiveValueText?: Phaser.GameObjects.Text;
  private persistenceText?: Phaser.GameObjects.Text;
  private archiveTooltipText?: Phaser.GameObjects.Text;
  private researchSubtitleText?: Phaser.GameObjects.Text;
  private upgradeRows: UpgradeRow[] = [];
  private footerStatusObjects: Array<Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.Visible> = [];
  private footerDevObjects: Array<Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.Visible> = [];

  private isUsableText(
    text: Phaser.GameObjects.Text | undefined
  ): text is Phaser.GameObjects.Text {
    return Boolean(text && text.scene && text.active);
  }

  constructor() {
    super({ key: "SetupScene" });
  }

  create(): void {
    this.backgroundLayer = this.add.container(0, 0);
    this.chromeLayer = this.add.container(0, 0);
    this.contentLayer = this.add.container(0, 0);
    this.footerLayer = this.add.container(0, 0);
    this.tooltipLayer = this.add.container(0, 0);
    this.backgroundLayer.setDepth(0);
    this.chromeLayer.setDepth(10);
    this.contentLayer.setDepth(20);
    this.footerLayer.setDepth(30);
    this.tooltipLayer.setDepth(100);

    this.lab.on("changed", this.handleChange);
    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize);

    this.input.keyboard?.on("keydown-ENTER", this.handleEnter);
    this.input.keyboard?.on("keydown-R", this.handleReroll);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.lab.off("changed", this.handleChange);
      this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize);
      this.input.keyboard?.off("keydown-ENTER", this.handleEnter);
      this.input.keyboard?.off("keydown-R", this.handleReroll);

      this.layoutSignature = undefined;
      this.isUiBuilt = false;
      this.researchScroll?.destroy();
      this.researchScroll = undefined;
      this.backgroundLayer = undefined;
      this.chromeLayer = undefined;
      this.contentLayer = undefined;
      this.footerLayer = undefined;
      this.tooltipLayer = undefined;

      this.titleText = undefined;
      this.subtitleText = undefined;
      this.seedText = undefined;
      this.runsText = undefined;
      this.bestPlanetText = undefined;
      this.archiveValueText = undefined;
      this.persistenceText = undefined;
      this.archiveTooltipText = undefined;
      this.researchSubtitleText = undefined;
      this.upgradeRows = [];
      this.footerStatusObjects = [];
      this.footerDevObjects = [];
    });

    this.render();
  }

  private render(): void {
    if (!this.backgroundLayer || !this.chromeLayer || !this.contentLayer || !this.footerLayer || !this.tooltipLayer) {
      return;
    }

    const { width, height } = this.scale;
    const layout = createScreenLayout(width, height, {
      margin: 20,
      top: 64,
      gap: 14,
      headerHeight: 154,
      footerHeight: 72,
    });
    const signature = this.getLayoutSignature(layout);

    if (!this.isUiBuilt || this.layoutSignature !== signature) {
      this.rebuildUi(layout);
      this.layoutSignature = signature;
      this.isUiBuilt = true;
    }

    this.updateUi(layout);
  }

  private rebuildUi(layout: SetupLayout): void {
    this.researchScroll?.destroy();
    this.researchScroll = undefined;

    this.backgroundLayer?.removeAll(true);
    this.chromeLayer?.removeAll(true);
    this.contentLayer?.removeAll(true);
    this.footerLayer?.removeAll(true);
    this.tooltipLayer?.removeAll(true);

    this.footerStatusObjects = [];
    this.footerDevObjects = [];
    this.upgradeRows = [];
    this.titleText = undefined;
    this.subtitleText = undefined;
    this.seedText = undefined;
    this.runsText = undefined;
    this.bestPlanetText = undefined;
    this.archiveValueText = undefined;
    this.persistenceText = undefined;
    this.archiveTooltipText = undefined;
    this.researchSubtitleText = undefined;

    if (!this.backgroundLayer || !this.chromeLayer || !this.contentLayer || !this.footerLayer || !this.tooltipLayer) {
      return;
    }

    const { width, height } = this.scale;
    const content = insetRect(layout.content, 12);

    makeRectangle(this, 0, 0, width, height, LAB_THEME.background, 1, this.backgroundLayer).setOrigin(0);
    makeRectangle(this, 0, 0, width, 40, 0x0b1a26, 1, this.backgroundLayer).setOrigin(0);

    this.titleText = makeText(
      this,
      24,
      14,
      "PLANETFALL MECHANICS LAB",
      textStyle(13, LAB_THEME.text),
      this.chromeLayer
    );
    this.subtitleText = makeText(
      this,
      24,
      36,
      "Endless seeded planet-hopping roguelike for testing randomness systems.",
      textStyle(10, LAB_THEME.textMuted, "left", width - 48),
      this.chromeLayer
    );

    createPanel(
      this,
      layout.header.x,
      layout.header.y,
      layout.header.width,
      layout.header.height,
      LAB_THEME.panel,
      LAB_THEME.borderSoft,
      this.chromeLayer
    );

    createPanel(
      this,
      layout.header.x + 12,
      layout.header.y + 12,
      210,
      layout.header.height - 24,
      LAB_THEME.panel,
      LAB_THEME.borderSoft,
      this.chromeLayer
    );
    makeText(this, layout.header.x + 24, layout.header.y + 24, "RUN SETUP", textStyle(9, LAB_THEME.text), this.chromeLayer);
    this.seedText = makeText(this, layout.header.x + 24, layout.header.y + 48, "", textStyle(8, LAB_THEME.textMuted), this.chromeLayer);
    this.runsText = makeText(this, layout.header.x + 24, layout.header.y + 66, "", textStyle(8, LAB_THEME.textMuted), this.chromeLayer);
    this.bestPlanetText = makeText(this, layout.header.x + 24, layout.header.y + 84, "", textStyle(8, LAB_THEME.textMuted), this.chromeLayer);

    if (this.textures.exists("archive-bank")) {
      const resourcesX = layout.header.x + 236;
      const resourcesY = layout.header.y + 50;
      const resourcesW = 196;
      const resourcesH = 90;

      createPanel(this, resourcesX, resourcesY, resourcesW, resourcesH, LAB_THEME.panelAlt, LAB_THEME.borderSoft, this.chromeLayer);
      makeText(this, resourcesX + 12, resourcesY + 8, "RESOURCES", textStyle(7, LAB_THEME.textMuted), this.chromeLayer);

      const archiveIcon = makeImage(
        this,
        resourcesX + 22,
        resourcesY + 28,
        "archive-bank",
        this.chromeLayer
      )
        .setScale(0.7)
        .setOrigin(0.5);

      this.archiveValueText = makeText(
        this,
        resourcesX + 36,
        resourcesY + 20,
        "",
        textStyle(9, LAB_THEME.positive),
        this.chromeLayer
      );
      makeText(this, resourcesX + 70, resourcesY + 20, "BANKED", textStyle(7, LAB_THEME.textMuted), this.chromeLayer);
      this.persistenceText = makeText(
        this,
        resourcesX + 12,
        resourcesY + 50,
        "",
        textStyle(7, LAB_THEME.textMuted, "left", resourcesW - 24),
        this.chromeLayer
      );

      const tooltip = attachImageTooltip(this, archiveIcon, this.tooltipLayer, {
        x: resourcesX,
        y: resourcesY + resourcesH + 6,
        width: 260,
        minHeight: 90,
        text: "",
      });
      const tooltipCopy = tooltip.list.find((child): child is Phaser.GameObjects.Text => child instanceof Phaser.GameObjects.Text);
      this.archiveTooltipText = tooltipCopy;
    } else {
      this.archiveValueText = undefined;
      this.persistenceText = undefined;
      this.archiveTooltipText = undefined;
    }

    this.buildPlayerSprite(layout);

    const buttonWidth = 214;
    const buttonX = layout.header.x + layout.header.width - buttonWidth - 16;

    createButton(this, {
      x: buttonX,
      y: layout.header.y + 18,
      width: buttonWidth,
      height: 48,
      label: "START EXPED.",
      detail: "",
      onClick: () => {
        this.lab.startRun();
        this.scene.start("RunScene");
      },
      fill: 0x1d4d6c,
    }, this.chromeLayer);

    createButton(this, {
      x: buttonX,
      y: layout.header.y + 76,
      width: buttonWidth,
      height: 40,
      label: "NEW SEED",
      detail: "",
      onClick: () => this.lab.rerollSeed(),
    }, this.chromeLayer);

    createPanel(
      this,
      layout.content.x,
      layout.content.y,
      layout.content.width,
      layout.content.height,
      LAB_THEME.panel,
      LAB_THEME.borderSoft,
      this.contentLayer
    );
    this.researchScroll = new VerticalScrollViewport(this, content.x, content.y, content.width, content.height, this.contentLayer);
    const researchContent = this.researchScroll.content;
    makeText(this, 4, 6, "RESEARCH TERMINAL", textStyle(13, LAB_THEME.text), researchContent);
    this.researchSubtitleText = makeText(
      this,
      4,
      28,
      "Invest Archive Shards to permanently upgrade your next expedition.",
      textStyle(10, LAB_THEME.textMuted, "left", content.width - 8),
      researchContent
    );

    let upgradeY = 44;
    META_UPGRADES.forEach((upgrade) => {
      createPanel(this, 4, upgradeY, content.width - 8, 48, LAB_THEME.panelAlt, LAB_THEME.borderSoft, researchContent);

      const nameText = makeText(this, 16, upgradeY + 12, "", textStyle(9, LAB_THEME.text), researchContent);
      const descriptionText = makeText(this, 16, upgradeY + 28, upgrade.description, textStyle(8, LAB_THEME.textMuted), researchContent);
      const button = createButton(this, {
        x: content.width - 158,
        y: upgradeY + 8,
        width: 140,
        height: 32,
        label: "",
        onClick: () => this.lab.purchaseMetaUpgrade(upgrade.id),
        fill: 0x1d4d6c,
      }, researchContent);

      this.upgradeRows.push({
        nameText,
        descriptionText,
        button,
        upgradeId: upgrade.id,
      });

      upgradeY += 56;
    });

    this.researchScroll.setContentHeight(upgradeY + 8);

    const footerPanel = createPanel(
      this,
      layout.footer.x,
      layout.footer.y,
      layout.footer.width,
      layout.footer.height,
      LAB_THEME.panelAlt,
      LAB_THEME.borderSoft,
      this.footerLayer
    );
    const footerTitle = makeText(this, layout.footer.x + 16, layout.footer.y + 12, "PRE-FLIGHT STATUS", textStyle(9), this.footerLayer);
    const footerBody = makeText(
      this,
      layout.footer.x + 16,
      layout.footer.y + 36,
      "System checks green. Upgrades applied. Awaiting expedition start.",
      textStyle(8, LAB_THEME.textMuted, "left", layout.footer.width - 32),
      this.footerLayer
    );
    this.footerStatusObjects.push(footerPanel, footerTitle, footerBody);

    const devTitle = makeText(this, layout.footer.x + 16, layout.footer.y + 12, "DEV INFO", textStyle(7, LAB_THEME.textMuted), this.footerLayer);
    this.footerDevObjects.push(devTitle);

    let tagX = layout.footer.x + 80;
    for (const mechanicId of allMechanics.slice(0, 4).map((mechanic) => mechanic.id)) {
      const tag = createTag(this, tagX, layout.footer.y + 10, getMechanicDefinition(mechanicId).shortLabel, LAB_THEME.tag, this.footerLayer);
      this.footerDevObjects.push(tag);
      tagX += 100;
    }
  }

  private updateUi(layout: SetupLayout): void {
    const meta = this.lab.getMeta();
    const persistenceBonus = getSessionPersistenceBonus(meta.archive);
    const seed = this.lab.getSeedPreview();
    const showDevVisualPass = this.lab.isDevOverlayVisible();

    if (this.isUsableText(this.seedText)) {
      this.seedText.setText(`Seed ${seed}`);
    }
    if (this.isUsableText(this.runsText)) {
      this.runsText.setText(`Runs ${meta.completedRuns}`);
    }
    if (this.isUsableText(this.bestPlanetText)) {
      this.bestPlanetText.setText(`Best planet ${meta.bestPlanet}`);
    }
    if (this.isUsableText(this.archiveValueText)) {
      this.archiveValueText.setText(`${meta.archive}`);
    }
    if (this.isUsableText(this.persistenceText)) {
      this.persistenceText.setText(
        `IF PERSISTENCE: +${persistenceBonus.hpBoost} HP / +${persistenceBonus.supplyBoost} SUP`
      );
    }
    if (this.isUsableText(this.archiveTooltipText)) {
      this.archiveTooltipText.setText(
        `Stored from past runs. If Session Persistence is drafted: +${persistenceBonus.hpBoost} max HP and +${persistenceBonus.supplyBoost} supplies at run start.`
      );
    }

    this.upgradeRows.forEach((row) => {
      const upgrade = META_UPGRADES.find((entry) => entry.id === row.upgradeId);
      if (!upgrade) {
        return;
      }

      const currentLevel = getUpgradeLevel(meta.upgrades, upgrade.id);
      const cost = getUpgradeCost(upgrade, currentLevel);
      const isMax = currentLevel >= upgrade.maxLevel;
      const canAfford = cost !== null && canAffordUpgrade(meta.archive, upgrade, currentLevel);
      const buttonLabel = isMax ? "MAXED" : `RESEARCH (${cost})`;

      row.nameText.setText(`${upgrade.name} (LVL ${currentLevel}/${upgrade.maxLevel})`);
      row.descriptionText.setText(upgrade.description);
      row.button
        .setLabelText(buttonLabel)
        .setDisabled(isMax || !canAfford);
    });

    this.footerStatusObjects.forEach((object) => object.setVisible(!showDevVisualPass));
    this.footerDevObjects.forEach((object) => object.setVisible(showDevVisualPass));

    if (this.isUsableText(this.titleText)) {
      this.titleText.setWordWrapWidth(this.scale.width - 48);
    }
    if (this.isUsableText(this.subtitleText)) {
      this.subtitleText.setWordWrapWidth(this.scale.width - 48);
    }
    if (this.isUsableText(this.researchSubtitleText)) {
      const contentWidth = layout.content.width - 24;
      this.researchSubtitleText.setWordWrapWidth(contentWidth - 8);
    }
  }

  private getLayoutSignature(layout: SetupLayout): string {
    return [
      layout.header.x,
      layout.header.y,
      layout.header.width,
      layout.header.height,
      layout.content.x,
      layout.content.y,
      layout.content.width,
      layout.content.height,
      layout.footer.x,
      layout.footer.y,
      layout.footer.width,
      layout.footer.height,
      this.scale.width,
      this.scale.height,
    ].join(":");
  }

  private buildPlayerSprite(layout: SetupLayout): Phaser.GameObjects.Image | null {
    if (!this.chromeLayer || !this.textures.exists("player-idle")) {
      return null;
    }

    const rect = {
      x: this.scale.width / 2 - 58,
      y: layout.header.y + 12,
      width: 180,
      height: layout.header.height - 24,
    };

    const sprite = makeImage(
      this,
      rect.x + rect.width / 2,
      rect.y + rect.height / 2,
      "player-idle",
      this.chromeLayer
    ).setOrigin(0.5);

    const texture = this.textures.get("player-idle").getSourceImage() as { width: number; height: number };
    const scale = Math.min(rect.width / texture.width, rect.height / texture.height);
    sprite.setScale(scale);

    return sprite;
  }
}
