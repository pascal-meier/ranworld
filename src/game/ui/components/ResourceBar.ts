import { LAB_THEME, textStyle } from "../theme.js";
import { makeImage, makeText } from "../display.js";
import { getMechanicDefinition } from "../../mechanics/index.js";
import type { MechanicId } from "../../types.js";

export class UIResourceBar extends Phaser.GameObjects.Container {
  private suppliesText: Phaser.GameObjects.Text;
  private archiveText: Phaser.GameObjects.Text;
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
    
    if (this.scene.textures.exists("archive-shard")) {
      makeImage(this.scene, 118, 22, "archive-shard", this)
        .setTint(0x8ce5c2)
        .setScale(0.62)
        .setOrigin(0.5);
    }
    this.archiveText = makeText(this.scene, 184, 12, "", textStyle(8, LAB_THEME.positive), this);

    if (this.scene.textures.exists("supply-token")) {
      makeImage(this.scene, 234, 22, "supply-token", this)
        .setScale(0.66)
        .setOrigin(0.5);
    }
    this.suppliesText = makeText(this.scene, 304, 12, "", textStyle(8, LAB_THEME.accent), this);

    // Upgrades Section
    this.upgradeTitle = makeText(this.scene, 16, 60, "ACTIVE MODULES", textStyle(9, LAB_THEME.text), this);
    this.upgradeListLayer = this.scene.add.container(0, 0);
    this.add(this.upgradeListLayer);

    // Initial Sync
    this.refresh();

    // Registry Listeners
    this.scene.registry.events.on("changedata-player-supplies", this.refresh, this);
    this.scene.registry.events.on("changedata-player-archive-gain", this.refresh, this);

    this.on(Phaser.GameObjects.Events.DESTROY, () => {
      this.scene.registry.events.off("changedata-player-supplies", this.refresh, this);
      this.scene.registry.events.off("changedata-player-archive-gain", this.refresh, this);
    });
  }

  public refresh(): void {
    const r = this.scene.registry;
    const supplies = r.get("player-supplies") ?? 0;
    const archive = r.get("player-archive-gain") ?? 0;

    this.suppliesText.setText(`${supplies}`);
    this.archiveText.setText(`${archive}`);
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
