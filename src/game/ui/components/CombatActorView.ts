import { LAB_THEME, textStyle } from "../theme.js";
import { makeFrameImage, makeImage, makeRectangle, makeText } from "../display.js";
import { createPanel } from "../widgets.js";

export class UICombatActor extends Phaser.GameObjects.Container {
  private hpText: Phaser.GameObjects.Text;
  private guardText: Phaser.GameObjects.Text;
  private focusText: Phaser.GameObjects.Text;
  private roundText?: Phaser.GameObjects.Text;
  private intentText?: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    title: string,
    titleColor: string,
    isPlayer: boolean
  ) {
    super(scene, x, y);

    // Stat Background
    createPanel(scene, 0, 0, width, 64, 0x1a3342, 0x3a6174, this);
    makeText(scene, 12, 10, title, textStyle(8, titleColor), this);
    
    // Stats Rows
    let px = 12;
    this.hpText = this.drawStatIcon(12, 28, "icon-hp", "0/0");
    this.guardText = this.drawStatIcon(70, 28, "icon-guard", "0");
    this.focusText = this.drawStatIcon(120, 28, "icon-focus", "0");
    
    if (!isPlayer) {
        this.roundText = makeText(scene, 180, 27, "Round 1", textStyle(8, LAB_THEME.textMuted), this);
        this.intentText = makeText(scene, 12, 43, "Intent 0", textStyle(8, LAB_THEME.textMuted), this);
    } else {
        makeText(scene, 12, 44, "Charges: 0", textStyle(8, LAB_THEME.textMuted), this);
    }
  }

  private drawStatIcon(x: number, y: number, frame: string, text: string): Phaser.GameObjects.Text {
    if (this.scene.textures.exists("ui-icons")) {
        makeFrameImage(this.scene, x, y + 4, "ui-icons", frame, this).setDisplaySize(12, 12).setOrigin(0, 0.5);
        x += 16;
    }
    return makeText(this.scene, x, y - 1, text, textStyle(8, LAB_THEME.text), this);
  }

  public updateStats(hp: number, maxHp: number, guard: number, focus: number, charges?: number): this {
    this.hpText.setText(`${hp}/${maxHp}`);
    this.guardText.setText(`${guard}`);
    this.focusText.setText(`${focus}`);
    return this;
  }
}

// Factory registration
Phaser.GameObjects.GameObjectFactory.register("uiCombatActor", function (this: Phaser.GameObjects.GameObjectFactory, x: number, y: number, width: number, height: number, title: string, titleColor: string, isPlayer: boolean) {
  const obj = new UICombatActor(this.scene, x, y, width, height, title, titleColor, isPlayer);
  this.displayList.add(obj);
  return obj;
});

declare global {
  namespace Phaser.GameObjects {
    interface GameObjectFactory {
      uiCombatActor(x: number, y: number, width: number, height: number, title: string, titleColor: string, isPlayer: boolean): UICombatActor;
    }
  }
}
