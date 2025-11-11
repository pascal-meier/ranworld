import { BaseScene } from "../../../core/scenes/BaseScene.js";
import { Box } from "../objects/Box.js";
import { LootyBoxUi } from "../objects/UI.js";
import { LootyBoxController } from "../systems/Controller.js";
import {
  PhaseManager,
  type FlowState,
  type TransparencyPhaseDefinition,
} from "../systems/PhaseManager.js";
import { LootEffect } from "../objects/LootEffect.js";
import {
  generateLoot,
  RARITY_COLORS,
  getOddsForTier,
  type LootResult,
  type BoxTier,
} from "../systems/RNGparcel.js";

export class LootyBoxGameScene extends BaseScene {
  private hud!: LootyBoxUi;
  private controller!: LootyBoxController;
  private boxes: Box[] = [];
  private background!: Phaser.GameObjects.Image;
  private phases!: PhaseManager;

  constructor() {
    super("LootyBoxGameScene");
  }

  create(): void {
    this.createBackground();
    this.hud = new LootyBoxUi(this, 100, () => this.phases?.cycleTransparencyPhase());
    this.controller = new LootyBoxController(this);
    this.spawnBoxes();
    this.phases = new PhaseManager(this, {
      onFlowStateChange: (state) => this.handleFlowStateChanged(state),
      onTransparencyChange: (phase) => this.handleTransparencyChanged(phase),
    });
    this.phases.enterReady();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.phases.destroy());
    this.refreshPhaseDetail();
    super.create();
  }

  private createBackground(): void {
    this.background = this.add.image(0, 0, "base-bg").setOrigin(0.5);
  }

  private spawnBoxes(): void {
    const frames = [0, 2, 4];
    const { width, height } = this.scale;
    this.boxes = frames.map(
      (f, i) => new Box(this, width / 2, height / 2, f, i + 1, (b) => this.onBoxClicked(b))
    );
    this.layoutBoxes(this.scale.gameSize.width, this.scale.gameSize.height);
    this.syncBoxInteractivity();
  }

  private onBoxClicked(box: Box): void {
    if (!this.phases.canInteract()) return;
    this.phases.enterReveal();
    const loot = generateLoot(this, box.getTier(), box.x, box.y + 100);
    this.presentTransparencyFeedback(loot);
    LootEffect.spawn(this, box, RARITY_COLORS[loot.rarity]);
    const won = this.controller.addLoot(loot.value);
    this.hud.updateScore(this.controller.getScore());
    this.hud.updateTitle(`${loot.rarity.toUpperCase()} +${loot.value}`);
    if (won) this.winGame();
    else this.phases.startCooldown(() => this.resetBoxes());
  }

  private resetBoxes(): void {
    this.boxes.forEach(b => b.destroy());
    this.spawnBoxes();
  }

  private winGame(): void {
    this.phases.enterWin();
    this.controller.clear();
    this.hud.updateTitle("YOU WIN!");
    this.time.delayedCall(3000, () => this.scene.start("MainMenuScene"));
  }

  protected onResize(gameSize: Phaser.Structs.Size): void {
    const { width, height } = gameSize;
    this.background?.setPosition(width / 2, height / 2).setDisplaySize(width, height);
    this.layoutBoxes(width, height);
  }

  private layoutBoxes(width: number, height: number): void {
    if (!this.boxes.length) return;
    const spacing = Math.min(width * 0.25, 250);
    const centerY = height * 0.55;
    const baseScale = Phaser.Math.Clamp(Math.min(width, height) / 260, 1.4, 3.2);
    const middleIndex = (this.boxes.length - 1) / 2;
    this.boxes.forEach((box, index) => {
      const offset = (index - middleIndex) * spacing;
      box.setPosition(width / 2 + offset, centerY);
      box.setBaseScale(baseScale);
    });
  }

  private handleFlowStateChanged(_state: FlowState): void {
    this.syncBoxInteractivity();
  }

  private handleTransparencyChanged(phase: TransparencyPhaseDefinition): void {
    this.hud.setPhaseInfo(phase);
    this.refreshPhaseDetail();
  }

  private syncBoxInteractivity(): void {
    if (!this.boxes.length || !this.phases) return;
    const interactable = this.phases.canInteract();
    this.boxes.forEach(box => {
      if (interactable) box.setInteractive({ useHandCursor: true });
      else box.disableInteractive();
    });
  }

  private refreshPhaseDetail(): void {
    if (!this.phases) return;
    const active = this.phases.getTransparencyPhase();
    if (active.key === "blind") {
      this.hud.setPhaseDetail("Phase 1 versteckt alle Chancen. Nur das Ergebnis zaehlt.");
    } else if (active.key === "odds") {
      this.hud.setPhaseDetail(this.formatOddsOverview());
    } else {
      this.hud.setPhaseDetail("Phase 3 zeigt dir den exakten Zufallswert nach dem Klick.");
    }
  }

  private presentTransparencyFeedback(result: LootResult): void {
    const phase = this.phases.getTransparencyPhase();
    if (phase.key === "blind") {
      this.hud.setPhaseDetail("Ergebnis verborgen - wechsle die Phase fuer mehr Infos.");
      return;
    }

    if (phase.key === "odds") {
      this.hud.setPhaseDetail(this.formatOddsForTier(result.tier));
      return;
    }

    const range = result.ranges.find(r => r.rarity === result.rarity);
    if (!range) {
      this.hud.setPhaseDetail("Roll ermittelt - keine Detaildaten verfuegbar.");
      return;
    }

    const rollValue = result.roll.toFixed(2);
    const min = range.min.toFixed(1);
    const max = range.max.toFixed(1);
    const rarityLabel = result.rarity.toUpperCase();
    this.hud.setPhaseDetail(
      `Roll ${rollValue} lag im Fenster [${min}, ${max}) -> ${rarityLabel}`
    );
  }

  private formatOddsOverview(): string {
    const tiers: BoxTier[] = [1, 2, 3];
    return tiers
      .map(tier => this.formatOddsForTier(tier))
      .join("\n");
  }

  private formatOddsForTier(tier: BoxTier): string {
    const ranges = getOddsForTier(tier);
    const oddsText = ranges
      .map(range => `${range.rarity}: ${range.chance}%`)
      .join(" | ");
    return `Tier ${tier}: ${oddsText}`;
  }
}

