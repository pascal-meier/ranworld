import { BaseScene } from "../../../core/scenes/BaseScene.js";
import type { Box } from "../objects/Box.js";
import { LootyBoxUi } from "../objects/UI.js";
import { LootyBoxController } from "../systems/Controller.js";
import {
  PhaseManager,
  type FlowState,
  type TransparencyPhaseDefinition,
} from "../systems/PhaseManager.js";
import { LootEffect } from "../objects/LootEffect.js";
import { generateLoot, RARITY_COLORS, type BoxTier } from "../systems/RNGparcel.js";
import { BoxField } from "../systems/BoxField.js";
import { TransparencyExplainer } from "../systems/TransparencyExplainer.js";

/**
 * ℹ️ Central entry point for the LootyBox minigame focusing on flow orchestration. ℹ️
 */
export class LootyBoxGameScene extends BaseScene {
  private hud!: LootyBoxUi;
  private controller!: LootyBoxController;
  private background!: Phaser.GameObjects.Image;
  private phases?: PhaseManager;
  private boxField?: BoxField;
  private explainer?: TransparencyExplainer;

  constructor() {
    super("LootyBoxGameScene");
  }

  /**
   * ℹ️ Boots every subsystem and transitions the phase manager into the ready state. ℹ️
   */
  create(): void {
    // Boot sequence: background, HUD, and interaction systems in a clear order.
    this.createBackground();
    this.hud = new LootyBoxUi(this, 100, () => this.phases?.cycleTransparencyPhase());
    this.controller = new LootyBoxController(this);
    this.boxField = new BoxField(this, { onSelect: (box) => this.onBoxClicked(box) });
    this.boxField.spawn();

    this.phases = new PhaseManager(this, {
      onFlowStateChange: (state) => this.handleFlowStateChanged(state),
      onTransparencyChange: (phase) => this.handleTransparencyChanged(phase),
    });
    this.explainer = new TransparencyExplainer(this.phases, this.hud);

    this.phases.enterReady();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanup());
    this.syncBoxInteractivity();
    this.explainer.refreshPhaseDetail();
    super.create();
  }

  /**
   * ℹ️ Creates the backdrop image and matches it to the current viewport. ℹ️
   */
  private createBackground(): void {
    const { width, height } = this.scale.gameSize;
    this.background = this.add
      .image(width / 2, height / 2, "base-bg")
      .setDisplaySize(width, height)
      .setOrigin(0.5);
  }

  /**
   * ℹ️ Handles a box interaction and runs the complete reveal flow. ℹ️
   */
  private onBoxClicked(box: Box): void {
    const phases = this.phases;
    if (!phases?.canInteract()) return;

    phases.enterReveal();
    const loot = generateLoot(this, box.getTier(), box.x, box.y + 100);
    this.explainer!.presentTransparencyFeedback(loot);
    LootEffect.spawn(this, box, RARITY_COLORS[loot.rarity]);

    const won = this.controller.addLoot(loot.value);
    this.hud.updateScore(this.controller.getScore());
    this.hud.updateTitle(`${loot.rarity.toUpperCase()} +${loot.value}`);

    // Phase state decides whether we keep playing or celebrate a win.
    if (won) this.winGame();
    else phases.startCooldown(() => this.resetBoxes());
  }

  /**
   * ℹ️ Respawns the box field after cooldown finishes. ℹ️
   */
  private resetBoxes(): void {
    this.boxField?.spawn();
    this.syncBoxInteractivity();
    this.updateOddsLabels();
  }

  /**
   * ℹ️ Handles the victory flow and schedules a return to the main menu. ℹ️
   */
  private winGame(): void {
    this.phases?.enterWin();
    this.controller.clear();
    this.hud.updateTitle("YOU WIN!");
    this.time.delayedCall(3000, () => this.scene.start("MainMenuScene"));
  }

  /**
   * ℹ️ Responds to resize events to keep the background and box layout aligned. ℹ️
   */
  protected onResize(gameSize: Phaser.Structs.Size): void {
    const { width, height } = gameSize;
    this.background?.setPosition(width / 2, height / 2).setDisplaySize(width, height);
    this.boxField?.layout(width, height);
  }

  /**
   * ℹ️ Syncs interactivity whenever the flow state changes. ℹ️
   */
  private handleFlowStateChanged(_state: FlowState): void {
    this.syncBoxInteractivity();
  }

  /**
   * ℹ️ Updates HUD messaging whenever the transparency phase changes. ℹ️
   */
  private handleTransparencyChanged(phase: TransparencyPhaseDefinition): void {
    this.hud.setPhaseInfo(phase);
    this.explainer?.refreshPhaseDetail();
    this.updateOddsLabels();
  }

  /**
   * ℹ️ Enables or disables the entire box field according to the flow state. ℹ️
   */
  private syncBoxInteractivity(): void {
    if (!this.phases || !this.boxField) return;
    this.boxField.setInteractivity(this.phases.canInteract());
  }

  /**
   * ℹ️ Cleans up helper instances when the scene shuts down. ℹ️
   */
  private cleanup(): void {
    this.phases?.destroy();
    this.phases = undefined;
    this.boxField?.clear();
    this.boxField = undefined;
    this.destroyExplainer();
  }

  /**
   * ℹ️ Shows or hides odds labels depending on the active transparency phase. ℹ️
   */
  private updateOddsLabels(): void {
    if (!this.phases || !this.boxField) return;
    if (this.phases.getTransparencyPhase().key === "odds" && this.explainer) {
      this.boxField.showOdds((tier) =>
        this.explainer!.formatOddsForTier(tier as BoxTier)
      );
    } else {
      this.boxField.hideOdds();
    }
  }

  private destroyExplainer(): void {
    this.explainer = undefined;
  }
}
