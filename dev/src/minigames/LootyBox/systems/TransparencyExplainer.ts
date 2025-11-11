import type { LootyBoxUi } from "../objects/UI.js";
import type { LootResult, BoxTier } from "./RNGparcel.js";
import { getOddsForTier } from "./RNGparcel.js";
import { PhaseManager } from "./PhaseManager.js";

/**
 * Centralizes all transparency-related HUD text so GameScene stays slim.
 */
export class TransparencyExplainer {
  /**
   * ℹ️ Holds references to the phase flow and HUD so transparency text can be generated centrally. ℹ️
   */
  constructor(private phases: PhaseManager, private hud: LootyBoxUi) {}

  /**
   * ℹ️ Updates the HUD detail text based on the currently active transparency phase. ℹ️
   */
  refreshPhaseDetail(): void {
    const active = this.phases.getTransparencyPhase();
    if (active.key === "blind") {
      this.hud.setPhaseDetail("Phase 1 hides every chance. Only the outcome matters.");
      return;
    }

    if (active.key === "odds") {
      this.hud.setPhaseDetail(this.formatOddsOverview());
      return;
    }

    this.hud.setPhaseDetail("Phase 3 reveals the exact roll after your click.");
  }

  /**
   * ℹ️ Presents contextual feedback for a loot result depending on the transparency phase. ℹ️
   */
  presentTransparencyFeedback(result: LootResult): void {
    const phase = this.phases.getTransparencyPhase();
    if (phase.key === "blind") {
      this.hud.setPhaseDetail("Outcome hidden - switch the phase for more info.");
      return;
    }

    if (phase.key === "odds") {
      this.hud.setPhaseDetail(this.formatOddsForTier(result.tier));
      return;
    }

    this.hud.setPhaseDetail(this.formatRollDetail(result));
  }

  /**
   * ℹ️ Formats the numeric roll and its threshold window for the full transparency phase. ℹ️
   */
  private formatRollDetail(result: LootResult): string {
    const range = result.ranges.find((r) => r.rarity === result.rarity);
    if (!range) return "Roll resolved - no additional details available.";

    const rollValue = result.roll.toFixed(2);
    const min = range.min.toFixed(1);
    const max = range.max.toFixed(1);
    const rarityLabel = result.rarity.toUpperCase();
    return `Roll ${rollValue} stayed inside [${min}, ${max}) -> ${rarityLabel}`;
  }

  /**
   * ℹ️ Produces a multi-line overview of the drop odds for every box tier. ℹ️
   */
  private formatOddsOverview(): string {
    const tiers: BoxTier[] = [1, 2, 3];
    return tiers.map((tier) => this.formatOddsForTier(tier)).join("\n");
  }

  /**
   * ℹ️ Outputs percent chances for a single tier in a concise string. ℹ️
   */
  formatOddsForTier(tier: BoxTier): string {
    const ranges = getOddsForTier(tier);
    const oddsText = ranges.map((range) => `${range.rarity}: ${range.chance}%`).join(" | ");
    return `Tier ${tier}: ${oddsText}`;
  }
}
