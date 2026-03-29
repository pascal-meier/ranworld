import { makeRectangle } from "../../ui/display.js";
import type { ScreenLayout } from "../../ui/layout.js";
import type { UIStatBar } from "../../ui/components/StatBar.js";
import type { UIResourceBar } from "../../ui/components/ResourceBar.js";
import { LAB_THEME } from "../../ui/theme.js";

export class ChromeManager {
  private statBar?: UIStatBar;
  private resourceBar?: UIResourceBar;
  private layout?: ScreenLayout;
  private chromeSize?: { width: number; height: number };

  constructor(
    private scene: Phaser.Scene,
    private backgroundLayer: Phaser.GameObjects.Container,
    private chromeLayer: Phaser.GameObjects.Container,
    private tooltipLayer: Phaser.GameObjects.Container
  ) {}

  ensureChrome(width: number, height: number, layout: ScreenLayout): void {
    const sizeChanged =
      !this.chromeSize ||
      this.chromeSize.width !== width ||
      this.chromeSize.height !== height ||
      !this.layout ||
      !this.statBar ||
      !this.resourceBar;

    if (!sizeChanged) {
      return;
    }

    this.chromeSize = { width, height };
    this.layout = layout;
    this.buildChrome(width, height, layout);
  }

  syncChrome(state: import("../../types.js").RunState): void {
    // StatBar and ResourceBar update themselves via Registry
    // But we might still need to update the upgrade list if it's not fully reactive yet
    this.resourceBar?.updateUpgrades(state.activeMechanics);
  }

  private buildChrome(width: number, height: number, layout: ScreenLayout): void {
    this.backgroundLayer.removeAll(true);
    this.chromeLayer.removeAll(true);
    this.tooltipLayer.removeAll(true);

    makeRectangle(this.scene, 0, 0, width, height, LAB_THEME.background, 1, this.backgroundLayer).setOrigin(0);
    makeRectangle(this.scene, 0, 0, width, 40, 0x0b1a26, 1, this.backgroundLayer).setOrigin(0);

    this.statBar = this.scene.add.uiStatBar(layout.header.x, layout.header.y, layout.header.width, layout.header.height);
    this.chromeLayer.add(this.statBar);

    this.resourceBar = this.scene.add.uiResourceBar(layout.footer.x, layout.footer.y, layout.footer.width, layout.footer.height);
    this.chromeLayer.add(this.resourceBar);
  }

  destroy(): void {
    this.statBar = undefined;
    this.resourceBar = undefined;
    this.layout = undefined;
    this.chromeSize = undefined;
  }
}
