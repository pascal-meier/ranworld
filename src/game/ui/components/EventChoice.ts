import { LAB_THEME, textStyle } from "../theme.js";
import { createButton } from "../widgets.js";
import type { EventChoice } from "../../types.js";
import { UI_EVENTS } from "../../events.js";

export class UIEventChoice extends Phaser.GameObjects.Container {
  private choice?: EventChoice;
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
            this.scene.events.emit(UI_EVENTS.EVENT_CHOICE_RESOLVE, this.choice.id);
        }
      },
    }, this);

    this.button.setHoverExtras(
      () => scene.tweens.add({ targets: this.button, scale: 1.02, duration: 80, ease: "Cubic.out" }),
      () => scene.tweens.add({ targets: this.button, scale: 1.0, duration: 150, ease: "Cubic.out" })
    );
  }

  public setChoice(option: EventChoice): this {
    this.choice = option;
    
    const chanceCopy =
        option.shownChance !== undefined || option.actualChance !== undefined
          ? ` ${option.shownChance ?? option.actualChance}% / ${option.actualChance ?? option.shownChance}%`
          : "";

    this.button.label.setText(option.label.toUpperCase());
    if (this.button.detail) {
      this.button.detail.setText(`${option.description}${chanceCopy}`);
    }

    return this;
  }
}

// Factory registration
Phaser.GameObjects.GameObjectFactory.register("uiEventChoice", function (this: Phaser.GameObjects.GameObjectFactory, x: number, y: number, width: number, height: number) {
  const obj = new UIEventChoice(this.scene, x, y, width, height);
  this.displayList.add(obj);
  return obj;
});

declare global {
  namespace Phaser.GameObjects {
    interface GameObjectFactory {
      uiEventChoice(x: number, y: number, width: number, height: number): UIEventChoice;
    }
  }
}
