import { LAB_THEME, textStyle } from "../theme.js";
import { makeImage, makeText } from "../display.js";
import { createButton } from "../widgets.js";
import type { RewardChoice } from "../../types.js";
import { UI_EVENTS } from "../../events.js";

export class UIRewardCard extends Phaser.GameObjects.Container {
  private choice?: RewardChoice;
  private icon?: Phaser.GameObjects.Image;
  private button: any;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    super(scene, x, y);

    this.button = createButton(scene, {
      x: 0,
      y: 0,
      width,
      height,
      label: "",
      detail: "",
      onClick: () => {
        if (this.choice) {
            this.scene.events.emit(UI_EVENTS.REWARD_CHOICE_SELECTED, this.choice.id);
        }
      },
    }, this);

    this.button.setHoverExtras(
      () => scene.tweens.add({ targets: this.button, scale: 1.03, duration: 100, ease: "Back.easeOut" }),
      () => scene.tweens.add({ targets: this.button, scale: 1.0, duration: 150, ease: "Cubic.out" })
    );
  }

  public setReward(choice: RewardChoice): this {
    this.choice = choice;
    this.button.label.setText(choice.label.toUpperCase());
    this.button.detail.setText(choice.description);

    if (this.icon) this.icon.destroy();

    const iconMap: Record<string, string> = {
      "heal": "reward-medkit",
      "max-hp": "reward-plating",
      "supplies": "reward-supply-crate",
      "archive": "reward-archive-shard",
      "mitigation": "reward-stabilizer-kit",
    };

    const iconKey = iconMap[choice.type];
    if (iconKey && this.scene.textures.exists(iconKey)) {
      this.icon = makeImage(this.scene, this.button.config.width - 28, 32, iconKey, this.button)
        .setDisplaySize(32, 32)
        .setOrigin(0.5);
      
      if (choice.type === "archive") {
          this.icon.setTint(0x8ce5c2);
      }
    }
    return this;
  }
}

// Factory registration
Phaser.GameObjects.GameObjectFactory.register("uiRewardCard", function (this: Phaser.GameObjects.GameObjectFactory, x: number, y: number, width: number, height: number) {
  const obj = new UIRewardCard(this.scene, x, y, width, height);
  this.displayList.add(obj);
  return obj;
});

declare global {
  namespace Phaser.GameObjects {
    interface GameObjectFactory {
      uiRewardCard(x: number, y: number, width: number, height: number): UIRewardCard;
    }
  }
}
