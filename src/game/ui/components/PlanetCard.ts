import { LAB_THEME, textStyle } from "../theme.js";
import { makeImage, makeRectangle, makeText } from "../display.js";
import { createPanel } from "../widgets.js";
import type { PlanetChoice } from "../../types.js";
import { UI_EVENTS } from "../../events.js";

export class UIPlanetCard extends Phaser.GameObjects.Container {
  private image: Phaser.GameObjects.Image;
  private title: Phaser.GameObjects.Text;
  private description: Phaser.GameObjects.Text;
  private cardChoice?: PlanetChoice;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    const cardContainer = scene.add.container(0, 0);
    super(scene, x, y, [cardContainer]);

    createPanel(scene, 0, 0, width, height, LAB_THEME.panelAlt, LAB_THEME.borderSoft, cardContainer);
    
    // Decorative accent
    makeRectangle(scene, 8, 10, width - 16, 6, LAB_THEME.accentFill, 0.85, cardContainer).setOrigin(0);

    // Interactive hitbox
    const hitbox = makeRectangle(scene, 0, 0, width, height, 0x000000, 0, cardContainer)
      .setOrigin(0)
      .setInteractive({ useHandCursor: true });

    this.image = makeImage(scene, 108, height / 2, "planet-01", cardContainer).setOrigin(0.5);
    this.title = makeText(scene, 198, 18, "", textStyle(11), cardContainer);
    this.description = makeText(scene, 198, 44, "", textStyle(9, LAB_THEME.textMuted, "left", width - 216), cardContainer);
    
    makeText(
      scene,
      198,
      88,
      "Surface route: 3 sites before the final approach.",
      textStyle(8, LAB_THEME.text, "left", width - 216),
      cardContainer
    );
    
    makeText(scene, 198, height - 30, "TOUCH DOWN", textStyle(9, LAB_THEME.accent), cardContainer);

    hitbox.on("pointerover", () => this.setAlpha(1).setScale(1.02));
    hitbox.on("pointerout", () => this.setAlpha(1).setScale(1));
    hitbox.on("pointerdown", () => {
        if (this.cardChoice) {
            this.scene.events.emit(UI_EVENTS.PLANET_SELECTED, this.cardChoice.id);
        }
    });
  }

  public setChoice(choice: PlanetChoice): this {
    this.cardChoice = choice;
    this.title.setText(choice.name.toUpperCase());
    this.description.setText(choice.description);

    if (this.scene.textures.exists(choice.imageKey)) {
        this.image.setVisible(true);
        this.image.setTexture(choice.imageKey);
        const texture = this.scene.textures.get(choice.imageKey).getSourceImage() as { width: number; height: number };
        const scale = Math.min(164 / texture.width, 150 / texture.height);
        this.image.setScale(scale).setAlpha(1);
    } else {
        this.image.setVisible(false);
    }
    return this;
  }
}

// Factory registration
Phaser.GameObjects.GameObjectFactory.register("uiPlanetCard", function (this: Phaser.GameObjects.GameObjectFactory, x: number, y: number, width: number, height: number) {
  const obj = new UIPlanetCard(this.scene, x, y, width, height);
  this.displayList.add(obj);
  return obj;
});

declare global {
  namespace Phaser.GameObjects {
    interface GameObjectFactory {
      uiPlanetCard(x: number, y: number, width: number, height: number): UIPlanetCard;
    }
  }
}
