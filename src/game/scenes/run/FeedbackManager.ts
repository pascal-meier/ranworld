import type { RunState } from "../../types.js";
import type { RunRenderContext } from "./shared.js";
import { LAB_THEME, textStyle } from "../../ui/theme.js";
import { createButton, createPanel } from "../../ui/widgets.js";
import { makeImage, makeRectangle, makeText } from "../../ui/display.js";

interface FeedbackToast {
  message: string;
  accent: string;
  imageKey?: string;
}

interface CombatFeedbackEntry {
  message: string;
  accent: string;
  actor: "player" | "enemy";
}

export class FeedbackManager {
  private feedbackToast?: FeedbackToast;
  private feedbackToastTimer?: Phaser.Time.TimerEvent;
  private lastSeenSummary?: string;

  private combatFeedback?: CombatFeedbackEntry;
  private combatFeedbackQueue: CombatFeedbackEntry[] = [];
  private combatFeedbackTimer?: Phaser.Time.TimerEvent;
  private combatFeedbackTicker?: Phaser.Time.TimerEvent;
  private lastCombatSummarySignature?: string;

  private onRender: () => void;

  constructor(
    private scene: Phaser.Scene,
    onRender: () => void
  ) {
    this.onRender = onRender;
  }

  // ── Toast System (non-combat) ──────────────────────────

  syncFeedbackToast(state: RunState): void {
    if (this.lastSeenSummary === undefined) {
      this.lastSeenSummary = state.summary;
      return;
    }

    if (state.summary === this.lastSeenSummary) {
      return;
    }

    this.lastSeenSummary = state.summary;

    if (state.phase === "combat") {
      return;
    }

    if (!this.shouldShowFeedbackToast(state.summary)) {
      return;
    }

    this.feedbackToast = {
      message: state.summary,
      accent: this.getFeedbackAccent(state.summary),
      imageKey: this.getFeedbackImageKey(state.summary),
    };
    this.feedbackToastTimer?.remove(false);
    this.feedbackToastTimer = this.scene.time.delayedCall(5200, () => this.clearFeedbackToast());
  }

  renderFeedbackToast(width: number, overlayLayer: Phaser.GameObjects.Container): void {
    if (!this.feedbackToast) {
      return;
    }

    const hasImage = Boolean(this.feedbackToast.imageKey && this.scene.textures.exists(this.feedbackToast.imageKey));
    const toastWidth = Math.min(hasImage ? 620 : 520, width - 120);
    const toastHeight = hasImage ? 94 : 62;
    const x = Math.floor((width - toastWidth) / 2);
    const y = 74;
    const accentColor = Phaser.Display.Color.HexStringToColor(this.feedbackToast.accent).color;

    makeRectangle(this.scene, x - 4, y + 4, toastWidth + 8, toastHeight + 8, 0x02060a, 0.55, overlayLayer).setOrigin(0);
    const panel = createPanel(this.scene, x, y, toastWidth, toastHeight, 0x0f2230, LAB_THEME.border, overlayLayer);
    panel
      .setSize(toastWidth, toastHeight)
      .setInteractive(new Phaser.Geom.Rectangle(0, 0, toastWidth, toastHeight), Phaser.Geom.Rectangle.Contains)
      .on("pointerdown", () => this.clearFeedbackToast());
    makeRectangle(this.scene, x + 10, y + 10, 6, toastHeight - 20, accentColor, 1, overlayLayer).setOrigin(0);
    makeText(this.scene, x + 28, y + 12, "OUTCOME", textStyle(8, this.feedbackToast.accent), overlayLayer);

    let textX = x + 28;
    let textWidth = toastWidth - 44;

    if (hasImage && this.feedbackToast.imageKey) {
      const image = makeImage(this.scene, x + 78, y + toastHeight / 2 + 2, this.feedbackToast.imageKey, overlayLayer).setOrigin(0.5);
      const source = this.scene.textures.get(this.feedbackToast.imageKey).getSourceImage() as { width: number; height: number };
      const scale = Math.min(96 / source.width, 64 / source.height);
      image.setScale(scale);
      this.scene.tweens.add({
        targets: image,
        scaleX: scale * 1.08,
        scaleY: scale * 1.08,
        duration: 220,
        yoyo: true,
        ease: "Quad.easeOut",
      });
      textX = x + 148;
      textWidth = toastWidth - 164;
    }

    makeText(
      this.scene,
      textX,
      y + (hasImage ? 34 : 28),
      this.feedbackToast.message,
      textStyle(9, LAB_THEME.text, "left", textWidth),
      overlayLayer
    );

    createButton(this.scene, {
      x: x + toastWidth - 44,
      y: y + 10,
      width: 24,
      height: 24,
      label: "X",
      detail: "",
      onClick: () => this.clearFeedbackToast(),
      fill: 0x284861,
      border: LAB_THEME.borderSoft,
    }, overlayLayer);
  }

  private clearFeedbackToast(): void {
    this.feedbackToast = undefined;
    this.feedbackToastTimer?.remove(false);
    this.feedbackToastTimer = undefined;
    this.onRender();
  }

  private shouldShowFeedbackToast(summary: string): boolean {
    const trimmed = summary.trim();

    if (trimmed.length === 0) {
      return false;
    }

    const suppressedStarts = [
      "Choose ",
      "Pick ",
      "Final approach",
      "Boss encounter",
      "Landing Drone engaged",
      "Planet selected",
    ];

    if (suppressedStarts.some((prefix) => trimmed.startsWith(prefix))) {
      return false;
    }

    if (trimmed.includes("engaged at")) {
      return false;
    }

    return true;
  }

  private getFeedbackAccent(summary: string): string {
    const lower = summary.toLowerCase();

    if (
      lower.includes("backfired") ||
      lower.includes("damage") ||
      lower.includes("missed") ||
      lower.includes("collapsed") ||
      lower.includes("lost") ||
      lower.includes("fled")
    ) {
      return LAB_THEME.danger;
    }

    if (
      lower.includes("succeeded") ||
      lower.includes("reward") ||
      lower.includes("selected") ||
      lower.includes("defeated") ||
      lower.includes("blocked") ||
      lower.includes("healed") ||
      lower.includes("+")
    ) {
      return LAB_THEME.positive;
    }

    return LAB_THEME.accent;
  }

  private getFeedbackImageKey(summary: string): string | undefined {
    const lower = summary.toLowerCase();

    if (
      lower.includes("hit for") ||
      lower.includes("missed") ||
      lower.includes("enemy dealt") ||
      lower.includes("fully blocked") ||
      lower.includes("guard prepared") ||
      lower.includes("focus stored") ||
      lower.includes("stabilize spent")
    ) {
      return undefined;
    }

    if (
      lower.includes("backfired") ||
      lower.includes("damage") ||
      lower.includes("missed") ||
      lower.includes("collapsed") ||
      lower.includes("lost") ||
      lower.includes("fled")
    ) {
      return "feedback-fail";
    }

    if (
      lower.includes("succeeded") ||
      lower.includes("reward") ||
      lower.includes("selected") ||
      lower.includes("defeated") ||
      lower.includes("blocked") ||
      lower.includes("healed") ||
      lower.includes("+")
    ) {
      return "feedback-win";
    }

    return undefined;
  }

  // ── Combat Feedback System ─────────────────────────────

  syncCombatFeedback(state: RunState): void {
    if (state.phase !== "combat" || !state.combat) {
      this.lastCombatSummarySignature = undefined;
      this.combatFeedback = undefined;
      this.combatFeedbackQueue = [];
      this.combatFeedbackTimer?.remove(false);
      this.combatFeedbackTimer = undefined;
      this.combatFeedbackTicker?.remove(false);
      this.combatFeedbackTicker = undefined;
      return;
    }

    const summaryLines = state.combat.lastSummary.filter((line) => !line.startsWith("Entering "));
    const signature = summaryLines.join("|");

    if (!signature) {
      this.lastCombatSummarySignature = signature;
      return;
    }

    if (signature === this.lastCombatSummarySignature) {
      return;
    }

    this.lastCombatSummarySignature = signature;

    for (const line of summaryLines) {
      this.combatFeedbackQueue.push({
        message: line,
        accent: this.getCombatFeedbackAccent(line),
        actor: line.startsWith("Enemy ") || line.startsWith("Incoming ") ? "enemy" : "player",
      });
    }

    this.startNextCombatFeedback();
  }

  areCombatActionsLocked(): boolean {
    return Boolean(this.combatFeedback || this.combatFeedbackQueue.length > 0);
  }

  renderCombatFeedback(ctx: RunRenderContext, overlayLayer: Phaser.GameObjects.Container): void {
    if (!this.combatFeedback) {
      return;
    }

    const popupWidth = Math.min(360, ctx.contentInner.width - 120);
    const popupHeight = 72;
    const x = Math.floor((ctx.width - popupWidth) / 2);
    const y = Math.floor(ctx.contentInner.y + 150);
    const accentColor = Phaser.Display.Color.HexStringToColor(this.combatFeedback.accent).color;
    const badge = this.combatFeedback.actor === "enemy" ? "ENEMY" : "YOU";
    const remainingSeconds = Math.max(0, this.combatFeedbackTimer?.getRemainingSeconds() ?? 0);

    makeRectangle(this.scene, x - 4, y + 4, popupWidth + 8, popupHeight + 8, 0x02060a, 0.5, overlayLayer).setOrigin(0);
    const panel = createPanel(this.scene, x, y, popupWidth, popupHeight, 0x13212b, LAB_THEME.borderSoft, overlayLayer);
    panel
      .setSize(popupWidth, popupHeight)
      .setInteractive(new Phaser.Geom.Rectangle(0, 0, popupWidth, popupHeight), Phaser.Geom.Rectangle.Contains)
      .on("pointerdown", () => this.clearCombatFeedback());
    makeRectangle(this.scene, x + 10, y + 10, 6, popupHeight - 20, accentColor, 1, overlayLayer).setOrigin(0);
    makeText(this.scene, x + 26, y + 10, badge, textStyle(8, this.combatFeedback.accent), overlayLayer);
    makeText(this.scene, x + popupWidth - 162, y + 10, `${remainingSeconds.toFixed(1)}s`, textStyle(8, LAB_THEME.textMuted), overlayLayer);
    createButton(this.scene, {
      x: x + popupWidth - 112,
      y: y + 8,
      width: 96,
      height: 24,
      label: "SCHLIESSEN",
      detail: "",
      onClick: () => this.clearCombatFeedback(),
      fill: 0x284861,
      border: LAB_THEME.borderSoft,
    }, overlayLayer);
    makeText(
      this.scene,
      x + 26,
      y + 34,
      this.combatFeedback.message,
      textStyle(8, LAB_THEME.text, "left", popupWidth - 138),
      overlayLayer
    ).setLineSpacing(-2);
  }

  private startNextCombatFeedback(): void {
    if (this.combatFeedback || this.combatFeedbackQueue.length === 0) {
      return;
    }

    const nextPopup = this.combatFeedbackQueue.shift();
    if (!nextPopup) {
      return;
    }

    this.combatFeedback = nextPopup;
    this.combatFeedbackTimer?.remove(false);
    this.combatFeedbackTicker?.remove(false);
    this.combatFeedbackTimer = this.scene.time.delayedCall(1800, () => this.clearCombatFeedback());
    this.combatFeedbackTicker = this.scene.time.addEvent({
      delay: 100,
      loop: true,
      callback: () => {
        if (!this.combatFeedback || !this.combatFeedbackTimer) {
          this.combatFeedbackTicker?.remove(false);
          this.combatFeedbackTicker = undefined;
          return;
        }

        this.onRender();
      },
    });
    this.onRender();
  }

  private clearCombatFeedback(): void {
    this.combatFeedback = undefined;
    this.combatFeedbackTimer?.remove(false);
    this.combatFeedbackTimer = undefined;
    this.combatFeedbackTicker?.remove(false);
    this.combatFeedbackTicker = undefined;
    this.startNextCombatFeedback();
    this.onRender();
  }

  private getCombatFeedbackAccent(summary: string): string {
    const lower = summary.toLowerCase();

    if (lower.startsWith("enemy ") || lower.includes("incoming damage")) {
      return LAB_THEME.danger;
    }

    if (lower.includes("missed")) {
      return LAB_THEME.danger;
    }

    if (
      lower.includes("hit for") ||
      lower.includes("guard prepared") ||
      lower.includes("focus stored") ||
      lower.includes("stabilize spent") ||
      lower.includes("fully blocked")
    ) {
      return LAB_THEME.positive;
    }

    return LAB_THEME.accent;
  }

  destroy(): void {
    this.feedbackToastTimer?.remove(false);
    this.combatFeedbackTimer?.remove(false);
    this.combatFeedbackTicker?.remove(false);
  }
}
