import { labStore } from "../core/LabStore.js";
import { getMechanicDefinition } from "../mechanics/index.js";
import type { EventChoice, MechanicId, NodeDefinition, RewardChoice, RunState } from "../types.js";
import { LAB_THEME, textStyle } from "../ui/theme.js";
import { createButton, createPanel, createTag } from "../ui/widgets.js";

export class RunScene extends Phaser.Scene {
  private readonly handleChange = () => this.render();

  constructor() {
    super({ key: "RunScene" });
  }

  create(): void {
    labStore.on("changed", this.handleChange);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      labStore.off("changed", this.handleChange);
    });

    this.render();
  }

  private render(): void {
    this.children.removeAll(true);

    const state = labStore.getState();

    if (!state) {
      this.scene.start("SetupScene");
      return;
    }

    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, LAB_THEME.background, 1);
    this.add.rectangle(width / 2, 18, width, 36, 0x0b1a26, 1);

    this.renderHud(state, width);

    if (state.phase === "draft" && state.draft) {
      this.renderDraft(state, width, height);
    } else if (state.phase === "map") {
      this.renderMap(state, width, height);
    } else if (state.phase === "combat" && state.combat) {
      this.renderCombat(state, width, height);
    } else if (state.phase === "event" && state.event) {
      this.renderEvent(state, width, height);
    } else if (state.phase === "reward" && state.reward) {
      this.renderReward(state, width, height);
    } else {
      this.renderRunEnd(state, width, height);
    }

    this.renderLog(state, width, height);
  }

  private renderHud(state: RunState, width: number): void {
    createPanel(this, 16, 12, width - 32, 52);

    this.add
      .text(
        28,
        22,
        `SEED ${state.seed}  DEPTH ${state.depth}/${state.maxDepth}  HP ${state.player.hp}/${state.player.maxHp}  SUP ${state.player.supplies}  FOC ${state.player.focus}  CHG ${state.player.mitigationCharges}`,
        textStyle(9, LAB_THEME.text, "left", width - 56)
      )
      .setOrigin(0);

    const moduleText =
      state.activeMechanics.length > 0
        ? state.activeMechanics.map((id) => getMechanicDefinition(id).shortLabel).join(" / ")
        : "none";

    this.add
      .text(28, 38, `MODULES ${moduleText}`, textStyle(8, LAB_THEME.textMuted, "left", width - 56))
      .setOrigin(0);
  }

  private renderLog(state: RunState, width: number, height: number): void {
    createPanel(this, 16, height - 56, width - 32, 40, LAB_THEME.panelMuted);

    this.add.text(28, height - 46, "RECENT", textStyle(9)).setOrigin(0);

    const recent = state.logs.slice(-2).join("  |  ") || "No log entries yet.";
    this.add
      .text(92, height - 46, recent, textStyle(8, LAB_THEME.textMuted, "left", width - 120))
      .setOrigin(0);
  }

  private renderMainPanel(width: number, height: number, fill = LAB_THEME.panel): void {
    createPanel(this, 16, 76, width - 32, height - 148, fill);
  }

  private renderDraft(state: RunState, width: number, height: number): void {
    const draft = state.draft!;
    this.renderMainPanel(width, height);

    this.add.text(28, 90, draft.title.toUpperCase(), textStyle(12)).setOrigin(0);
    this.add
      .text(28, 108, draft.description, textStyle(9, LAB_THEME.textMuted, "left", width - 56))
      .setOrigin(0);

    let x = 28;
    for (const mechanicId of draft.choices) {
      const mechanic = getMechanicDefinition(mechanicId);
      createButton(this, {
        x,
        y: 142,
        width: 182,
        height: 96,
        label: mechanic.shortLabel.toUpperCase(),
        detail: mechanic.effectText,
        onClick: () => labStore.chooseMechanic(mechanicId),
      });
      x += 190;
    }

    if (draft.canSkip) {
      createButton(this, {
        x: 28,
        y: 248,
        width: 182,
        height: 32,
        label: "SKIP",
        detail: "",
        onClick: () => labStore.chooseMechanic(null),
        fill: 0x284861,
      });
    }

    if (state.activeMechanics.length >= 3) {
      this.add
        .text(
          28,
          286,
          "Choosing a new mechanic rotates out the oldest active one.",
          textStyle(8, LAB_THEME.accent, "left", width - 56)
        )
        .setOrigin(0);
    }
  }

  private renderMap(state: RunState, width: number, height: number): void {
    this.renderMainPanel(width, height);

    this.add.text(28, 90, "NODE MAP", textStyle(12)).setOrigin(0);
    this.add
      .text(28, 108, "Pick one node from the active column.", textStyle(9, LAB_THEME.textMuted))
      .setOrigin(0);

    const graphics = this.add.graphics();
    const startX = 104;
    const startY = 172;
    const columnGap = 126;
    const laneGap = 48;

    for (let column = 0; column < state.map.length - 1; column += 1) {
      for (const node of state.map[column]) {
        const nextNodes = state.map[column + 1];
        for (const nextNode of nextNodes) {
          graphics.lineStyle(2, 0x31596a, 1);
          graphics.beginPath();
          graphics.moveTo(startX + column * columnGap, startY + node.lane * laneGap);
          graphics.lineTo(startX + (column + 1) * columnGap, startY + nextNode.lane * laneGap);
          graphics.strokePath();
        }
      }
    }

    for (const column of state.map) {
      for (const node of column) {
        this.renderNode(node, state, startX + node.column * columnGap, startY + node.lane * laneGap);
      }
    }
  }

  private renderNode(node: NodeDefinition, state: RunState, x: number, y: number): void {
    const selectable = node.column === state.currentColumn;
    const cleared = node.cleared || node.column < state.currentColumn;

    const circle = this.add.circle(
      x,
      y,
      28,
      cleared ? 0x254a44 : selectable ? 0x1d4d6c : 0x152636,
      0.35
    );

    if (selectable && !cleared) {
      circle.setInteractive({ useHandCursor: true });
      circle.on("pointerdown", () => labStore.chooseNode(node.id));
    }

    if (this.textures.exists("node-base")) {
      const base = this.add.image(x, y, "node-base").setDisplaySize(50, 50);

      if (selectable && !cleared) {
        base.setInteractive({ useHandCursor: true });
        base.on("pointerdown", () => labStore.chooseNode(node.id));
      }

      if (cleared) {
        base.setAlpha(0.65);
      }
    }

    const symbolKey = this.getNodeSymbolKey(node.kind);

    if (symbolKey && this.textures.exists(symbolKey)) {
      const symbol = this.add.image(x, y, symbolKey).setDisplaySize(22, 22);
      if (cleared) {
        symbol.setAlpha(0.65);
      }
    }

    const labelY = node.lane === 0 ? y - 52 : y + 34;
    const labelOriginY = node.lane === 0 ? 1 : 0;

    this.add
      .text(x, labelY, node.title, textStyle(8, LAB_THEME.textMuted, "center", 74))
      .setOrigin(0.5, labelOriginY);
  }

  private getNodeSymbolKey(kind: NodeDefinition["kind"]): string | null {
    if (kind === "combat") {
      return "node-combat-symbol";
    }

    if (kind === "event") {
      return "node-event-symbol";
    }

    if (kind === "reward") {
      return "node-reward-symbol";
    }

    return null;
  }

  private renderCombat(state: RunState, width: number, height: number): void {
    const combat = state.combat!;
    this.renderMainPanel(width, height);

    this.add.text(28, 90, combat.enemyName.toUpperCase(), textStyle(12)).setOrigin(0);
    this.add
      .text(
        28,
        108,
        `ROUND ${combat.round}  ENEMY HP ${combat.enemyHp}/${combat.enemyMaxHp}  INTENT ${combat.enemyIntent}`,
        textStyle(8, LAB_THEME.textMuted, "left", width - 56)
      )
      .setOrigin(0);

    createTag(this, 28, 124, combat.environmentName, 0x2e5a46);
    this.add
      .text(164, 130, combat.environmentDescription, textStyle(8, LAB_THEME.textMuted, "left", width - 190))
      .setOrigin(0);

    createPanel(this, 28, 154, width - 56, 60, 0x0a1d2a, 0x35586d);

    if (this.textures.exists("player-idle")) {
      this.add.image(132, 184, "player-idle").setScale(1.9).setOrigin(0.5);
    }

    if (this.textures.exists("enemy-calibration-drone")) {
      this.add.image(width - 124, 184, "enemy-calibration-drone").setScale(1.62).setOrigin(0.5);
    }

    const actionPositions = [
      { x: 28, y: 220 },
      { x: 308, y: 220 },
      { x: 28, y: 262 },
      { x: 308, y: 262 },
    ];

    combat.actions.forEach((action, index) => {
      const preview = combat.previews.find((entry) => entry.actionId === action.id);
      const detail = preview?.shownHitChance !== null && preview?.actualHitChance !== null
        ? `${preview?.shownHitChance}% / ${preview?.actualHitChance}%`
        : action.description;

      const position = actionPositions[index] ?? actionPositions[actionPositions.length - 1];

      createButton(this, {
        x: position.x,
        y: position.y,
        width: 248,
        height: 34,
        label: action.label.toUpperCase(),
        detail: "",
        onClick: () => labStore.resolveCombatAction(action.id),
      });
    });
  }

  private renderEvent(state: RunState, width: number, height: number): void {
    const event = state.event!;
    this.renderMainPanel(width, height);

    createPanel(this, width - 132, 98, 88, 96, LAB_THEME.panelAlt);

    this.add.text(28, 90, event.title.toUpperCase(), textStyle(12)).setOrigin(0);
    this.add
      .text(28, 108, event.description, textStyle(9, LAB_THEME.textMuted, "left", width - 176))
      .setOrigin(0);

    if (this.textures.exists("event-terminal")) {
      this.add.image(width - 88, 146, "event-terminal").setScale(0.74).setOrigin(0.5);
    }

    createPanel(this, 28, 198, width - 56, 86, LAB_THEME.panelAlt);

    let y = 208;
    for (const option of event.options) {
      this.renderEventOption(option, 40, y, width - 80);
      y += 40;
    }
  }

  private renderEventOption(option: EventChoice, x: number, y: number, width: number): void {
    const lines = [option.description];

    if (option.shownChance !== undefined || option.actualChance !== undefined) {
      lines.push(
        `${option.shownChance ?? option.actualChance}% / ${option.actualChance ?? option.shownChance}%`
      );
    }

    createButton(this, {
      x,
      y,
      width,
      height: 34,
      label: option.label.toUpperCase(),
      detail: "",
      onClick: () => labStore.resolveEventChoice(option.id),
    });
  }

  private renderReward(state: RunState, width: number, height: number): void {
    const reward = state.reward!;
    this.renderMainPanel(width, height);

    createPanel(this, width - 132, 98, 88, 96, LAB_THEME.panelAlt);
    createPanel(this, 28, 138, width - 176, 52, LAB_THEME.panelAlt);

    this.add.text(28, 90, reward.title.toUpperCase(), textStyle(12)).setOrigin(0);
    this.add
      .text(28, 108, reward.description, textStyle(9, LAB_THEME.textMuted, "left", width - 176))
      .setOrigin(0);

    this.renderActiveMechanicEffects(state, 40, 148, width - 196, 3);

    if (this.textures.exists("reward-cache-sheet")) {
      this.add
        .image(width - 88, 146, "reward-cache-sheet")
        .setCrop(0, 0, 128, 128)
        .setDisplaySize(56, 56)
        .setOrigin(0.5);
    }

    createPanel(this, 28, 198, width - 56, 76, LAB_THEME.panelAlt);

    let x = 28;
    for (const choice of reward.choices) {
      this.renderRewardChoice(choice, x, 208, 180);
      x += 188;
    }
  }

  private renderRewardChoice(choice: RewardChoice, x: number, y: number, width: number): void {
    createButton(this, {
      x,
      y,
      width,
      height: 48,
      label: choice.label.toUpperCase(),
      detail: "",
      onClick: () => labStore.chooseReward(choice.id),
    });
  }

  private renderActiveMechanicEffects(
    state: RunState,
    x: number,
    y: number,
    width: number,
    maxLines: number
  ): void {
    if (state.activeMechanics.length === 0) {
      this.add.text(x, y, "No active modules.", textStyle(8, LAB_THEME.textMuted, "left", width)).setOrigin(0);
      return;
    }

    const lines = state.activeMechanics
      .slice(0, maxLines)
      .map((id) => {
        const mechanic = getMechanicDefinition(id);
        return `${mechanic.shortLabel}: ${mechanic.effectText}`;
      });

    this.add.text(x, y, lines.join("\n"), textStyle(7, LAB_THEME.textMuted, "left", width)).setOrigin(0);
  }

  private renderRunEnd(state: RunState, width: number, height: number): void {
    this.renderMainPanel(width, height);

    this.add
      .text(
        28,
        90,
        state.victory ? "RUN COMPLETE" : "RUN FAILED",
        textStyle(14, state.victory ? LAB_THEME.positive : LAB_THEME.danger)
      )
      .setOrigin(0);

    this.add
      .text(
        28,
        116,
        `Depth ${state.depth}/${state.maxDepth}\nArchive gained ${state.player.archiveGain}${state.victory ? " + bonus 1" : ""}\nMeta archive ${labStore.getMeta().archive}`,
        textStyle(9, LAB_THEME.text, "left", width - 56)
      )
      .setOrigin(0);

    let x = 28;
    for (const mechanicId of state.activeMechanics as MechanicId[]) {
      createTag(this, x, 178, getMechanicDefinition(mechanicId).shortLabel, 0x284861);
      x += 138;
    }

    createButton(this, {
      x: 28,
      y: 228,
      width: 180,
      height: 48,
      label: "REPLAY SAME",
      detail: "",
      onClick: () => {
        labStore.returnToSetup("same");
        this.scene.start("SetupScene");
      },
      fill: 0x1d4d6c,
    });

    createButton(this, {
      x: 220,
      y: 228,
      width: 180,
      height: 48,
      label: "NEW SEED",
      detail: "",
      onClick: () => {
        labStore.returnToSetup("new");
        this.scene.start("SetupScene");
      },
    });
  }
}
