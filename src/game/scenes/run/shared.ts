import type { RunState } from "../../types.js";
import { getMechanicDefinition } from "../../mechanics/index.js";
import { LAB_THEME, textStyle } from "../../ui/theme.js";
import { createPanel } from "../../ui/widgets.js";
import { createScreenLayout, insetRect, type LayoutRect, type ScreenLayout } from "../../ui/layout.js";
import { makeFrameImage, makeImage, makeRectangle, makeText, type DisplayParent } from "../../ui/display.js";

export interface RunRenderContext {
  scene: Phaser.Scene;
  state: RunState;
  width: number;
  height: number;
  layout: ScreenLayout;
  contentInner: LayoutRect;
  phaseRoot: DisplayParent;
  onSelectNode: (nodeId: string) => void;
}

export function getCenteredX(totalWidth: number, parentWidth: number): number {
  return Math.floor((parentWidth - totalWidth) / 2);
}

export function createRunRenderContext(
  scene: Phaser.Scene,
  state: RunState,
  phaseRoot: DisplayParent,
  onSelectNode: (nodeId: string) => void
): RunRenderContext {
  const { width, height } = scene.scale;
  const layout = createScreenLayout(width, height, {
    margin: 16,
    top: 12,
    gap: 12,
    headerHeight: 52,
    footerHeight: 110,
  });

  return {
    scene,
    state,
    width,
    height,
    layout,
    contentInner: insetRect(layout.content, 12),
    phaseRoot,
    onSelectNode,
  };
}

export function renderRunFrame(ctx: RunRenderContext): void {
  const { scene, width, height, phaseRoot } = ctx;

  makeRectangle(scene, 0, 0, width, height, LAB_THEME.background, 1, phaseRoot).setOrigin(0);
  makeRectangle(scene, 0, 0, width, 40, 0x0b1a26, 1, phaseRoot).setOrigin(0);
}

export function renderHud(ctx: RunRenderContext): void {
  const { scene, state, width, layout, phaseRoot } = ctx;
  createPanel(scene, layout.header.x, layout.header.y, layout.header.width, layout.header.height, LAB_THEME.panel, LAB_THEME.borderSoft, phaseRoot);

  let currentX = layout.header.x + 12;
  const currentY = layout.header.y + 10;
  
  const drawStat = (key: string, text: string, spacing: number) => {
    const isFrame = scene.textures.get("ui-icons").has(key);
    if (isFrame) {
      makeFrameImage(scene, currentX, currentY + 5, "ui-icons", key, phaseRoot).setDisplaySize(12, 12).setOrigin(0, 0.5);
    } else {
      makeImage(scene, currentX, currentY + 5, key, phaseRoot).setDisplaySize(12, 12).setOrigin(0, 0.5);
    }
    currentX += 16;
    const txt = makeText(scene, currentX, currentY, text, textStyle(9, LAB_THEME.text), phaseRoot);
    currentX += txt.width + spacing;
  };

  const planetText = makeText(scene, currentX, currentY, `PLN ${state.planet} / SIT ${state.currentSite}`, textStyle(9, LAB_THEME.text), phaseRoot);
  currentX += planetText.width + 16;
  
  drawStat("status-heal", `${state.player.hp}/${state.player.maxHp}`, 10);
  drawStat("icon-supplies", `${state.player.supplies}`, 10);
  drawStat("icon-focus", `${state.player.focus}`, 10);
  drawStat("status-warning", `${state.player.mitigationCharges}`, 10);
  drawStat("icon-archive", `${state.player.archiveGain}`, 10);
  drawStat("icon-research", `${state.player.research}`, 10);

  const moduleText =
    state.activeMechanics.length > 0
      ? state.activeMechanics.map((id) => getMechanicDefinition(id).shortLabel).join(" / ")
      : "none";

  makeText(
    scene,
    layout.header.x + 12,
    layout.header.y + 28,
    `${state.selectedPlanetImageKey ? state.planetName.toUpperCase() : "SELECT PLANET"}  |  MODULES ${moduleText}  |  M MODS`,
    textStyle(8, LAB_THEME.textMuted, "left", width - 56),
    phaseRoot
  );
}

export function renderMainPanel(ctx: RunRenderContext, fill = LAB_THEME.panel): void {
  const { scene, layout, phaseRoot } = ctx;
  createPanel(scene, layout.content.x, layout.content.y, layout.content.width, layout.content.height, fill, LAB_THEME.borderSoft, phaseRoot);
}

export function renderPlanetBackdrop(ctx: RunRenderContext): void {
  const { scene, contentInner, phaseRoot } = ctx;
  const frame: LayoutRect = {
    x: contentInner.x,
    y: contentInner.y + 44,
    width: contentInner.width,
    height: Math.min(280, contentInner.height - 56),
  };

  makeRectangle(scene, frame.x, frame.y, frame.width, frame.height, 0x08121a, 1, phaseRoot).setOrigin(0);

  if (scene.textures.exists("planet-background")) {
    renderPlanetSprite(
      scene,
      "planet-background",
      frame.x + frame.width / 2,
      frame.y + frame.height / 2,
      frame.width - 24,
      frame.height - 28,
      0.28,
      phaseRoot
    );
  }
}

export function renderPlanetSprite(
  scene: Phaser.Scene,
  key: string,
  x: number,
  y: number,
  maxWidth: number,
  maxHeight: number,
  alpha = 1,
  parent?: DisplayParent
): void {
  if (!scene.textures.exists(key)) {
    return;
  }

  const texture = scene.textures.get(key).getSourceImage() as { width: number; height: number };
  const scale = Math.min(maxWidth / texture.width, maxHeight / texture.height);

  makeImage(scene, x, y, key, parent).setScale(scale).setAlpha(alpha).setOrigin(0.5);
}
