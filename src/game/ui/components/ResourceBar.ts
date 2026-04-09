import { LAB_THEME, textStyle } from "../theme.js";
import { makeFrameImage, makeImage, makeRectangle, makeText } from "../display.js";
import { createPanel } from "../widgets.js";
import { getMechanicDefinition } from "../../mechanics/index.js";
import { getUpgradeTrackLabel } from "../../mechanics/catalog.js";
import type { MechanicId } from "../../types.js";

export class UIResourceBar extends Phaser.GameObjects.Container {
  private suppliesText: Phaser.GameObjects.Text;
  private archiveText: Phaser.GameObjects.Text;
  private researchText: Phaser.GameObjects.Text;
  private upgradeTitle: Phaser.GameObjects.Text;
  private upgradeListLayer: Phaser.GameObjects.Container;
  private readonly barWidth: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    super(scene, x, y);
    this.barWidth = width;

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
    this.upgradeListLayer = this.scene.add.container(0, 0);
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
      makeText(this.scene, 16, 86, "No active modules.", textStyle(8, LAB_THEME.textMuted), this.upgradeListLayer);
      return;
    }

    const columns = mechanics.length;
    const gap = 10;
    const cardY = 80;
    const cardH = 28;
    const cardW = Math.floor((this.barWidth - 32 - gap * (columns - 1)) / columns);

    makeText(
      this.scene,
      16,
      68,
      "ACTIVE MODULES",
      textStyle(9, LAB_THEME.text),
      this.upgradeListLayer
    );
    makeText(
      this.scene,
      this.barWidth - 16,
      68,
      "M FOR DETAILS",
      textStyle(7, LAB_THEME.textMuted, "right"),
      this.upgradeListLayer
    ).setOrigin(1, 0);

    mechanics.slice(0, 3).forEach((id, index) => {
      const mechanic = getMechanicDefinition(id);
      const cardX = 16 + index * (cardW + gap);
      const card = createPanel(this.scene, cardX, cardY, cardW, cardH, LAB_THEME.panelAlt, LAB_THEME.borderSoft, this.upgradeListLayer);
      card.setAlpha(0.98);

      makeRectangle(this.scene, cardX + 4, cardY + 4, 4, cardH - 8, LAB_THEME.accentFill, 1, this.upgradeListLayer);

      makeText(
        this.scene,
        cardX + 16,
        cardY + 4,
        mechanic.shortLabel.toUpperCase(),
        textStyle(8, LAB_THEME.text),
        this.upgradeListLayer
      );

      makeText(
        this.scene,
        cardX + 16,
        cardY + 15,
        `${mechanic.tableId}  /  ${getUpgradeTrackLabel(mechanic.upgradeTrack).toUpperCase()}`,
        textStyle(7, LAB_THEME.textMuted),
        this.upgradeListLayer
      );

      if (mechanic.iconKey && this.scene.textures.exists("ui-icons")) {
        makeFrameImage(this.scene, cardX + cardW - 16, cardY + 14, "ui-icons", mechanic.iconKey, this.upgradeListLayer)
          .setDisplaySize(14, 14)
          .setOrigin(0.5);
      }
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
