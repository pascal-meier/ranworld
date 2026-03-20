import { labStore } from "../core/LabStore.js";
import { getMechanicDefinition } from "../mechanics/index.js";
import { LAB_THEME, textStyle } from "../ui/theme.js";
import { createButton, createPanel, createTag } from "../ui/widgets.js";

export class SetupScene extends Phaser.Scene {
  private readonly handleChange = () => this.render();

  constructor() {
    super({ key: "SetupScene" });
  }

  create(): void {
    labStore.on("changed", this.handleChange);

    this.input.keyboard?.on("keydown-ENTER", () => {
      labStore.startRun();
      this.scene.start("RunScene");
    });
    this.input.keyboard?.on("keydown-R", () => labStore.rerollSeed());

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      labStore.off("changed", this.handleChange);
    });

    this.render();
  }

  private render(): void {
    this.children.removeAll(true);

    const { width, height } = this.scale;
    const meta = labStore.getMeta();
    const seed = labStore.getSeedPreview();

    this.add.rectangle(width / 2, height / 2, width, height, LAB_THEME.background, 1);
    this.add.rectangle(width / 2, 18, width, 36, 0x0b1a26, 1);

    this.add.text(18, 10, "RANDOMNESS MECHANICS LAB", textStyle(13)).setOrigin(0);
    this.add
      .text(
        18,
        26,
        "Seeded prototype for testing randomness systems.",
        textStyle(9, LAB_THEME.textMuted, "left", 360)
      )
      .setOrigin(0);

    createPanel(this, 16, 52, width - 32, 102);
    this.add.text(28, 66, "RUN SETUP", textStyle(11)).setOrigin(0);
    this.add
      .text(
        28,
        88,
        `Seed ${seed}\nArchive ${meta.archive}\nRuns ${meta.completedRuns}\nBest ${meta.bestDepth}/4`,
        textStyle(9, LAB_THEME.text, "left", 120)
      )
      .setOrigin(0);

    if (this.textures.exists("player-idle")) {
      this.add.image(252, 108, "player-idle").setScale(2.45).setOrigin(0.5);
    }

    createButton(this, {
      x: width - 190,
      y: 66,
      width: 162,
      height: 40,
      label: "START RUN",
      detail: "",
      onClick: () => {
        labStore.startRun();
        this.scene.start("RunScene");
      },
      fill: 0x1d4d6c,
    });

    createButton(this, {
      x: width - 190,
      y: 112,
      width: 162,
      height: 32,
      label: "REROLL",
      detail: "",
      onClick: () => labStore.rerollSeed(),
    });

    createPanel(this, 16, 168, width - 32, height - 184, LAB_THEME.panelMuted);
    this.add.text(28, 182, "VISUAL PASS", textStyle(11)).setOrigin(0);

    createPanel(this, 28, 202, width - 56, 50, LAB_THEME.panel);
    createPanel(this, 28, 258, width - 56, 80, LAB_THEME.panel);

    if (this.textures.exists("enemy-calibration-drone")) {
      this.add.image(306, 226, "enemy-calibration-drone").setScale(1.42).setOrigin(0.5);
    }

    if (this.textures.exists("event-terminal")) {
      this.add.image(400, 226, "event-terminal").setScale(0.66).setOrigin(0.5);
    }

    if (this.textures.exists("reward-cache-sheet")) {
      this.add
        .image(492, 226, "reward-cache-sheet")
        .setCrop(0, 0, 128, 128)
        .setDisplaySize(24, 24)
        .setOrigin(0.5);
    }

    this.add.text(40, 216, "ASSET STRIP", textStyle(9)).setOrigin(0);
    this.add.text(40, 272, "MVP MODULES", textStyle(9)).setOrigin(0);

    const mechanicIds = [
      "input-randomness",
      "output-randomness",
      "environmental-randomness",
      "mitigation-agency",
      "biased-expectations",
      "session-persistence",
      "layered-reward-structures",
      "soft-failure-compensation",
    ] as const;

    let x = 40;
    let y = 288;

    for (const mechanicId of mechanicIds) {
      createTag(this, x, y, getMechanicDefinition(mechanicId).shortLabel);
      x += 108;

      if (x > width - 120) {
        x = 40;
        y += 24;
      }
    }
  }
}
