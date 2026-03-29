import type { RunState } from "../../types.js";
import type { RunRenderContext } from "./shared.js";

export abstract class PhaseView {
  public container: Phaser.GameObjects.Container;

  constructor(
    protected scene: Phaser.Scene,
    protected ctx: RunRenderContext
  ) {
    this.container = scene.add.container(0, 0);
    this.ctx.phaseRoot.add(this.container);
    this.container.setVisible(false);
  }

  public abstract build(): void;
  public abstract updateState(state: RunState, extra?: any): void;

  show(animated = false): void {
    this.scene.tweens.killTweensOf(this.container);
    
    if (animated) {
      this.container.setAlpha(0).setY(10).setVisible(true);
      this.scene.tweens.add({
        targets: this.container,
        alpha: 1,
        y: 0,
        duration: 250,
        ease: "Cubic.out"
      });
    } else {
      this.container.setAlpha(1).setY(0).setVisible(true);
    }
  }

  hide(animated = false): void {
    this.scene.tweens.killTweensOf(this.container);

    if (animated) {
      this.scene.tweens.add({
        targets: this.container,
        alpha: 0,
        y: -10,
        duration: 200,
        ease: "Cubic.in",
        onComplete: () => this.container.setVisible(false)
      });
    } else {
      this.container.setVisible(false);
    }
  }

  destroy(): void {
    this.container.destroy();
  }
}
