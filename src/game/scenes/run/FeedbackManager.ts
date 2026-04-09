import type { RunState } from "../../types.js";
import type { RunRenderContext } from "./shared.js";
import { LAB_THEME, textStyle } from "../../ui/theme.js";
import { UIButton } from "../../ui/objects.js";
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

interface ToastUi {
  root: Phaser.GameObjects.Container;
  panel: Phaser.GameObjects.Container;
  accentBar: Phaser.GameObjects.Rectangle;
  labelText: Phaser.GameObjects.Text;
  messageText: Phaser.GameObjects.Text;
  image: Phaser.GameObjects.Image;
  closeButton: UIButton;
}

interface CombatUi {
  root: Phaser.GameObjects.Container;
  panel: Phaser.GameObjects.Container;
  accentBar: Phaser.GameObjects.Rectangle;
  badgeText: Phaser.GameObjects.Text;
  timerText: Phaser.GameObjects.Text;
  messageText: Phaser.GameObjects.Text;
  closeButton: UIButton;
}

export class FeedbackManager {
  private feedbackToast?: FeedbackToast;
  private feedbackToastTimer?: Phaser.Time.TimerEvent;
  private lastSeenSummary?: string;
  private lastToastSignature?: string;

  private combatFeedback?: CombatFeedbackEntry;
  private combatFeedbackQueue: CombatFeedbackEntry[] = [];
  private combatFeedbackTimer?: Phaser.Time.TimerEvent;
  private combatFeedbackTicker?: Phaser.Time.TimerEvent;
  private lastCombatSummarySignature?: string;

  private toastUi?: ToastUi;
  private toastUiSignature?: string;
  private combatUi?: CombatUi;
  private combatUiSignature?: string;

  constructor(
    private scene: Phaser.Scene,
    private layer: Phaser.GameObjects.Container,
    private onRender: () => void
  ) {}

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
    this.onRender();
  }

  renderFeedbackToast(width: number): void {
    if (!this.feedbackToast) {
      this.toastUi?.root.setVisible(false);
      return;
    }

    const hasImage = Boolean(this.feedbackToast.imageKey && this.scene.textures.exists(this.feedbackToast.imageKey));
    const toastWidth = Math.min(620, width - 120);
    const toastHeight = 94;
    const x = Math.floor((width - toastWidth) / 2);
    const y = 74;
    const accentColor = Phaser.Display.Color.HexStringToColor(this.feedbackToast.accent).color;
    const signature = [toastWidth, toastHeight].join(":");
    const feedbackSignature = [
      this.feedbackToast.message,
      this.feedbackToast.accent,
      this.feedbackToast.imageKey ?? "",
    ].join(":");

    this.ensureToastUi(signature, x, y, toastWidth, toastHeight);
    if (!this.toastUi) {
      return;
    }

    const textX = hasImage ? 148 : 28;
    const textWidth = hasImage ? toastWidth - 164 : toastWidth - 72;

    this.toastUi.root.setVisible(true).setPosition(x, y);
    this.toastUi.accentBar.setFillStyle(accentColor, 1);
    this.toastUi.labelText.setText("OUTCOME").setColor(this.feedbackToast.accent);
    this.toastUi.messageText
      .setText(this.feedbackToast.message)
      .setPosition(textX, hasImage ? 34 : 28)
      .setWordWrapWidth(textWidth);
    this.toastUi.closeButton.setPosition(toastWidth - 44, 10);
    this.toastUi.panel
      .setSize(toastWidth, toastHeight)
      .setInteractive(new Phaser.Geom.Rectangle(0, 0, toastWidth, toastHeight), Phaser.Geom.Rectangle.Contains);

    if (hasImage && this.feedbackToast.imageKey) {
      this.toastUi.image
        .setVisible(true)
        .setTexture(this.feedbackToast.imageKey)
        .setPosition(78, toastHeight / 2 + 2);

      const source = this.scene.textures.get(this.feedbackToast.imageKey).getSourceImage() as { width: number; height: number };
      const scale = Math.min(96 / source.width, 64 / source.height);
      this.toastUi.image.setScale(scale);

      if (this.lastToastSignature !== feedbackSignature) {
        this.scene.tweens.add({
          targets: this.toastUi.image,
          scaleX: scale * 1.08,
          scaleY: scale * 1.08,
          duration: 220,
          yoyo: true,
          ease: "Quad.easeOut",
        });
      }
    } else {
      this.toastUi.image.setVisible(false);
    }

    this.lastToastSignature = feedbackSignature;
  }

  private ensureToastUi(signature: string, x: number, y: number, width: number, height: number): void {
    if (this.toastUi && this.toastUiSignature === signature) {
      return;
    }

    this.toastUi?.root.destroy();

    const root = new Phaser.GameObjects.Container(this.scene, x, y);
    this.layer.add(root);

    makeRectangle(this.scene, -4, 4, width + 8, height + 8, 0x02060a, 0.55, root).setOrigin(0);
    const panel = createPanel(this.scene, 0, 0, width, height, 0x0f2230, LAB_THEME.border, root);
    const accentBar = makeRectangle(this.scene, 10, 10, 6, height - 20, LAB_THEME.accentFill, 1, root).setOrigin(0);
    const labelText = makeText(this.scene, 28, 12, "OUTCOME", textStyle(8, LAB_THEME.accent), root);
    const messageText = makeText(this.scene, 28, 34, "", textStyle(9, LAB_THEME.text, "left", width - 72), root);
    const image = makeImage(this.scene, 78, height / 2 + 2, "feedback-win", root).setOrigin(0.5).setVisible(false);
    const closeButton = createButton(this.scene, {
      x: width - 44,
      y: 10,
      width: 24,
      height: 24,
      label: "X",
      detail: "",
      onClick: () => this.clearFeedbackToast(),
      fill: 0x284861,
      border: LAB_THEME.borderSoft,
    }, root);

    panel
      .setSize(width, height)
      .setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains)
      .on("pointerdown", () => this.clearFeedbackToast());

    this.toastUi = { root, panel, accentBar, labelText, messageText, image, closeButton };
    this.toastUiSignature = signature;
  }

  private clearFeedbackToast(): void {
    this.feedbackToast = undefined;
    this.feedbackToastTimer?.remove(false);
    this.feedbackToastTimer = undefined;
    this.lastToastSignature = undefined;
    this.toastUi?.root.setVisible(false);
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

  syncCombatFeedback(state: RunState): void {
    if (state.phase !== "combat" || !state.combat) {
      this.lastCombatSummarySignature = undefined;
      this.combatFeedback = undefined;
      this.combatFeedbackQueue = [];
      this.combatFeedbackTimer?.remove(false);
      this.combatFeedbackTimer = undefined;
      this.combatFeedbackTicker?.remove(false);
      this.combatFeedbackTicker = undefined;
      this.combatUi?.root.setVisible(false);
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

  renderCombatFeedback(ctx: RunRenderContext): void {
    if (!this.combatFeedback) {
      this.combatUi?.root.setVisible(false);
      return;
    }

    const popupWidth = Math.min(360, ctx.contentInner.width - 120);
    const popupHeight = 84;
    const x = Math.floor((ctx.width - popupWidth) / 2);
    const y = Math.floor(ctx.layout.header.y + ctx.layout.header.height + 8);
    const accentColor = Phaser.Display.Color.HexStringToColor(this.combatFeedback.accent).color;
    const badge = this.combatFeedback.actor === "enemy" ? "ENEMY" : "YOU";
    const remainingSeconds = Math.max(0, this.combatFeedbackTimer?.getRemainingSeconds() ?? 0);
    const signature = [popupWidth, popupHeight].join(":");

    this.ensureCombatUi(signature, x, y, popupWidth, popupHeight);
    if (!this.combatUi) {
      return;
    }

    this.combatUi.root.setVisible(true).setPosition(x, y);
    this.combatUi.accentBar.setFillStyle(accentColor, 1);
    this.combatUi.badgeText.setText(badge).setColor(this.combatFeedback.accent);
    this.combatUi.timerText.setText(`${remainingSeconds.toFixed(1)}s`).setPosition(popupWidth - 82, 10);
    this.combatUi.messageText
      .setText(this.combatFeedback.message)
      .setWordWrapWidth(popupWidth - 52);
    this.combatUi.closeButton.setPosition(popupWidth - 42, 8);
    this.combatUi.panel
      .setSize(popupWidth, popupHeight)
      .setInteractive(new Phaser.Geom.Rectangle(0, 0, popupWidth, popupHeight), Phaser.Geom.Rectangle.Contains);
  }

  private ensureCombatUi(signature: string, x: number, y: number, width: number, height: number): void {
    if (this.combatUi && this.combatUiSignature === signature) {
      return;
    }

    this.combatUi?.root.destroy();

    const root = new Phaser.GameObjects.Container(this.scene, x, y);
    this.layer.add(root);

    makeRectangle(this.scene, -4, 4, width + 8, height + 8, 0x02060a, 0.5, root).setOrigin(0);
    const panel = createPanel(this.scene, 0, 0, width, height, 0x13212b, LAB_THEME.borderSoft, root);
    const accentBar = makeRectangle(this.scene, 10, 10, 6, height - 20, LAB_THEME.accentFill, 1, root).setOrigin(0);
    const badgeText = makeText(this.scene, 26, 10, "YOU", textStyle(8, LAB_THEME.accent), root);
    const timerText = makeText(this.scene, width - 82, 10, "0.0s", textStyle(8, LAB_THEME.textMuted), root);
    const messageText = makeText(this.scene, 26, 34, "", textStyle(8, LAB_THEME.text, "left", width - 52), root).setLineSpacing(-2);
    const closeButton = createButton(this.scene, {
      x: width - 42,
      y: 8,
      width: 24,
      height: 24,
      label: "X",
      detail: "",
      onClick: () => this.clearCombatFeedback(),
      fill: 0x284861,
      border: LAB_THEME.borderSoft,
    }, root);

    panel
      .setSize(width, height)
      .setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains)
      .on("pointerdown", () => this.clearCombatFeedback());

    this.combatUi = { root, panel, accentBar, badgeText, timerText, messageText, closeButton };
    this.combatUiSignature = signature;
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
      callback: () => this.updateCombatCountdown(),
    });
    this.onRender();
  }

  private updateCombatCountdown(): void {
    if (!this.combatFeedback || !this.combatFeedbackTimer) {
      this.combatFeedbackTicker?.remove(false);
      this.combatFeedbackTicker = undefined;
      return;
    }

    this.combatUi?.timerText.setText(`${Math.max(0, this.combatFeedbackTimer.getRemainingSeconds()).toFixed(1)}s`);
  }

  private clearCombatFeedback(): void {
    this.combatFeedback = undefined;
    this.combatFeedbackTimer?.remove(false);
    this.combatFeedbackTimer = undefined;
    this.combatFeedbackTicker?.remove(false);
    this.combatFeedbackTicker = undefined;
    this.combatUi?.root.setVisible(false);
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
    this.toastUi?.root.destroy();
    this.combatUi?.root.destroy();
  }
}
