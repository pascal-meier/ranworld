import { LAB_THEME, textStyle } from "../theme.js";
import { makeText } from "../display.js";

export class UIStatBar extends Phaser.GameObjects.Container {
  private primaryText: Phaser.GameObjects.Text;
  private secondaryText: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    super(scene, x, y);
    this.setSize(width, height);

    this.primaryText = makeText(
      this.scene,
      12,
      10,
      "",
      textStyle(9, LAB_THEME.text, "left", width - 24),
      this
    );

    this.secondaryText = makeText(
      this.scene,
      12,
      28,
      "",
      textStyle(8, LAB_THEME.textMuted, "left", width - 24),
      this
    );

    // Initial Sync
    this.refresh();

    // Registry Listeners
    this.scene.registry.events.on("changedata-player-hp", this.refresh, this);
    this.scene.registry.events.on("changedata-player-max-hp", this.refresh, this);
    this.scene.registry.events.on("changedata-player-focus", this.refresh, this);
    this.scene.registry.events.on("changedata-player-charges", this.refresh, this);
    this.scene.registry.events.on("changedata-planet-name", this.refresh, this);
    this.scene.registry.events.on("changedata-current-site", this.refresh, this);

    this.on(Phaser.GameObjects.Events.DESTROY, () => {
      this.scene.registry.events.off("changedata-player-hp", this.refresh, this);
      this.scene.registry.events.off("changedata-player-max-hp", this.refresh, this);
      this.scene.registry.events.off("changedata-player-focus", this.refresh, this);
      this.scene.registry.events.off("changedata-player-charges", this.refresh, this);
      this.scene.registry.events.off("changedata-planet-name", this.refresh, this);
      this.scene.registry.events.off("changedata-current-site", this.refresh, this);
    });
  }

  public refresh(): void {
    const r = this.scene.registry;
    const hp = r.get("player-hp") ?? 0;
    const maxHp = r.get("player-max-hp") ?? 100;
    const focus = r.get("player-focus") ?? 0;
    const charges = r.get("player-charges") ?? 0;
    const site = r.get("current-site") ?? 1;
    const planetName = r.get("planet-name") ?? "Unknown";

    this.primaryText.setText(
      `SITE ${site}   /   HP ${hp}/${maxHp}   /   FOCUS ${focus}   /   CHARGES ${charges}`
    );
    this.secondaryText.setText(
      `${planetName.toUpperCase()}   /   SYSTEM STATUS: NOMINAL`
    );
  }
}

// Factory registration
Phaser.GameObjects.GameObjectFactory.register("uiStatBar", function (this: Phaser.GameObjects.GameObjectFactory, x: number, y: number, width: number, height: number) {
  const obj = new UIStatBar(this.scene, x, y, width, height);
  this.displayList.add(obj);
  return obj;
});

declare global {
  namespace Phaser.GameObjects {
    interface GameObjectFactory {
      uiStatBar(x: number, y: number, width: number, height: number): UIStatBar;
    }
  }
}
