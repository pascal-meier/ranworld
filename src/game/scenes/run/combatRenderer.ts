import type { CombatAction, CombatActionPreview, RunState } from "../../types.js";
import { PhaseView } from "./PhaseView.js";
import { UI_EVENTS } from "../../events.js";
import { renderMainPanel, renderRerollButton, type RunRenderContext } from "./shared.js";
import { renderSectionHeader } from "../../ui/components.js";
import { createButton, createPanel, createTag } from "../../ui/widgets.js";
import { LAB_THEME, textStyle } from "../../ui/theme.js";
import { makeFrameImage, makeImage, makeText } from "../../ui/display.js";
import type { UICombatActor } from "../../ui/components/CombatActorView.js";
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
    
    if (actionPreview.expectedDamage) detail += ` [${actionPreview.expectedDamage} DMG]`;
    if (actionPreview.note) detail += ` (${actionPreview.note})`;
    return detail;
  }
  return action.description;
}

export class CombatPhaseView extends PhaseView {
  private headerContainer!: Phaser.GameObjects.Container;
  private arenaContainer!: Phaser.GameObjects.Container;
  private effectsLayer!: Phaser.GameObjects.Container;
  private optionsLayer!: Phaser.GameObjects.Container;
  private playerView!: UICombatActor;
  private enemyView!: UICombatActor;
  private playerSprite!: Phaser.GameObjects.Image;
  private enemySprite!: Phaser.GameObjects.Image;
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
    const { scene, width, contentInner } = this.ctx;
    const localCtx = { ...this.ctx, phaseRoot: this.container };
    
    renderMainPanel(localCtx);

    const arenaX = contentInner.x + 4;
    const arenaY = contentInner.y + 72;
    const arenaW = contentInner.width - 8;
    const arenaH = 110;
    const statW = 210;
    const playerStatX = arenaX + 12;
    const enemyStatX = arenaX + arenaW - statW - 12;
    const statY = arenaY + 8;
    const topInfoY = contentInner.y + 44;

    // Static Arena Panels
    createPanel(scene, arenaX, arenaY, arenaW, arenaH, 0x0a1d2a, 0x35586d, this.container);
    
    if (scene.textures.exists("arena-floor")) {
      makeImage(scene, arenaX + arenaW / 2, arenaY + arenaH / 2, "arena-floor", this.container)
        .setDisplaySize(arenaW - 4, arenaH - 4)
        .setAlpha(0.4)
        .setOrigin(0.5);
    }

    if (scene.textures.exists("prop-console")) {
      const prop = makeImage(scene, arenaX + 45, arenaY + arenaH - 25, "prop-console", this.container);
      prop.displayHeight = 70;
      prop.scaleX = prop.scaleY;
      prop.setAlpha(0.6).setOrigin(0.5, 1);
    }
    
    if (scene.textures.exists("prop-barrier")) {
      const prop = makeImage(scene, arenaX + arenaW - 55, arenaY + arenaH - 20, "prop-barrier", this.container);
      prop.displayHeight = 55;
      prop.scaleX = prop.scaleY;
      prop.setAlpha(0.4).setOrigin(0.5, 1);
    }

    this.playerView = scene.add.uiCombatActor(playerStatX, statY, statW, arenaH, "YOU", LAB_THEME.accent, true);
    this.enemyView = scene.add.uiCombatActor(enemyStatX, statY, statW, arenaH, "ENEMY", LAB_THEME.danger, false);
    
    // Independent sprites for floor alignment
    this.playerSprite = makeImage(scene, 0, 0, "player-idle", this.container).setOrigin(0.5, 1);
    this.enemySprite = makeImage(scene, 0, 0, "enemy-calibration-drone", this.container).setOrigin(0.5, 1);

    this.container.add([this.playerView, this.enemyView]);

    // Dynamic layers
    this.headerContainer = scene.add.container(0, 0);
    this.arenaContainer = scene.add.container(0, 0);
    this.effectsLayer = scene.add.container(0, 0);
    this.optionsLayer = scene.add.container(0, 0);
    this.container.add([this.headerContainer, this.arenaContainer, this.effectsLayer, this.optionsLayer]);
  }

  updateState(state: RunState, actionsEnabled: boolean): void {
    const { scene, width, contentInner } = this.ctx;
    const combat = state.combat!;

    const arenaX = contentInner.x + 4;
    const arenaY = contentInner.y + 54; // Moved slightly more up
    const arenaW = contentInner.width - 8;
    const arenaH = 120; // Increased height for robots
    const statW = 210;
    const playerStatX = arenaX + 4;
    const enemyStatX = arenaX + arenaW - statW - 4;
    const playerSpriteX = arenaX + arenaW * 0.28;
    const enemySpriteX = arenaX + arenaW * 0.72;
    const floorY = arenaY + arenaH - 12; // Dedicated baseline for robots
    const actionW = Math.floor((contentInner.width - 48) / 2);
    const actionGap = 12;
    const topInfoY = contentInner.y + 44;

    this.headerContainer.removeAll(true);
    this.arenaContainer.removeAll(true);
    this.optionsLayer.removeAll(true);

    const summary = combat.lastSummary.length > 0 ? combat.lastSummary[combat.lastSummary.length - 1] : "Waiting for player action...";
    renderSectionHeader(scene, arenaX, topInfoY, "COMBAT ANALYTICS", `Round ${combat.round}`, arenaW, this.headerContainer);
    
    // Shifted right to avoid title overlap
    createTag(scene, contentInner.x + 210, topInfoY, "ACTIVE NODE", 0x1d4d6c, this.headerContainer);
    
    createPanel(scene, contentInner.x + 332, topInfoY, contentInner.width - 336, 26, 0x162d3d, 0x35586d, this.headerContainer);
    makeText(scene, contentInner.x + 344, topInfoY + 6, summary, textStyle(8, LAB_THEME.textMuted, "left", contentInner.width - 360), this.headerContainer).setLineSpacing(-2);

    const actorY = floorY;
    const playerImgX = playerSpriteX;
    const enemyImgX = enemySpriteX;
    
    // Cards at top corners
    this.playerView.setPosition(playerStatX, arenaY + 8);
    this.enemyView.setPosition(enemyStatX, arenaY + 8);
    
    // Sprites on floor
    this.playerSprite.setPosition(playerImgX, floorY);
    this.enemySprite.setPosition(enemyImgX, floorY);

    this.playerView.updateStats(state.player.hp, state.player.maxHp, state.player.guard, state.player.focus, state.player.mitigationCharges);
    this.enemyView.updateStats(combat.enemyHp, combat.enemyMaxHp, 0, 0); 

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

    // --- VFX Trigger Logic ---
    const currentSignature = combat.lastSummary.join("|");
    if (currentSignature !== this.lastCombatSignature) {
      const lowerSum = lastSummaryText;
      
      if (lowerSum.includes("damage")) {
        // Player got hit
        this.scene.sound.play("sfx-hit");
        this.vfx.playHit(playerImgX, actorY - 60, false);
      } else if (lowerSum.includes("hit for") || lowerSum.includes("critical")) {
        // Enemy got hit
        const isCrit = lowerSum.includes("critical");
        this.scene.sound.play(isCrit ? "sfx-crit" : "sfx-hit");
        this.vfx.playHit(enemyImgX, actorY - 60, isCrit);
      } else if (lowerSum.includes("missed")) {
        this.scene.sound.play("sfx-miss");
        const isPlayerMiss = lowerSum.startsWith("you");
        this.vfx.playMiss(isPlayerMiss ? enemyImgX : playerImgX, actorY - 80);
      } else if (lowerSum.includes("fully blocked") || lowerSum.includes("blocked")) {
        this.scene.sound.play("sfx-block");
        const isPlayerBlock = lowerSum.startsWith("enemy");
        this.vfx.playBlock(isPlayerBlock ? playerImgX : enemyImgX, actorY - 80);
      }
    }
    this.lastCombatSignature = currentSignature;

    const tempCtx = { ...this.ctx, phaseRoot: this.optionsLayer };
    renderRerollButton(tempCtx, contentInner.x + contentInner.width - 180, arenaY + arenaH + 6, 152, () => this.scene.events.emit(UI_EVENTS.REROLL_REQUESTED), !actionsEnabled);

    const actionPanelY = arenaY + arenaH + 12;
    const actionPanelH = contentInner.height - (actionPanelY - contentInner.y) + 4; // Reset to reasonable fill
    createPanel(scene, contentInner.x, actionPanelY, contentInner.width, actionPanelH, 0x1a3342, LAB_THEME.borderSoft, this.optionsLayer);
    this.optionsLayer.setDepth(5);

    const actionH = 36;
    const gridY = actionPanelY + 12;
    
    const actionPositions = [
      { x: contentInner.x + 16, y: gridY },
      { x: contentInner.x + 16 + actionW + actionGap, y: gridY },
      { x: contentInner.x + 16, y: gridY + actionH + actionGap },
      { x: contentInner.x + 16 + actionW + actionGap, y: gridY + actionH + actionGap },
    ];

    const actionIconMap: Record<string, string> = {
      "strike": "intent-attack",
      "guard": "intent-guard",
      "focus": "icon-focus",
      "calibrate": "icon-archive",
    };

    combat.actions.forEach((action, index) => {
      const position = actionPositions[index];
      const preview = combat.previews.find(p => p.actionId === action.id) || null;
      const detail = getCombatActionDetail(action, preview);

      const actionIcon = actionIconMap[action.id] || actionIconMap[action.kind];

      const button = createButton(scene, {
        x: position.x,
        y: position.y,
        width: actionW,
        height: 40,
        label: action.label.toUpperCase(),
        detail: detail,
        onClick: () => this.scene.events.emit(UI_EVENTS.COMBAT_ACTION_RESOLVE, action.id),
        disabled: !actionsEnabled,
      }, this.optionsLayer);

      if (actionIcon && scene.textures.exists("ui-icons")) {
          makeFrameImage(scene, actionW - 24, 20, "ui-icons", actionIcon, button)
              .setDisplaySize(20, 20)
              .setOrigin(0.5);
      }
    });
  }
}
