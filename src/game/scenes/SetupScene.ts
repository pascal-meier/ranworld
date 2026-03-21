import { labStore } from "../core/LabStore.js";
import { allMechanics, getMechanicDefinition } from "../mechanics/index.js";
import { LAB_THEME, textStyle } from "../ui/theme.js";
import { createButton, createPanel, createTag } from "../ui/widgets.js";
import { createScreenLayout, insetRect } from "../ui/layout.js";
import { createInfoCard, renderFittedSprite, renderSectionHeader } from "../ui/components.js";

export class SetupScene extends Phaser.Scene {
  private readonly handleChange = () => this.render();
  private readonly handleResize = () => this.render();
  private backgroundLayer?: Phaser.GameObjects.Container;
  private chromeLayer?: Phaser.GameObjects.Container;
  private contentLayer?: Phaser.GameObjects.Container;
  private footerLayer?: Phaser.GameObjects.Container;

  constructor() {
    super({ key: "SetupScene" });
  }

  create(): void {
    this.backgroundLayer = this.add.container(0, 0);
    this.chromeLayer = this.add.container(0, 0);
    this.contentLayer = this.add.container(0, 0);
    this.footerLayer = this.add.container(0, 0);

    labStore.on("changed", this.handleChange);
    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize);

    this.input.keyboard?.on("keydown-ENTER", () => {
      labStore.startRun();
      this.scene.start("RunScene");
    });
    this.input.keyboard?.on("keydown-R", () => labStore.rerollSeed());

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      labStore.off("changed", this.handleChange);
      this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize);
    });

    this.render();
  }

  private render(): void {
    this.backgroundLayer?.removeAll(true);
    this.chromeLayer?.removeAll(true);
    this.contentLayer?.removeAll(true);
    this.footerLayer?.removeAll(true);

    const { width, height } = this.scale;
    const layout = createScreenLayout(width, height, {
      margin: 20,
      top: 64,
      gap: 14,
      headerHeight: 154,
      footerHeight: 62,
    });
    const content = insetRect(layout.content, 12);
    const meta = labStore.getMeta();
    const seed = labStore.getSeedPreview();
    const showDevVisualPass = labStore.isDevOverlayVisible();

    this.backgroundLayer?.add(this.add.rectangle(width / 2, height / 2, width, height, LAB_THEME.background, 1));
    this.backgroundLayer?.add(this.add.rectangle(width / 2, 20, width, 40, 0x0b1a26, 1));
    this.chromeLayer?.add(
      renderSectionHeader(
      this,
      24,
      14,
      "PLANETFALL MECHANICS LAB",
      "Endless seeded planet-hopping roguelike for testing randomness systems.",
      width - 48
      )
    );

    this.chromeLayer?.add(createPanel(this, layout.header.x, layout.header.y, layout.header.width, layout.header.height));
    this.chromeLayer?.add(
      createInfoCard(
      this,
      {
        x: layout.header.x + 12,
        y: layout.header.y + 12,
        width: 210,
        height: layout.header.height - 24,
      },
      "RUN SETUP",
      [`Seed ${seed}`, `Archive ${meta.archive}`, `Runs ${meta.completedRuns}`, `Best planet ${meta.bestPlanet}`],
      LAB_THEME.text,
      LAB_THEME.panel
      )
    );

    const playerSprite = renderFittedSprite(this, "player-idle", {
      x: width / 2 - 58,
      y: layout.header.y + 12,
      width: 180,
      height: layout.header.height - 24,
    });
    if (playerSprite) {
      this.chromeLayer?.add(playerSprite);
    }

    const buttonWidth = 214;
    const buttonX = layout.header.x + layout.header.width - buttonWidth - 16;

    this.chromeLayer?.add(createButton(this, {
      x: buttonX,
      y: layout.header.y + 18,
      width: buttonWidth,
      height: 48,
      label: "START EXPED.",
      detail: "",
      onClick: () => {
        labStore.startRun();
        this.scene.start("RunScene");
      },
      fill: 0x1d4d6c,
    }));

    this.chromeLayer?.add(createButton(this, {
      x: buttonX,
      y: layout.header.y + 76,
      width: buttonWidth,
      height: 40,
      label: "NEW SEED",
      detail: "",
      onClick: () => labStore.rerollSeed(),
    }));

    if (showDevVisualPass) {
      this.contentLayer?.add(
        createPanel(this, layout.content.x, layout.content.y, layout.content.width, layout.content.height, LAB_THEME.panelMuted)
      );
      this.contentLayer?.add(renderSectionHeader(this, content.x + 4, content.y + 6, "DEV PREVIEW"));

      this.contentLayer?.add(createPanel(this, content.x + 4, content.y + 38, content.width - 8, 74, LAB_THEME.panel));
      this.contentLayer?.add(createPanel(this, content.x + 4, content.y + 118, content.width - 8, content.height - 126, LAB_THEME.panel));
      this.contentLayer?.add(this.add.text(content.x + 20, content.y + 54, "ASSET STRIP", textStyle(10)).setOrigin(0));
      this.contentLayer?.add(this.add.text(content.x + 20, content.y + 134, "IMPLEMENTED MECHANICS", textStyle(10)).setOrigin(0));

      const enemySprite = renderFittedSprite(this, "enemy-calibration-drone", {
        x: content.x + 260,
        y: content.y + 44,
        width: 120,
        height: 58,
      });
      if (enemySprite) {
        this.contentLayer?.add(enemySprite);
      }
      const eventSprite = renderFittedSprite(this, "event-terminal", {
        x: content.x + 386,
        y: content.y + 44,
        width: 96,
        height: 58,
      });
      if (eventSprite) {
        this.contentLayer?.add(eventSprite);
      }

      if (this.textures.exists("reward-cache-sheet")) {
        this.contentLayer?.add(this.add
          .image(content.x + 506, content.y + 74, "reward-cache-sheet")
          .setCrop(0, 0, 128, 128)
          .setDisplaySize(28, 28)
          .setOrigin(0.5));
      }

      let x = content.x + 16;
      let y = content.y + 154;

      for (const mechanicId of allMechanics.map((mechanic) => mechanic.id)) {
        this.contentLayer?.add(createTag(this, x, y, getMechanicDefinition(mechanicId).shortLabel));
        x += 112;

        if (x > content.x + content.width - 132) {
          x = content.x + 16;
          y += 24;
        }
      }
    } else {
      this.footerLayer?.add(
        createPanel(this, layout.footer.x, layout.footer.y, layout.footer.width, layout.footer.height, LAB_THEME.panelAlt)
      );
      this.footerLayer?.add(this.add.text(layout.footer.x + 16, layout.footer.y + 12, "ACTIVE UPGRADES", textStyle(9)).setOrigin(0));
      this.footerLayer?.add(
        this.add.text(
          layout.footer.x + 16,
          layout.footer.y + 36,
          "No active upgrades yet. Starter mechanics will appear here once the run begins.",
          textStyle(8, LAB_THEME.textMuted, "left", layout.footer.width - 32)
        )
        .setOrigin(0)
      );
    }
  }
}
