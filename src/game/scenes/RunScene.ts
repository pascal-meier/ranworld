import { createRunRenderContext, renderModifiersPanel } from "./run/shared.js";
import { renderPlanetSelectPhase } from "./run/planetSelectRenderer.js";
import { renderDraftPhase } from "./run/draftRenderer.js";
import { renderMapPhase } from "./run/mapRenderer.js";
import { renderCombatPhase } from "./run/combatRenderer.js";
import { renderEventPhase } from "./run/eventRenderer.js";
import { renderRewardPhase } from "./run/rewardRenderer.js";
import { renderRunEndPhase } from "./run/runEndRenderer.js";
import type { MechanicId, RunState, TutorialId } from "../types.js";
import { REROLL_SUPPLY_COST } from "../core/balance.js";
import { getMechanicDefinition } from "../mechanics/index.js";
import { createButton, createPanel } from "../ui/widgets.js";
import { LAB_THEME, textStyle } from "../ui/theme.js";
import type { ScreenLayout } from "../ui/layout.js";
import { getTutorialDefinition } from "../tutorials/catalog.js";
import { renderTutorialOverlay } from "../ui/tutorialOverlay.js";
import { makeImage, makeRectangle, makeText } from "../ui/display.js";
import { attachImageTooltip } from "../ui/tooltip.js";
import { BaseScene } from "./BaseScene.js";

export class RunScene extends BaseScene {
  private readonly handleChange = () => this.render();
  private readonly handleResize = () => this.render();
  private readonly handleToggleModifiers = () => {
    this.showModifiersPanel = !this.showModifiersPanel;
    this.render();
  };
  private readonly handleCloseModifiers = () => {
    if (!this.showModifiersPanel) {
      return;
    }

    this.showModifiersPanel = false;
    this.render();
  };
  private showModifiersPanel = false;
  private backgroundLayer?: Phaser.GameObjects.Container;
  private chromeLayer?: Phaser.GameObjects.Container;
  private phaseLayer?: Phaser.GameObjects.Container;
  private overlayLayer?: Phaser.GameObjects.Container;
  private tooltipLayer?: Phaser.GameObjects.Container;
  private archiveIcon?: Phaser.GameObjects.Image;
  private suppliesIcon?: Phaser.GameObjects.Image;
  private archiveText?: Phaser.GameObjects.Text;
  private suppliesText?: Phaser.GameObjects.Text;
  private hudPrimaryText?: Phaser.GameObjects.Text;
  private hudSecondaryText?: Phaser.GameObjects.Text;
  private upgradeTitleText?: Phaser.GameObjects.Text;
  private upgradeListLayer?: Phaser.GameObjects.Container;
  private layout?: ScreenLayout;
  private chromeSize?: { width: number; height: number };
  private lastSeenSummary?: string;
  private feedbackToast?: { message: string; accent: string; imageKey?: string };
  private feedbackToastTimer?: Phaser.Time.TimerEvent;
  private activeTutorialId?: TutorialId;
  private lastCombatSummarySignature?: string;
  private combatFeedback?: { message: string; accent: string; actor: "player" | "enemy" };
  private combatFeedbackQueue: Array<{ message: string; accent: string; actor: "player" | "enemy" }> = [];
  private combatFeedbackTimer?: Phaser.Time.TimerEvent;
  private combatFeedbackTicker?: Phaser.Time.TimerEvent;

  constructor() {
    super({ key: "RunScene" });
  }

  create(): void {
    this.backgroundLayer = this.add.container(0, 0);
    this.chromeLayer = this.add.container(0, 0);
    this.phaseLayer = this.add.container(0, 0);
    this.overlayLayer = this.add.container(0, 0);
    this.tooltipLayer = this.add.container(0, 0);
    this.backgroundLayer.setDepth(0);
    this.chromeLayer.setDepth(10);
    this.phaseLayer.setDepth(20);
    this.overlayLayer.setDepth(30);
    this.tooltipLayer.setDepth(100);

    this.lab.on("changed", this.handleChange);
    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize);

    this.input.keyboard?.on("keydown-M", this.handleToggleModifiers);
    this.input.keyboard?.on("keydown-ESC", this.handleCloseModifiers);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.lab.off("changed", this.handleChange);
      this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize);
      this.input.keyboard?.off("keydown-M", this.handleToggleModifiers);
      this.input.keyboard?.off("keydown-ESC", this.handleCloseModifiers);
    });

    this.render();
  }

  private render(): void {
    const state = this.lab.getState();
    if (!state) {
      this.scene.start("SetupScene");
      return;
    }

    this.syncTutorialState(state);
    this.syncCombatFeedback(state);

    if (!this.phaseLayer || !this.overlayLayer || !this.tooltipLayer) {
      return;
    }

    const ctx = createRunRenderContext(
      this,
      state,
      this.phaseLayer,
      this.overlayLayer,
      (nodeId) => this.lab.chooseNode(nodeId)
    );
    this.syncFeedbackToast(state);
    this.ensureChrome(ctx.width, ctx.height, ctx.layout);
    this.syncChrome(state);
    this.phaseLayer?.removeAll(true);
    this.overlayLayer?.removeAll(true);

    if (state.phase === "planet-select") {
      renderPlanetSelectPhase(ctx, (planetId) => this.lab.choosePlanet(planetId));
    } else if (state.phase === "draft" && state.draft) {
      renderDraftPhase(ctx, (mechanicId) => this.lab.chooseMechanic(mechanicId as MechanicId | null));
    } else if (state.phase === "map") {
      renderMapPhase(ctx, () => this.openTutorial("map-basics"));
    } else if (state.phase === "combat" && state.combat) {
      renderCombatPhase(
        ctx,
        (actionId) => this.lab.resolveCombatAction(actionId),
        () => this.lab.rerollCurrentOffer(),
        !this.areCombatActionsLocked()
      );
    } else if (state.phase === "event" && state.event) {
      renderEventPhase(
        ctx,
        (choiceId) => this.lab.resolveEventChoice(choiceId),
        () => this.lab.rerollCurrentOffer()
      );
    } else if (state.phase === "reward" && state.reward) {
      renderRewardPhase(
        ctx,
        (choiceId) => this.lab.chooseReward(choiceId),
        () => this.lab.rerollCurrentOffer()
      );
    } else {
      renderRunEndPhase(ctx, (mode) => {
        this.lab.returnToSetup(mode);
        this.scene.start("SetupScene");
      });
    }

    if (this.showModifiersPanel) {
      renderModifiersPanel(ctx, this.handleCloseModifiers);
    }

    this.renderActiveTutorial();
    if (state.phase === "combat") {
      this.renderCombatFeedback(ctx);
    } else {
      this.renderFeedbackToast(ctx.width);
    }
  }

  private ensureChrome(width: number, height: number, layout: ScreenLayout): void {
    const sizeChanged =
      this.chromeSize?.width !== width ||
      this.chromeSize?.height !== height ||
      !this.layout ||
      !this.archiveIcon ||
      !this.suppliesIcon ||
      !this.archiveText ||
      !this.suppliesText ||
      !this.hudPrimaryText ||
      !this.hudSecondaryText ||
      !this.upgradeTitleText ||
      !this.upgradeListLayer;

    if (!sizeChanged) {
      return;
    }

    this.chromeSize = { width, height };
    this.layout = layout;
    this.buildChrome(width, height, layout);
  }

  private buildChrome(width: number, height: number, layout: ScreenLayout): void {
    this.backgroundLayer?.removeAll(true);
    this.chromeLayer?.removeAll(true);
    this.tooltipLayer?.removeAll(true);

    if (!this.backgroundLayer || !this.chromeLayer || !this.tooltipLayer) {
      return;
    }

    makeRectangle(this, 0, 0, width, height, LAB_THEME.background, 1, this.backgroundLayer).setOrigin(0);
    makeRectangle(this, 0, 0, width, 40, 0x0b1a26, 1, this.backgroundLayer).setOrigin(0);

    createPanel(this, layout.header.x, layout.header.y, layout.header.width, layout.header.height, LAB_THEME.panel, LAB_THEME.borderSoft, this.chromeLayer);
    this.hudPrimaryText = makeText(
      this,
      layout.header.x + 12,
      layout.header.y + 10,
      "",
      textStyle(9, LAB_THEME.text, "left", width - 132),
      this.chromeLayer
    );
    this.hudSecondaryText = makeText(
      this,
      layout.header.x + 12,
      layout.header.y + 28,
      "",
      textStyle(8, LAB_THEME.textMuted, "left", width - 132),
      this.chromeLayer
    );

    const resourcesPanelHeight = 40;
    const upgradesPanelY = layout.footer.y + resourcesPanelHeight + 8;
    const upgradesPanelHeight = layout.footer.height - resourcesPanelHeight - 8;

    createPanel(
      this,
      layout.footer.x,
      layout.footer.y,
      layout.footer.width,
      resourcesPanelHeight,
      LAB_THEME.panel,
      LAB_THEME.borderSoft,
      this.chromeLayer
    );
    makeText(this, layout.footer.x + 16, layout.footer.y + 12, "RESOURCES", textStyle(8, LAB_THEME.textMuted), this.chromeLayer);
    if (this.textures.exists("archive-shard")) {
      this.archiveIcon = makeImage(
        this,
        layout.footer.x + 118,
        layout.footer.y + 22,
        "archive-shard",
        this.chromeLayer
      )
        .setTint(0x8ce5c2)
        .setScale(0.62)
        .setOrigin(0.5);
      attachImageTooltip(this, this.archiveIcon, this.tooltipLayer, {
        x: layout.footer.x + 92,
        y: layout.footer.y - 48,
        width: 200,
        text: "Collected this run. Banked when the run ends for next-run persistence bonuses.",
      });
    }
    makeText(this, layout.footer.x + 132, layout.footer.y + 14, "ARCHIVE", textStyle(7, LAB_THEME.textMuted), this.chromeLayer);
    this.archiveText = makeText(
      this,
      layout.footer.x + 184,
      layout.footer.y + 12,
      "",
      textStyle(8, LAB_THEME.positive, "left", 48),
      this.chromeLayer
    );
    if (this.textures.exists("supply-token")) {
      this.suppliesIcon = makeImage(
        this,
        layout.footer.x + 234,
        layout.footer.y + 22,
        "supply-token",
        this.chromeLayer
      )
        .setScale(0.66)
        .setOrigin(0.5);
      attachImageTooltip(this, this.suppliesIcon, this.tooltipLayer, {
        x: layout.footer.x + 208,
        y: layout.footer.y - 48,
        width: 188,
        text: `Run resource earned from fights and reward drops. Spend ${REROLL_SUPPLY_COST} on rerolls.`,
      });
    }
    makeText(this, layout.footer.x + 248, layout.footer.y + 14, "SUPPLIES", textStyle(7, LAB_THEME.textMuted), this.chromeLayer);
    this.suppliesText = makeText(
      this,
      layout.footer.x + 304,
      layout.footer.y + 12,
      "",
      textStyle(8, LAB_THEME.accent, "left", 48),
      this.chromeLayer
    );

    createPanel(
      this,
      layout.footer.x,
      upgradesPanelY,
      layout.footer.width,
      upgradesPanelHeight,
      LAB_THEME.panelAlt,
      LAB_THEME.borderSoft,
      this.chromeLayer
    );
    this.upgradeTitleText = makeText(this, layout.footer.x + 16, upgradesPanelY + 12, "ACTIVE UPGRADES", textStyle(9), this.chromeLayer);
    this.upgradeListLayer = this.add.container(0, 0);
    this.chromeLayer.add(this.upgradeListLayer);
  }

  private syncChrome(state: RunState): void {
    this.hudPrimaryText?.setText(
      `PLANET ${state.planet}  SITE ${state.currentSite}/${state.sitesPerPlanet}  HP ${state.player.hp}/${state.player.maxHp}  FOC ${state.player.focus}  CHG ${state.player.mitigationCharges}`
    );
    this.hudSecondaryText?.setText(
      `${state.selectedPlanetImageKey ? state.planetName.toUpperCase() : "SELECT PLANET"}  |  MODULES ${this.getModuleText(state)}  |  M MODS`
    );
    this.archiveText?.setText(`${state.player.archiveGain}`);
    this.suppliesText?.setText(`${state.player.supplies}`);
    this.renderUpgradeList(state);
  }

  private getModuleText(state: RunState): string {
    if (state.activeMechanics.length === 0) {
      return "none";
    }

    return state.activeMechanics.map((id) => getMechanicDefinition(id).shortLabel).join(" / ");
  }

  private renderUpgradeList(state: RunState): void {
    this.upgradeListLayer?.removeAll(true);

    if (!this.layout || !this.upgradeListLayer) {
      return;
    }

    const startX = this.layout.footer.x + 16;
    const upgradesPanelY = this.layout.footer.y + 48;
    const nameX = startX;

    if (state.activeMechanics.length === 0) {
      this.upgradeListLayer.add(
        makeText(
          this,
          startX,
          upgradesPanelY + 26,
          "No active upgrades yet.",
          textStyle(8, LAB_THEME.textMuted, "left", this.layout.footer.width - 32),
          null
        )
      );
      return;
    }

    state.activeMechanics.slice(0, 3).forEach((id, index) => {
      const mechanic = getMechanicDefinition(id);
      const rowY = upgradesPanelY + 22 + index * 24;
      const name = makeText(
        this,
        nameX,
        rowY,
        mechanic.shortLabel.toUpperCase(),
        textStyle(8, LAB_THEME.text, "left", this.layout!.footer.width - 32),
        null
      );
      const effect = makeText(
        this,
        nameX,
        rowY + 12,
        mechanic.effectText,
        textStyle(8, LAB_THEME.textMuted, "left", this.layout!.footer.width - 32),
        null
      ).setLineSpacing(-2);
      this.upgradeListLayer!.add([name, effect]);
    });
  }

  private syncTutorialState(state: RunState): void {
    if (state.phase !== "map") {
      if (this.activeTutorialId === "map-basics") {
        this.activeTutorialId = undefined;
      }
      return;
    }

    if (!this.activeTutorialId && !this.lab.hasSeenTutorial("map-basics")) {
      this.activeTutorialId = "map-basics";
    }
  }

  private openTutorial(id: TutorialId): void {
    this.activeTutorialId = id;
    this.render();
  }

  private closeTutorial(id: TutorialId): void {
    const wasUnseen = !this.lab.hasSeenTutorial(id);
    this.activeTutorialId = undefined;

    if (wasUnseen) {
      this.lab.markTutorialSeen(id);
      return;
    }

    this.render();
  }

  private renderActiveTutorial(): void {
    if (!this.activeTutorialId) {
      return;
    }

    if (!this.overlayLayer) {
      return;
    }

    renderTutorialOverlay(this, getTutorialDefinition(this.activeTutorialId), () => this.closeTutorial(this.activeTutorialId!), this.overlayLayer);
  }

  private syncFeedbackToast(state: RunState): void {
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
    this.feedbackToastTimer = this.time.delayedCall(5200, () => this.clearFeedbackToast());
  }

  private syncCombatFeedback(state: RunState): void {
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

  private renderFeedbackToast(width: number): void {
    if (!this.feedbackToast || !this.overlayLayer) {
      return;
    }

    const hasImage = Boolean(this.feedbackToast.imageKey && this.textures.exists(this.feedbackToast.imageKey));
    const toastWidth = Math.min(hasImage ? 620 : 520, width - 120);
    const toastHeight = hasImage ? 94 : 62;
    const x = Math.floor((width - toastWidth) / 2);
    const y = 74;
    const accentColor = Phaser.Display.Color.HexStringToColor(this.feedbackToast.accent).color;

    makeRectangle(this, x - 4, y + 4, toastWidth + 8, toastHeight + 8, 0x02060a, 0.55, this.overlayLayer).setOrigin(0);
    const panel = createPanel(this, x, y, toastWidth, toastHeight, 0x0f2230, LAB_THEME.border, this.overlayLayer);
    panel
      .setSize(toastWidth, toastHeight)
      .setInteractive(new Phaser.Geom.Rectangle(0, 0, toastWidth, toastHeight), Phaser.Geom.Rectangle.Contains)
      .on("pointerdown", () => this.clearFeedbackToast());
    makeRectangle(this, x + 10, y + 10, 6, toastHeight - 20, accentColor, 1, this.overlayLayer).setOrigin(0);
    makeText(this, x + 28, y + 12, "OUTCOME", textStyle(8, this.feedbackToast.accent), this.overlayLayer);

    let textX = x + 28;
    let textWidth = toastWidth - 44;

    if (hasImage && this.feedbackToast.imageKey) {
      const image = makeImage(this, x + 78, y + toastHeight / 2 + 2, this.feedbackToast.imageKey, this.overlayLayer).setOrigin(0.5);
      const source = this.textures.get(this.feedbackToast.imageKey).getSourceImage() as { width: number; height: number };
      const scale = Math.min(96 / source.width, 64 / source.height);
      image.setScale(scale);
      this.tweens.add({
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
      this,
      textX,
      y + (hasImage ? 34 : 28),
      this.feedbackToast.message,
      textStyle(9, LAB_THEME.text, "left", textWidth),
      this.overlayLayer
    );

    createButton(this, {
      x: x + toastWidth - 44,
      y: y + 10,
      width: 24,
      height: 24,
      label: "X",
      detail: "",
      onClick: () => this.clearFeedbackToast(),
      fill: 0x284861,
      border: LAB_THEME.borderSoft,
    }, this.overlayLayer);
  }

  private clearFeedbackToast(): void {
    this.feedbackToast = undefined;
    this.feedbackToastTimer?.remove(false);
    this.feedbackToastTimer = undefined;
    this.render();
  }

  private areCombatActionsLocked(): boolean {
    return Boolean(this.combatFeedback || this.combatFeedbackQueue.length > 0);
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
    this.combatFeedbackTimer = this.time.delayedCall(1800, () => this.clearCombatFeedback());
    this.combatFeedbackTicker = this.time.addEvent({
      delay: 100,
      loop: true,
      callback: () => {
        if (!this.combatFeedback || !this.combatFeedbackTimer) {
          this.combatFeedbackTicker?.remove(false);
          this.combatFeedbackTicker = undefined;
          return;
        }

        this.render();
      },
    });
    this.render();
  }

  private clearCombatFeedback(): void {
    this.combatFeedback = undefined;
    this.combatFeedbackTimer?.remove(false);
    this.combatFeedbackTimer = undefined;
    this.combatFeedbackTicker?.remove(false);
    this.combatFeedbackTicker = undefined;
    this.startNextCombatFeedback();
    this.render();
  }

  private renderCombatFeedback(ctx: ReturnType<typeof createRunRenderContext>): void {
    if (!this.combatFeedback || !this.overlayLayer) {
      return;
    }

    const popupWidth = Math.min(360, ctx.contentInner.width - 120);
    const popupHeight = 72;
    const x = Math.floor((ctx.width - popupWidth) / 2);
    const y = Math.floor(ctx.contentInner.y + 150);
    const accentColor = Phaser.Display.Color.HexStringToColor(this.combatFeedback.accent).color;
    const badge = this.combatFeedback.actor === "enemy" ? "ENEMY" : "YOU";
    const remainingSeconds = Math.max(0, this.combatFeedbackTimer?.getRemainingSeconds() ?? 0);

    makeRectangle(this, x - 4, y + 4, popupWidth + 8, popupHeight + 8, 0x02060a, 0.5, this.overlayLayer).setOrigin(0);
    const panel = createPanel(this, x, y, popupWidth, popupHeight, 0x13212b, LAB_THEME.borderSoft, this.overlayLayer);
    panel
      .setSize(popupWidth, popupHeight)
      .setInteractive(new Phaser.Geom.Rectangle(0, 0, popupWidth, popupHeight), Phaser.Geom.Rectangle.Contains)
      .on("pointerdown", () => this.clearCombatFeedback());
    makeRectangle(this, x + 10, y + 10, 6, popupHeight - 20, accentColor, 1, this.overlayLayer).setOrigin(0);
    makeText(this, x + 26, y + 10, badge, textStyle(8, this.combatFeedback.accent), this.overlayLayer);
    makeText(this, x + popupWidth - 162, y + 10, `${remainingSeconds.toFixed(1)}s`, textStyle(8, LAB_THEME.textMuted), this.overlayLayer);
    createButton(this, {
      x: x + popupWidth - 112,
      y: y + 8,
      width: 96,
      height: 24,
      label: "SCHLIESSEN",
      detail: "",
      onClick: () => this.clearCombatFeedback(),
      fill: 0x284861,
      border: LAB_THEME.borderSoft,
    }, this.overlayLayer);
    makeText(
      this,
      x + 26,
      y + 34,
      this.combatFeedback.message,
      textStyle(8, LAB_THEME.text, "left", popupWidth - 138),
      this.overlayLayer
    ).setLineSpacing(-2);
  }
}
