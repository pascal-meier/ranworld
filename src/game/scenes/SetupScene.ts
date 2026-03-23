import { allMechanics, getMechanicDefinition } from "../mechanics/index.js";
import { getSessionPersistenceBonus } from "../mechanics/sessionPersistence.js";
import { LAB_THEME, textStyle } from "../ui/theme.js";
import { createButton, createPanel, createTag } from "../ui/widgets.js";
import { createScreenLayout, insetRect } from "../ui/layout.js";
import { createInfoCard, renderFittedSprite, renderSectionHeader } from "../ui/components.js";
import { makeImage, makeRectangle, makeText } from "../ui/display.js";
import { attachImageTooltip } from "../ui/tooltip.js";
import { BaseScene } from "./BaseScene.js";

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

    if (showDevVisualPass) {
      createPanel(this, layout.content.x, layout.content.y, layout.content.width, layout.content.height, LAB_THEME.panelMuted, LAB_THEME.borderSoft, this.contentLayer);
      renderSectionHeader(this, content.x + 4, content.y + 6, "DEV PREVIEW", undefined, undefined, this.contentLayer);

      createPanel(this, content.x + 4, content.y + 38, content.width - 8, 74, LAB_THEME.panel, LAB_THEME.borderSoft, this.contentLayer);
      createPanel(this, content.x + 4, content.y + 118, content.width - 8, content.height - 126, LAB_THEME.panel, LAB_THEME.borderSoft, this.contentLayer);
      makeText(this, content.x + 20, content.y + 54, "ASSET STRIP", textStyle(10), this.contentLayer);
      makeText(this, content.x + 20, content.y + 134, "IMPLEMENTED MECHANICS", textStyle(10), this.contentLayer);

      const enemySprite = renderFittedSprite(this, "enemy-calibration-drone", {
        x: content.x + 260,
        y: content.y + 44,
        width: 120,
        height: 58,
      }, 1, this.contentLayer);
      const eventSprite = renderFittedSprite(this, "event-terminal", {
        x: content.x + 386,
        y: content.y + 44,
        width: 96,
        height: 58,
      }, 1, this.contentLayer);

      if (this.textures.exists("reward-cache-sheet")) {
        makeImage(this, content.x + 506, content.y + 74, "reward-cache-sheet", this.contentLayer)
          .setCrop(0, 0, 128, 128)
          .setDisplaySize(28, 28)
          .setOrigin(0.5);
      }

      let x = content.x + 16;
      let y = content.y + 154;

      for (const mechanicId of allMechanics.map((mechanic) => mechanic.id)) {
        createTag(this, x, y, getMechanicDefinition(mechanicId).shortLabel, LAB_THEME.tag, this.contentLayer);
        x += 112;

        if (x > content.x + content.width - 132) {
          x = content.x + 16;
          y += 24;
        }
      }
    } else {
      createPanel(this, layout.footer.x, layout.footer.y, layout.footer.width, layout.footer.height, LAB_THEME.panelAlt, LAB_THEME.borderSoft, this.footerLayer);
      makeText(this, layout.footer.x + 16, layout.footer.y + 12, "ACTIVE UPGRADES", textStyle(9), this.footerLayer);
      makeText(
        this,
        layout.footer.x + 16,
        layout.footer.y + 36,
        "No active upgrades yet. Starter mechanics will appear here once the run begins.",
        textStyle(8, LAB_THEME.textMuted, "left", layout.footer.width - 32),
        this.footerLayer
      );
    }
  }
}
