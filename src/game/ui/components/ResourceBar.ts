import { LAB_THEME, textStyle } from "../theme.js";
import { makeFrameImage, makeImage, makeText } from "../display.js";
import { getMechanicDefinition } from "../../mechanics/index.js";
import type { MechanicId } from "../../types.js";

export class UIResourceBar extends Phaser.GameObjects.Container {
  private suppliesText: Phaser.GameObjects.Text;
  private archiveText: Phaser.GameObjects.Text;
  private researchText: Phaser.GameObjects.Text;
  private upgradeTitle: Phaser.GameObjects.Text;
  private upgradeListLayer: Phaser.GameObjects.Container;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    super(scene, x, y);

    // Resources Section
    makeText(this.scene, 16, 12, "RESOURCES", textStyle(8, LAB_THEME.textMuted), this);
    
    let curX = 16;
    const drawRes = (key: string, color: string) => {
      curX += 48;
      if (this.scene.textures.get("ui-icons").has(key)) {
        makeFrameImage(this.scene, curX, 22, "ui-icons", key, this).setDisplaySize(16, 16).setOrigin(0.5);
      }
      curX += 14;
      return makeText(this.scene, curX, 12, "0", textStyle(9, color), this);
    };

    this.archiveText = drawRes("icon-archive", LAB_THEME.positive);
    this.suppliesText = drawRes("icon-supplies", LAB_THEME.accent);
    this.researchText = drawRes("icon-research", LAB_THEME.accentSoft);

    // Upgrades Section
    this.upgradeTitle = makeText(this.scene, 16, 68, "ACTIVE MODULES", textStyle(9, LAB_THEME.text), this);
    this.upgradeListLayer = this.scene.add.container(0, 8); // Added internal offset
    this.add(this.upgradeListLayer);

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
    this.upgradeListLayer.removeAll(true);
    
    if (mechanics.length === 0) {
      makeText(this.scene, 16, 82, "No active modules.", textStyle(8, LAB_THEME.textMuted), this.upgradeListLayer);
      return;
    }

    mechanics.slice(0, 3).forEach((id, index) => {
      const mechanic = getMechanicDefinition(id);
      const rowY = 82 + index * 24;
      makeText(this.scene, 16, rowY, mechanic.shortLabel.toUpperCase(), textStyle(8, LAB_THEME.text), this.upgradeListLayer);
      makeText(this.scene, 16, rowY + 12, mechanic.effectText, textStyle(8, LAB_THEME.textMuted), this.upgradeListLayer).setLineSpacing(-2);
    });
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
