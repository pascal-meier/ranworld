import { allMechanics, getMechanicDefinition } from "../mechanics/index.js";
import { getSessionPersistenceBonus } from "../mechanics/sessionPersistence.js";
import { LAB_THEME, textStyle } from "../ui/theme.js";
import { createButton, createPanel, createTag } from "../ui/widgets.js";
import { createScreenLayout, insetRect } from "../ui/layout.js";
import { createInfoCard, renderFittedSprite, renderSectionHeader } from "../ui/components.js";
import { makeImage, makeRectangle, makeText } from "../ui/display.js";
import { attachImageTooltip } from "../ui/tooltip.js";
import { BaseScene } from "./BaseScene.js";
import { META_UPGRADES, getUpgradeLevel, canAffordUpgrade, getUpgradeCost } from "../core/metaUpgrades.js";

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
    });

    this.render();
  }

  private render(): void {
    this.backgroundLayer?.removeAll(true);
    this.chromeLayer?.removeAll(true);
    this.contentLayer?.removeAll(true);
    this.footerLayer?.removeAll(true);
    this.tooltipLayer?.removeAll(true);

    const { width, height } = this.scale;
    const layout = createScreenLayout(width, height, {
      margin: 20,
      top: 64,
      gap: 14,
      headerHeight: 154,
      footerHeight: 62,
    });
    const content = insetRect(layout.content, 12);
    const meta = this.lab.getMeta();
    const persistenceBonus = getSessionPersistenceBonus(meta.archive);
    const seed = this.lab.getSeedPreview();
    const showDevVisualPass = this.lab.isDevOverlayVisible();

    if (!this.backgroundLayer || !this.chromeLayer || !this.contentLayer || !this.footerLayer || !this.tooltipLayer) {
      return;
    }

    makeRectangle(this, 0, 0, width, height, LAB_THEME.background, 1, this.backgroundLayer).setOrigin(0);
    makeRectangle(this, 0, 0, width, 40, 0x0b1a26, 1, this.backgroundLayer).setOrigin(0);
    renderSectionHeader(
      this,
      24,
      14,
      "PLANETFALL MECHANICS LAB",
      "Endless seeded planet-hopping roguelike for testing randomness systems.",
      width - 48,
      this.chromeLayer
    );

    createPanel(this, layout.header.x, layout.header.y, layout.header.width, layout.header.height, LAB_THEME.panel, LAB_THEME.borderSoft, this.chromeLayer);
    createInfoCard(
      this,
      {
        x: layout.header.x + 12,
        y: layout.header.y + 12,
        width: 210,
        height: layout.header.height - 24,
      },
      "RUN SETUP",
      [`Seed ${seed}`, `Runs ${meta.completedRuns}`, `Best planet ${meta.bestPlanet}`],
      LAB_THEME.text,
      LAB_THEME.panel,
      this.chromeLayer
    );
    if (this.textures.exists("archive-bank")) {
      const resourcesX = layout.header.x + 236;
      const resourcesY = layout.header.y + 88;
      const resourcesW = 196;
      const resourcesH = 58;
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
      makeText(
        this,
        resourcesX + 36,
        resourcesY + 20,
        `${meta.archive}`,
        textStyle(9, LAB_THEME.positive),
        this.chromeLayer
      );
      makeText(this, resourcesX + 70, resourcesY + 20, "BANKED", textStyle(7, LAB_THEME.textMuted), this.chromeLayer);
      makeText(
        this,
        resourcesX + 12,
        resourcesY + 38,
        `IF PERSISTENCE: +${persistenceBonus.hpBoost} HP / +${persistenceBonus.supplyBoost} SUP`,
        textStyle(7, LAB_THEME.textMuted, "left", resourcesW - 24),
        this.chromeLayer
      );
      attachImageTooltip(this, archiveIcon, this.tooltipLayer, {
        x: resourcesX,
        y: resourcesY + resourcesH + 6,
        width: 214,
        text: `Stored from past runs. If Session Persistence is drafted: +${persistenceBonus.hpBoost} max HP and +${persistenceBonus.supplyBoost} supplies at run start.`,
      });
    }

    const playerSprite = renderFittedSprite(this, "player-idle", {
      x: width / 2 - 58,
      y: layout.header.y + 12,
      width: 180,
      height: layout.header.height - 24,
    }, 1, this.chromeLayer);

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

    createPanel(this, layout.content.x, layout.content.y, layout.content.width, layout.content.height, LAB_THEME.panel, LAB_THEME.borderSoft, this.contentLayer);
    renderSectionHeader(this, content.x + 4, content.y + 6, "RESEARCH TERMINAL", "Invest Archive Shards to permanently upgrade your next expedition.", undefined, this.contentLayer);

    let upgradeY = content.y + 44;
    META_UPGRADES.forEach((upgrade) => {
      const currentLevel = getUpgradeLevel(meta.upgrades, upgrade.id);
      const cost = getUpgradeCost(upgrade, currentLevel);
      const isMax = currentLevel >= upgrade.maxLevel;
      const canAfford = cost !== null && canAffordUpgrade(meta.archive, upgrade, currentLevel);

      createPanel(this, content.x + 4, upgradeY, content.width - 8, 48, LAB_THEME.panelAlt, LAB_THEME.borderSoft, this.contentLayer);
      
      makeText(this, content.x + 16, upgradeY + 12, `${upgrade.name} (LVL ${currentLevel}/${upgrade.maxLevel})`, textStyle(9, LAB_THEME.text), this.contentLayer);
      makeText(this, content.x + 16, upgradeY + 28, upgrade.description, textStyle(8, LAB_THEME.textMuted), this.contentLayer);

      const btnLabel = isMax ? "MAXED" : `RESEARCH (${cost})`;
      createButton(this, {
        x: content.x + content.width - 150,
        y: upgradeY + 8,
        width: 140,
        height: 32,
        label: btnLabel,
        disabled: isMax || !canAfford,
        onClick: () => this.lab.purchaseMetaUpgrade(upgrade.id),
        fill: canAfford ? 0x1d4d6c : LAB_THEME.panelMuted
      }, this.contentLayer);

      upgradeY += 56;
    });

    if (showDevVisualPass) {
      // Small dev strip at bottom
      makeText(this, layout.footer.x + 16, layout.footer.y + 12, "DEV INFO", textStyle(7, LAB_THEME.textMuted), this.footerLayer);
      let x = layout.footer.x + 80;
      for (const mechanicId of allMechanics.slice(0, 4).map((m) => m.id)) {
        createTag(this, x, layout.footer.y + 10, getMechanicDefinition(mechanicId).shortLabel, LAB_THEME.tag, this.footerLayer);
        x += 100;
      }
    } else {
      createPanel(this, layout.footer.x, layout.footer.y, layout.footer.width, layout.footer.height, LAB_THEME.panelAlt, LAB_THEME.borderSoft, this.footerLayer);
      makeText(this, layout.footer.x + 16, layout.footer.y + 12, "PRE-FLIGHT STATUS", textStyle(9), this.footerLayer);
      makeText(
        this,
        layout.footer.x + 16,
        layout.footer.y + 36,
        "System checks green. Upgrades applied. Awaiting expedition start.",
        textStyle(8, LAB_THEME.textMuted, "left", layout.footer.width - 32),
        this.footerLayer
      );
    }
  }
}
