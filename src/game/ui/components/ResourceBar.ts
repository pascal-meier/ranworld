import { LAB_THEME, textStyle } from "../theme.js";
import { makeFrameImage, makeImage, makeText } from "../display.js";
import { getMechanicDefinition } from "../../mechanics/index.js";
import type { MechanicId } from "../../types.js";
import { createPanel } from "../widgets.js";

export class UIResourceBar extends Phaser.GameObjects.Container {
  private suppliesText: Phaser.GameObjects.Text;
  private archiveText: Phaser.GameObjects.Text;
  private researchText: Phaser.GameObjects.Text;
  private upgradeTitle: Phaser.GameObjects.Text;
  private upgradeListLayer: Phaser.GameObjects.Container;
  private noModulesText: Phaser.GameObjects.Text;
  private upgradeRows: Array<{
    label: Phaser.GameObjects.Text;
    effect: Phaser.GameObjects.Text;
  }> = [];

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
    this.upgradeListLayer = new Phaser.GameObjects.Container(this.scene, 0, 8);
    this.add(this.upgradeListLayer);
    this.noModulesText = makeText(this.scene, 16, 82, "No active modules.", textStyle(8, LAB_THEME.textMuted), this.upgradeListLayer);

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
    const visibleMechanics = mechanics.slice(0, 3);
    this.noModulesText.setVisible(visibleMechanics.length === 0);

    while (this.upgradeRows.length < visibleMechanics.length) {
      const index = this.upgradeRows.length;
      const rowY = 82 + index * 24;
      this.upgradeRows.push({
        label: makeText(this.scene, 16, rowY, "", textStyle(8, LAB_THEME.text), this.upgradeListLayer),
        effect: makeText(this.scene, 16, rowY + 12, "", textStyle(8, LAB_THEME.textMuted), this.upgradeListLayer).setLineSpacing(-2),
      });
    }

    this.upgradeRows.forEach((row, index) => {
      const mechanicId = visibleMechanics[index];

      if (!mechanicId) {
        row.label.setVisible(false);
        row.effect.setVisible(false);
        return;
      }

      const mechanic = getMechanicDefinition(mechanicId);
      row.label.setVisible(true).setText(mechanic.shortLabel.toUpperCase());
      row.effect.setVisible(true).setText(mechanic.effectText);
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
