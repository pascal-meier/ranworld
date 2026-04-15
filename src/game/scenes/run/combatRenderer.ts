import type { CombatAction, CombatActionPreview, RunState } from "../../types.js";
import { PhaseView } from "./PhaseView.js";
import { UI_EVENTS } from "../../events.js";
import type { RunRenderContext } from "./shared.js";
import { renderMainPanel } from "./shared.js";
import { createButton, createPanel } from "../../ui/widgets.js";
import { LAB_THEME, textStyle } from "../../ui/theme.js";
import { makeFrameImage, makeImage, makeText } from "../../ui/display.js";
import { UIButton } from "../../ui/objects.js";
import { UICombatActor } from "../../ui/components/CombatActorView.js";
import type { LayoutRect } from "../../ui/layout.js";
import { REROLL_SUPPLY_COST } from "../../core/balance.js";
import { CombatVFX } from "../../vfx/CombatVFX.js";

function getCombatActionDetail(
  action: CombatAction,
  actionPreview: CombatActionPreview | null
): string {
  if (actionPreview) {
    let detail = action.description;

    if (actionPreview.shownHitChance !== null) {
      const breakdownStr = actionPreview.breakdown && actionPreview.breakdown.length > 0
        ? ` (${actionPreview.breakdown.join(" / ")})`
        : "";
      detail += ` [${actionPreview.shownHitChance}%${breakdownStr}]`;
    }

    if (actionPreview.expectedDamage) detail += ` (${actionPreview.expectedDamage} DMG)`;
    if (actionPreview.note) detail += ` (${actionPreview.note})`;
    return detail;
  }

  return action.description;
}

interface CombatLayout {
  titleX: number;
  titleY: number;
  roundX: number;
  roundY: number;
  summaryRect: LayoutRect;
  arenaRect: LayoutRect;
  playerCardX: number;
  enemyCardX: number;
  cardY: number;
  playerSpriteX: number;
  enemySpriteX: number;
  floorY: number;
  rerollX: number;
  rerollY: number;
  actionPanelRect: LayoutRect;
  actionButtons: Array<{ x: number; y: number; width: number; height: number }>;
}

function getCombatLayout(contentInner: LayoutRect): CombatLayout {
  const titleX = contentInner.x + 4;
  const titleY = contentInner.y + 8;
  const roundY = titleY + 18;
  const summaryRect = {
    x: contentInner.x + 4,
    y: roundY + 12,
    width: contentInner.width - 8,
    height: 28,
  };
  const actionPanelGap = 10;
  const actionPanelPadding = 10;
  const actionRowGap = 10;
  const minButtonHeight = 54;
  const maxButtonHeight = 54;
  const actionPanelMinHeight = actionPanelPadding * 2 + actionRowGap + minButtonHeight * 2;
  const actionPanelMaxHeight = actionPanelPadding * 2 + actionRowGap + maxButtonHeight * 2;
  const arenaMinHeight = 84;
  const arenaMaxHeight = 108;
  const bottomY = contentInner.y + contentInner.height;
  const arenaRect = {
    x: contentInner.x + 4,
    y: summaryRect.y + summaryRect.height + 12,
    width: contentInner.width - 8,
    height: Phaser.Math.Clamp(
      bottomY - (summaryRect.y + summaryRect.height + 12) - actionPanelGap - actionPanelMinHeight,
      arenaMinHeight,
      arenaMaxHeight
    ),
  };
  const cardWidth = 210;
  const cardY = arenaRect.y + 8;
  const rerollX = contentInner.x + contentInner.width - 180;
  const rerollY = titleY - 2;
  const actionPanelRect = {
    x: contentInner.x,
    y: arenaRect.y + arenaRect.height + actionPanelGap,
    width: contentInner.width,
    height: Phaser.Math.Clamp(
      bottomY - (arenaRect.y + arenaRect.height + actionPanelGap),
      actionPanelMinHeight,
      actionPanelMaxHeight
    ),
  };
  const actionGap = 12;
  const actionWidth = Math.floor((contentInner.width - 48) / 2);
  const actionHeight = Phaser.Math.Clamp(
    Math.floor((actionPanelRect.height - actionPanelPadding * 2 - actionRowGap) / 2),
    minButtonHeight,
    maxButtonHeight
  );
  const buttonY = actionPanelRect.y + actionPanelPadding;

  return {
    titleX,
    titleY,
    roundX: titleX,
    roundY,
    summaryRect,
    arenaRect,
    playerCardX: arenaRect.x + 8,
    enemyCardX: arenaRect.x + arenaRect.width - cardWidth - 8,
    cardY,
    playerSpriteX: arenaRect.x + arenaRect.width * 0.28,
    enemySpriteX: arenaRect.x + arenaRect.width * 0.72,
    floorY: arenaRect.y + arenaRect.height - 4,
    rerollX,
    rerollY,
    actionPanelRect,
    actionButtons: [
      { x: contentInner.x + 16, y: buttonY, width: actionWidth, height: actionHeight },
      { x: contentInner.x + 16 + actionWidth + actionGap, y: buttonY, width: actionWidth, height: actionHeight },
      { x: contentInner.x + 16, y: buttonY + actionHeight + actionRowGap, width: actionWidth, height: actionHeight },
      { x: contentInner.x + 16 + actionWidth + actionGap, y: buttonY + actionHeight + actionRowGap, width: actionWidth, height: actionHeight },
    ],
  };
}

function getActionIconFrame(action: CombatAction): string | null {
  const actionIconMap: Record<string, string> = {
    strike: "intent-attack",
    guard: "intent-guard",
    focus: "icon-focus",
    calibrate: "icon-archive",
    attack: "intent-attack",
  };

  return actionIconMap[action.id] ?? actionIconMap[action.kind] ?? null;
}

export class CombatPhaseView extends PhaseView {
  private headerContainer!: Phaser.GameObjects.Container;
  private arenaContainer!: Phaser.GameObjects.Container;
  private effectsLayer!: Phaser.GameObjects.Container;
  private optionsLayer!: Phaser.GameObjects.Container;
  private roundText!: Phaser.GameObjects.Text;
  private summaryText!: Phaser.GameObjects.Text;
  private playerView!: UICombatActor;
  private enemyView!: UICombatActor;
  private playerSprite!: Phaser.GameObjects.Image;
  private enemySprite!: Phaser.GameObjects.Image;
  private rerollButton!: UIButton;
  private actionButtons: UIButton[] = [];
  private actionIcons: Phaser.GameObjects.Image[] = [];
  private vfx: CombatVFX;
  private lastCombatSignature?: string;

  constructor(
    scene: Phaser.Scene,
    ctx: RunRenderContext
  ) {
    super(scene, ctx);
    this.vfx = new CombatVFX(scene);
  }

  public build(): void {
    const { scene, contentInner } = this.ctx;
    const localCtx = { ...this.ctx, phaseRoot: this.container };
    const layout = getCombatLayout(contentInner);

    renderMainPanel(localCtx);

    this.headerContainer = new Phaser.GameObjects.Container(scene, 0, 0);
    this.arenaContainer = new Phaser.GameObjects.Container(scene, 0, 0);
    this.effectsLayer = new Phaser.GameObjects.Container(scene, 0, 0);
    this.optionsLayer = new Phaser.GameObjects.Container(scene, 0, 0);
    this.optionsLayer.setDepth(5);
    this.container.add([this.headerContainer, this.arenaContainer, this.effectsLayer, this.optionsLayer]);

    makeText(
      scene,
      layout.titleX,
      layout.titleY,
      "COMBAT ANALYTICS",
      textStyle(13, LAB_THEME.text),
      this.headerContainer
    );
    this.roundText = makeText(
      scene,
      layout.roundX,
      layout.roundY,
      "Round 1",
      textStyle(10, LAB_THEME.textMuted),
      this.headerContainer
    );
    createPanel(
      scene,
      layout.summaryRect.x,
      layout.summaryRect.y,
      layout.summaryRect.width,
      layout.summaryRect.height,
      0x162d3d,
      0x35586d,
      this.headerContainer
    );
    this.summaryText = makeText(
      scene,
      layout.summaryRect.x + 12,
      layout.summaryRect.y + 7,
      "",
      textStyle(8, LAB_THEME.textMuted, "left", layout.summaryRect.width - 24),
      this.headerContainer
    ).setLineSpacing(-2);

    createPanel(
      scene,
      layout.arenaRect.x,
      layout.arenaRect.y,
      layout.arenaRect.width,
      layout.arenaRect.height,
      0x0a1d2a,
      0x35586d,
      this.arenaContainer
    );

    if (scene.textures.exists("arena-floor")) {
      makeImage(
        scene,
        layout.arenaRect.x + layout.arenaRect.width / 2,
        layout.arenaRect.y + layout.arenaRect.height / 2,
        "arena-floor",
        this.arenaContainer
      )
        .setDisplaySize(layout.arenaRect.width - 4, layout.arenaRect.height - 4)
        .setAlpha(0.4)
        .setOrigin(0.5);
    }

    if (scene.textures.exists("prop-console")) {
      const prop = makeImage(scene, layout.arenaRect.x + 45, layout.arenaRect.y + layout.arenaRect.height - 25, "prop-console", this.arenaContainer);
      prop.displayHeight = 70;
      prop.scaleX = prop.scaleY;
      prop.setAlpha(0.6).setOrigin(0.5, 1);
    }

    if (scene.textures.exists("prop-barrier")) {
      const prop = makeImage(scene, layout.arenaRect.x + layout.arenaRect.width - 55, layout.arenaRect.y + layout.arenaRect.height - 20, "prop-barrier", this.arenaContainer);
      prop.displayHeight = 55;
      prop.scaleX = prop.scaleY;
      prop.setAlpha(0.4).setOrigin(0.5, 1);
    }

    this.playerView = new UICombatActor(scene, layout.playerCardX, layout.cardY, 210, layout.arenaRect.height, "YOU", LAB_THEME.accent, true);
    this.enemyView = new UICombatActor(scene, layout.enemyCardX, layout.cardY, 210, layout.arenaRect.height, "ENEMY", LAB_THEME.danger, false);
    this.arenaContainer.add([this.playerView, this.enemyView]);

    this.playerSprite = makeImage(scene, layout.playerSpriteX, layout.floorY, "player-idle", this.arenaContainer).setOrigin(0.5, 1);
    this.enemySprite = makeImage(scene, layout.enemySpriteX, layout.floorY, "enemy-calibration-drone", this.arenaContainer).setOrigin(0.5, 1);

    this.rerollButton = createButton(scene, {
      x: layout.rerollX,
      y: layout.rerollY,
      width: 152,
      height: 26,
      label: `REROLL 0 / ${REROLL_SUPPLY_COST} SUP`,
      detail: "",
      onClick: () => undefined,
      fill: 0x284861,
      border: LAB_THEME.borderSoft,
    }, this.optionsLayer);

    createPanel(
      scene,
      layout.actionPanelRect.x,
      layout.actionPanelRect.y,
      layout.actionPanelRect.width,
      layout.actionPanelRect.height,
      0x1a3342,
      LAB_THEME.borderSoft,
      this.optionsLayer
    );

    this.actionButtons = [];
    this.actionIcons = [];

    for (const rect of layout.actionButtons) {
      const button = createButton(scene, {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        label: "",
        detail: "",
        onClick: () => undefined,
      }, this.optionsLayer);

      this.actionButtons.push(button);

      const icon = makeFrameImage(scene, rect.width - 24, Math.floor(rect.height / 2), "ui-icons", "intent-attack", button)
        .setDisplaySize(20, 20)
        .setOrigin(0.5);
      this.actionIcons.push(icon);
    }
  }

  updateState(state: RunState, actionsEnabled: boolean): void {
    const combat = state.combat!;
    const layout = getCombatLayout(this.ctx.contentInner);
    const summary = combat.lastSummary.length > 0 ? combat.lastSummary[combat.lastSummary.length - 1] : "Waiting for player action...";

    this.roundText.setText(`Round ${combat.round}`);
    this.summaryText.setText(summary);

    this.playerView
      .setPosition(layout.playerCardX, layout.cardY)
      .updateStats(state.player.hp, state.player.maxHp, state.player.guard, state.player.focus, state.player.mitigationCharges);
    this.enemyView
      .setPosition(layout.enemyCardX, layout.cardY)
      .updateStats(combat.enemyHp, combat.enemyMaxHp, 0, 0)
      .updateEnemyReadout(combat.round, combat.enemyAttack);

    this.playerSprite.setPosition(layout.playerSpriteX, layout.floorY);
    this.enemySprite.setPosition(layout.enemySpriteX, layout.floorY);

    let playerKey = "player-idle";
    const lastSummaryText = (combat.lastSummary[combat.lastSummary.length - 1] ?? "").toLowerCase();

    if (lastSummaryText.includes("damage")) {
      playerKey = "player-hit";
    } else if (state.player.hp < state.player.maxHp * 0.25) {
      playerKey = "player-low-hp";
    } else if (combat.lastActionKind === "guard") {
      playerKey = "player-guard";
    } else if (combat.lastActionKind === "focus") {
      playerKey = "player-focus";
    }

    this.playerSprite.setTexture(playerKey);
    this.playerSprite.displayHeight = 110;
    this.playerSprite.scaleX = this.playerSprite.scaleY;

    let enemyKey = "enemy-calibration-drone";
    if (combat.enemyName === "Scrap Hound") {
      enemyKey = "enemy-scrap-hound";
    } else if (combat.enemyName === "Glass Engine") {
      enemyKey = "enemy-glass-engine";
    } else if (combat.enemyName === "Drone Swarm") {
      enemyKey = "enemy-drone-swarm";
    } else if (combat.enemyName === "Landing Drone") {
      enemyKey = "enemy-calibration-drone";
    } else if (combat.enemyName.includes("Heavy Warden") || combat.enemyName.includes("Elite")) {
      enemyKey = "enemy-heavy-warden";
    } else if (combat.enemyRole === "boss") {
      enemyKey = "enemy-warden";
    }

    this.enemySprite.setTexture(enemyKey);
    this.enemySprite.displayHeight = combat.enemyRole === "boss" ? 120 : 95;
    this.enemySprite.scaleX = this.enemySprite.scaleY;

    const currentSignature = combat.lastSummary.join("|");
    if (currentSignature !== this.lastCombatSignature) {
      const lowerSum = lastSummaryText;

      if (lowerSum.includes("damage")) {
        this.scene.sound.play("sfx-hit");
        this.vfx.playHit(layout.playerSpriteX, layout.floorY - 60, false);
        this.playDamageEffect(this.playerSprite);
      } else if (lowerSum.includes("hit for") || lowerSum.includes("critical")) {
        const isCrit = lowerSum.includes("critical");
        this.scene.sound.play(isCrit ? "sfx-crit" : "sfx-hit");
        this.vfx.playHit(layout.enemySpriteX, layout.floorY - 60, isCrit);
        this.playDamageEffect(this.enemySprite);
        this.lungeAttack(this.playerSprite, layout.enemySpriteX);
      } else if (lowerSum.includes("missed")) {
        this.scene.sound.play("sfx-miss");
        const isPlayerMiss = lowerSum.startsWith("you");
        this.vfx.playMiss(isPlayerMiss ? layout.enemySpriteX : layout.playerSpriteX, layout.floorY - 80);
        if (isPlayerMiss) {
          this.lungeAttack(this.playerSprite, layout.enemySpriteX, true);
        }
      } else if (lowerSum.includes("fully blocked") || lowerSum.includes("blocked")) {
        this.scene.sound.play("sfx-block");
        const isPlayerBlock = lowerSum.startsWith("enemy");
        this.vfx.playBlock(isPlayerBlock ? layout.playerSpriteX : layout.enemySpriteX, layout.floorY - 80);
      }
    }
    this.lastCombatSignature = currentSignature;

    this.ensureIdleBobbing();

    const hasReroll = state.activeMechanics.includes("reroll-mechanics");
    const rerollUnavailable =
      !hasReroll ||
      !actionsEnabled ||
      state.player.rerollCharges <= 0 ||
      state.player.supplies < REROLL_SUPPLY_COST;

    this.rerollButton
      .setVisible(hasReroll)
      .setLabelText(`REROLL ${state.player.rerollCharges} / ${REROLL_SUPPLY_COST} SUP`)
      .setClickHandler(() => this.scene.events.emit(UI_EVENTS.REROLL_REQUESTED))
      .setDisabled(rerollUnavailable);

    for (let index = 0; index < this.actionButtons.length; index += 1) {
      const button = this.actionButtons[index];
      const icon = this.actionIcons[index];
      const action = combat.actions[index];

      if (!action) {
        button.setVisible(false);
        icon.setVisible(false);
        continue;
      }

      const preview = combat.previews.find((entry) => entry.actionId === action.id) ?? null;
      const detail = getCombatActionDetail(action, preview);
      const frame = getActionIconFrame(action);

      button
        .setVisible(true)
        .setLabelText(action.label.toUpperCase())
        .setDetailText(detail)
        .setClickHandler(() => this.scene.events.emit(UI_EVENTS.COMBAT_ACTION_RESOLVE, action.id))
        .setDisabled(!actionsEnabled);

      if (frame && this.scene.textures.exists("ui-icons")) {
        icon.setVisible(true);
        icon.setFrame(frame);
      } else {
        icon.setVisible(false);
      }
    }
  }

  private lungeAttack(sprite: Phaser.GameObjects.Image, targetX: number, wasMissed = false): void {
    const originalX = sprite.x;
    const distance = Math.abs(targetX - originalX) * 0.4;
    const direction = targetX > originalX ? 1 : -1;

    this.scene.tweens.add({
      targets: sprite,
      x: originalX + distance * direction,
      duration: 150,
      ease: "Cubic.out",
      yoyo: true,
      hold: wasMissed ? 50 : 0,
    });
  }

  private playDamageEffect(sprite: Phaser.GameObjects.Image): void {
    const originalX = sprite.x;

    sprite.setTint(0xff0000);
    this.scene.time.delayedCall(150, () => sprite.clearTint());

    this.scene.tweens.add({
      targets: sprite,
      x: originalX + 5,
      duration: 40,
      repeat: 3,
      yoyo: true,
      ease: "Sine.easeInOut",
      onComplete: () => sprite.setX(originalX),
    });
  }

  private ensureIdleBobbing(): void {
    const actors = [this.playerSprite, this.enemySprite];

    actors.forEach((actor) => {
      if (!this.scene.tweens.isTweening(actor)) {
        this.scene.tweens.add({
          targets: actor,
          y: "+=4",
          duration: 1800 + Math.random() * 400,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
      }
    });
  }
}
