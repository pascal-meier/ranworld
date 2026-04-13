import { LAB_THEME, textStyle } from "../theme.js";
import { makeFrameImage, makeText } from "../display.js";
import { getMechanicDefinition } from "../../mechanics/index.js";
import type { MechanicId } from "../../types.js";
import { createPanel } from "../widgets.js";

export class UIResourceBar extends Phaser.GameObjects.Container {
  private suppliesText: Phaser.GameObjects.Text;
  private archiveText: Phaser.GameObjects.Text;
  private researchText: Phaser.GameObjects.Text;
  private upgradeSummaryText: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    super(scene, x, y);
    this.setSize(width, height);
    createPanel(this.scene, 0, 0, width, height, LAB_THEME.panelAlt, LAB_THEME.borderSoft, this);

    // Resources Section
    makeText(this.scene, 16, 12, "RESOURCES", textStyle(8, LAB_THEME.textMuted), this);
    
    let curX = 18;
    const drawRes = (key: string, color: string) => {
      if (this.scene.textures.get("ui-icons").has(key)) {
        makeFrameImage(this.scene, curX, 29, "ui-icons", key, this).setDisplaySize(16, 16).setOrigin(0, 0.5);
      }
      curX += 22;
      const text = makeText(this.scene, curX, 20, "0", textStyle(9, color), this);
      curX += 58;
      return text;
    };

    this.archiveText = drawRes("icon-archive", LAB_THEME.positive);
    this.suppliesText = drawRes("icon-supplies", LAB_THEME.accent);
    this.researchText = drawRes("icon-research", LAB_THEME.accentSoft);

    // Upgrades Section
    makeText(this.scene, 16, 56, "ACTIVE MODULES", textStyle(9, LAB_THEME.text), this);
    this.upgradeSummaryText = makeText(
      this.scene,
      16,
      72,
      "No active modules.",
      textStyle(8, LAB_THEME.textMuted, "left", width - 32),
      this
    ).setLineSpacing(-2);

    // Initial Sync
    this.refresh();

    // Registry Listeners
    this.scene.registry.events.on("changedata-player-supplies", this.refresh, this);
    this.scene.registry.events.on("changedata-player-archive-gain", this.refresh, this);
    this.scene.registry.events.on("changedata-player-research", this.refresh, this);

    this.on(Phaser.GameObjects.Events.DESTROY, () => {
      this.scene.registry.events.off("changedata-player-supplies", this.refresh, this);
      this.scene.registry.events.off("changedata-player-archive-gain", this.refresh, this);
      this.scene.registry.events.off("changedata-player-research", this.refresh, this);
    });
  }

  public refresh(): void {
    const r = this.scene.registry;
    const supplies = r.get("player-supplies") ?? 0;
    const archive = r.get("player-archive-gain") ?? 0;
    const research = r.get("player-research") ?? 0;

    this.suppliesText.setText(`${supplies}`);
    this.archiveText.setText(`${archive}`);
    this.researchText.setText(`${research}`);
  }

  public updateUpgrades(mechanics: MechanicId[]): void {
    if (mechanics.length === 0) {
      this.upgradeSummaryText.setText("No active modules.");
      return;
    }

    const summary = mechanics
      .slice(0, 3)
      .map((mechanicId) => getMechanicDefinition(mechanicId).shortLabel.toUpperCase())
      .join(" / ");

    this.upgradeSummaryText.setText(summary);
  }
}

// Factory registration
Phaser.GameObjects.GameObjectFactory.register("uiResourceBar", function (this: Phaser.GameObjects.GameObjectFactory, x: number, y: number, width: number, height: number) {
  const obj = new UIResourceBar(this.scene, x, y, width, height);
  this.displayList.add(obj);
  return obj;
});

declare global {
  namespace Phaser.GameObjects {
    interface GameObjectFactory {
      uiResourceBar(x: number, y: number, width: number, height: number): UIResourceBar;
    }
  }
}
