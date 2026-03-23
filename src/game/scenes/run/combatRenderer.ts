import type { CombatAction, CombatActionPreview } from "../../types.js";
import type { RunRenderContext } from "./shared.js";
import { renderMainPanel, renderRerollButton } from "./shared.js";
import { renderSectionHeader } from "../../ui/components.js";
import { createButton, createPanel, createTag } from "../../ui/widgets.js";
import { LAB_THEME, textStyle } from "../../ui/theme.js";
import { makeImage, makeText } from "../../ui/display.js";

function getCombatActionDetail(
  action: CombatAction,
  preview?: CombatActionPreview
): string {
  if (
    action.kind === "attack" &&
    preview &&
    preview.shownHitChance !== null &&
    preview.actualHitChance !== null
  ) {
    return preview.shownHitChance === preview.actualHitChance
      ? `${preview.shownHitChance}% hit, ${action.baseDamage} dmg`
      : `${preview.shownHitChance}% shown / ${preview.actualHitChance}% real, ${action.baseDamage} dmg`;
  }

  if (action.kind === "guard") {
    return `+${action.guardGain} guard. Blocks next hit.`;
  }

  if (action.kind === "focus") {
    return `+${action.focusGain} hit on next attack.`;
  }

  if (action.kind === "stabilize") {
    return `1 charge: +${action.guardGain} guard, +${action.focusGain} hit.`;
  }

  return action.description;
}

function renderCombatStatCard(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  title: string,
  titleColor: string,
  lines: string[],
  parent: Phaser.GameObjects.Container
): void {
  createPanel(scene, x, y, width, 64, 0x1a3342, 0x3a6174, parent);
  makeText(scene, x + 12, y + 10, title, textStyle(8, titleColor), parent);
  makeText(scene, x + 12, y + 28, lines.join("\n"), textStyle(8, LAB_THEME.text, "left", width - 24), parent).setLineSpacing(-2);
}

export function renderCombatPhase(
  ctx: RunRenderContext,
  onResolveAction: (actionId: string) => void,
  onReroll: () => void,
  actionsEnabled: boolean
): void {
  const { scene, state, width, contentInner, phaseRoot } = ctx;
  const combat = state.combat!;
  const arenaX = contentInner.x + 4;
  const arenaY = contentInner.y + 84;
  const arenaW = contentInner.width - 8;
  const arenaH = 124;
  const statW = 220;
  const playerStatX = arenaX + 12;
  const enemyStatX = arenaX + arenaW - statW - 12;
  const statY = arenaY + 10;
  const playerSpriteX = arenaX + arenaW * 0.3;
  const enemySpriteX = arenaX + arenaW * 0.74;
  const spriteY = arenaY + 86;
  const actionGap = 16;
  const actionW = Math.floor((contentInner.width - actionGap) / 2);
  const topInfoY = contentInner.y + 44;
  const summary = combat.lastSummary.slice(-2).join("  ") || "Pick an action to start the exchange.";

  renderMainPanel(ctx);
  renderSectionHeader(
    scene,
    contentInner.x + 4,
    contentInner.y + 6,
    combat.enemyName.toUpperCase(),
    `${combat.enemyRole === "boss" ? "BOSS" : "LANDING"}  ROUND ${combat.round}  HP ${combat.enemyHp}/${combat.enemyMaxHp}  ATTACK ${combat.enemyAttack}`,
    contentInner.width - 8,
    phaseRoot
  );

  createTag(scene, contentInner.x + 4, contentInner.y + 44, combat.environmentName, 0x2e5a46, phaseRoot);
  makeText(
    scene,
    contentInner.x + 140,
    contentInner.y + 48,
    combat.environmentDescription,
    textStyle(8, LAB_THEME.textMuted, "left", contentInner.width - 176),
    phaseRoot
  ).setLineSpacing(-2);

  createPanel(scene, contentInner.x + 132, topInfoY, 172, 26, 0x162d3d, 0x35586d, phaseRoot);
  makeText(scene, contentInner.x + 144, topInfoY + 6, `INTENT ${combat.enemyAttack}  REWARD +1 SUP +2 HP`, textStyle(8, LAB_THEME.accent), phaseRoot);
  createPanel(scene, contentInner.x + 312, topInfoY, contentInner.width - 316, 26, 0x162d3d, 0x35586d, phaseRoot);
  makeText(scene, contentInner.x + 324, topInfoY + 6, summary, textStyle(8, LAB_THEME.textMuted, "left", contentInner.width - 340), phaseRoot).setLineSpacing(-2);

  createPanel(scene, arenaX, arenaY, arenaW, arenaH, 0x0a1d2a, 0x35586d, phaseRoot);
  renderCombatStatCard(
    scene,
    playerStatX,
    statY,
    statW,
    "YOU",
    LAB_THEME.accent,
    [
      `HP ${state.player.hp}/${state.player.maxHp}`,
      `Guard ${state.player.guard}  Focus ${state.player.focus}`,
      `Charges ${state.player.mitigationCharges}`,
    ]
    ,
    phaseRoot
  );
  renderCombatStatCard(
    scene,
    enemyStatX,
    statY,
    statW,
    "ENEMY",
    LAB_THEME.danger,
    [
      `HP ${combat.enemyHp}/${combat.enemyMaxHp}`,
      `Intent ${combat.enemyAttack}  Round ${combat.round}`,
      combat.enemyRole === "boss" ? "Boss target" : "Landing target",
    ],
    phaseRoot
  );

  if (scene.textures.exists("player-idle")) {
    makeImage(scene, playerSpriteX, spriteY, "player-idle", phaseRoot).setScale(1.6).setOrigin(0.5);
  }

  if (scene.textures.exists("enemy-calibration-drone")) {
    makeImage(scene, enemySpriteX, spriteY, "enemy-calibration-drone", phaseRoot).setScale(1.22).setOrigin(0.5);
  }

  renderRerollButton(ctx, width - 180, arenaY + arenaH + 10, 152, onReroll, !actionsEnabled);

  const actionPositions = [
    { x: contentInner.x + 4, y: arenaY + arenaH + 18 },
    { x: contentInner.x + 4 + actionW + actionGap, y: arenaY + arenaH + 18 },
    { x: contentInner.x + 4, y: arenaY + arenaH + 68 },
    { x: contentInner.x + 4 + actionW + actionGap, y: arenaY + arenaH + 68 },
  ];

  combat.actions.forEach((action, index) => {
    const preview = combat.previews.find((entry) => entry.actionId === action.id);
    const detail = getCombatActionDetail(action, preview);

    const position = actionPositions[index] ?? actionPositions[actionPositions.length - 1];

    createButton(scene, {
      x: position.x,
      y: position.y,
      width: actionW,
      height: 40,
      label: action.label.toUpperCase(),
      detail,
      onClick: () => onResolveAction(action.id),
      disabled: !actionsEnabled,
    }, phaseRoot);
  });
}
