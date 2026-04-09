import { createRunRenderContext } from "./run/shared.js";
import { PlanetSelectPhaseView } from "./run/planetSelectRenderer.js";
import { DraftPhaseView } from "./run/draftRenderer.js";
import { MapPhaseView } from "./run/mapRenderer.js";
import { CombatPhaseView } from "./run/combatRenderer.js";
import { EventPhaseView } from "./run/eventRenderer.js";
import { RewardPhaseView } from "./run/rewardRenderer.js";
import { RunEndPhaseView } from "./run/runEndRenderer.js";
import { FeedbackManager } from "./run/FeedbackManager.js";
import { ChromeManager } from "./run/ChromeManager.js";
import { RunOverlayManager } from "./run/RunOverlayManager.js";
import type { MechanicId, RunState, TutorialId } from "../types.js";
import { getTutorialDefinition } from "../tutorials/catalog.js";
import { BaseScene } from "./BaseScene.js";
import type { PhaseView } from "./run/PhaseView.js";
import { UI_EVENTS } from "../events.js";

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
  private readonly handleCloseActiveTutorial = () => {
    if (this.activeTutorialId) {
      this.closeTutorial(this.activeTutorialId);
    }
  };
  private readonly handleOpenMapTutorial = () => this.openTutorial("map-basics");
  private showModifiersPanel = false;
  private backgroundLayer?: Phaser.GameObjects.Container;
  private chromeLayer?: Phaser.GameObjects.Container;
  private phaseLayer?: Phaser.GameObjects.Container;
  private overlayLayer?: Phaser.GameObjects.Container;
  private feedbackLayer?: Phaser.GameObjects.Container;
  private tooltipLayer?: Phaser.GameObjects.Container;
  private bannerLayer?: Phaser.GameObjects.Container;
  private phaseMaskShape?: Phaser.GameObjects.Graphics;
  private phaseMask?: Phaser.Display.Masks.GeometryMask;
  private phaseMaskSignature?: string;
  private activeTutorialId?: TutorialId;
  private lastPhase?: string;

  private feedback!: FeedbackManager;
  private chrome!: ChromeManager;
  private overlays!: RunOverlayManager;

  private views: Record<string, PhaseView> = {};
  private activeView: PhaseView | null = null;
  private isViewsBuilt = false;
  private viewLayoutSignature?: string;

  constructor() {
    super({ key: "RunScene" });
  }

  create(): void {
    const state = this.lab.getState();
    if (!state) {
      this.scene.start("SetupScene");
      return;
    }

    this.backgroundLayer = this.add.container(0, 0);
    this.chromeLayer = this.add.container(0, 0);
    this.phaseLayer = this.add.container(0, 0);
    this.overlayLayer = this.add.container(0, 0);
    this.feedbackLayer = this.add.container(0, 0);
    this.bannerLayer = this.add.container(0, 0);
    this.tooltipLayer = this.add.container(0, 0);
    this.backgroundLayer.setDepth(0);
    this.phaseLayer.setDepth(10);
    this.chromeLayer.setDepth(20);
    this.overlayLayer.setDepth(30);
    this.feedbackLayer.setDepth(35);
    this.bannerLayer.setDepth(40);
    this.tooltipLayer.setDepth(100);
    
    this.cameras.main.setRoundPixels(true);

    this.feedback = new FeedbackManager(this, this.feedbackLayer, () => this.render());
    this.chrome = new ChromeManager(this, this.backgroundLayer, this.chromeLayer, this.tooltipLayer);
    this.overlays = new RunOverlayManager(this, this.overlayLayer);

    const ctx = createRunRenderContext(
      this,
      state,
      this.phaseLayer,
      (nodeId) => this.lab.chooseNode(nodeId)
    );
    this.rebuildViews(ctx);

    // Event Listeners for UI Actions
    this.events.on(UI_EVENTS.PLANET_SELECTED, (id: string) => {
        this.sound.play("sfx-confirm");
        this.lab.choosePlanet(id);
    });

    this.events.on(UI_EVENTS.MECHANIC_SELECTED, (id: MechanicId | null) => {
        this.sound.play("sfx-confirm");
        this.lab.chooseMechanic(id);
    });

    this.events.on(UI_EVENTS.COMBAT_ACTION_RESOLVE, (id: string) => {
        this.lab.resolveCombatAction(id);
    });

    this.events.on(UI_EVENTS.EVENT_CHOICE_RESOLVE, (id: string) => {
        this.sound.play("sfx-confirm");
        this.lab.resolveEventChoice(id);
    });

    this.events.on(UI_EVENTS.REWARD_CHOICE_SELECTED, (id: string) => {
        this.sound.play("sfx-reward");
        this.lab.chooseReward(id);
    });

    this.events.on(UI_EVENTS.REROLL_REQUESTED, () => {
        this.sound.play("sfx-click");
        this.lab.rerollCurrentOffer();
    });

    this.events.on(UI_EVENTS.RETURN_TO_SETUP, (mode: "same" | "new") => {
        this.lab.returnToSetup(mode);
        this.scene.start("SetupScene");
    });

    this.lab.on("changed", this.handleChange);
    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize);

    this.input.keyboard?.on("keydown-M", this.handleToggleModifiers);
    this.input.keyboard?.on("keydown-ESC", this.handleCloseModifiers);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.lab.off("changed", this.handleChange);
      this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize);
      this.input.keyboard?.off("keydown-M", this.handleToggleModifiers);
      this.input.keyboard?.off("keydown-ESC", this.handleCloseModifiers);
      
      this.events.off(UI_EVENTS.PLANET_SELECTED);
      this.events.off(UI_EVENTS.MECHANIC_SELECTED);
      this.events.off(UI_EVENTS.COMBAT_ACTION_RESOLVE);
      this.events.off(UI_EVENTS.EVENT_CHOICE_RESOLVE);
      this.events.off(UI_EVENTS.REWARD_CHOICE_SELECTED);
      this.events.off(UI_EVENTS.REROLL_REQUESTED);
      this.events.off(UI_EVENTS.RETURN_TO_SETUP);

      this.feedback.destroy();
      this.chrome.destroy();
      this.overlays.destroy();
      this.destroyViews();
      this.phaseLayer?.clearMask(true);
      this.phaseMask?.destroy();
      this.phaseMaskShape?.destroy();
      this.phaseMask = undefined;
      this.phaseMaskShape = undefined;
      this.phaseMaskSignature = undefined;
    });

    this.syncRegistry(state);
    this.render();

    // Start ambient laboratory atmosphere if not already playing
    if (!this.sound.get("amb-lab")?.isPlaying) {
        if (this.sound instanceof Phaser.Sound.WebAudioSoundManager) {
            this.sound.context.resume();
        }
        this.sound.play("amb-lab", { loop: true, volume: 0.18 });
    }
  }

  private syncRegistry(state: RunState): void {
    const r = this.registry;
    r.set("player-hp", state.player.hp);
    r.set("player-max-hp", state.player.maxHp);
    r.set("player-guard", state.player.guard);
    r.set("player-focus", state.player.focus);
    r.set("player-supplies", state.player.supplies);
    r.set("player-charges", state.player.mitigationCharges);
    r.set("player-research", state.player.research);
    r.set("player-archive-gain", state.player.archiveGain);
    r.set("planet-name", state.planetName);
    r.set("current-site", state.currentSite);
  }

  private render(): void {
    const state = this.lab.getState();
    if (!state) {
      this.scene.start("SetupScene");
      return;
    }

    this.syncRegistry(state);
    this.syncTutorialState(state);
    this.feedback.syncCombatFeedback(state);

    if (!this.phaseLayer || !this.overlayLayer || !this.tooltipLayer || !this.feedbackLayer || !this.isViewsBuilt) {
      return;
    }

    const ctx = createRunRenderContext(
      this,
      state,
      this.phaseLayer,
      (nodeId) => this.lab.chooseNode(nodeId)
    );
    this.syncViewsForContext(ctx);
    this.ensurePhaseMask(ctx.layout.content);
    this.feedback.syncFeedbackToast(state);
    this.chrome.ensureChrome(ctx.width, ctx.height, ctx.layout);
    this.chrome.syncChrome(state);
    
    const viewKey = this.getViewKey(state);
    const view = this.views[viewKey];

    if (this.activeView !== view) {
      if (this.activeView) {
        this.activeView.hide(true);
      }
      this.activeView = view;
      this.activeView?.show(true);

      // Trigger Phase Banners on transition
      if (this.lastPhase !== state.phase) {
          if (state.phase === "combat") {
              this.showPhaseBanner("banner-combat-start");
          } else if (state.phase === "planet-select") {
              this.showPhaseBanner("banner-planet-select");
          }
      }
    }

    this.lastPhase = state.phase;

    if (viewKey === "combat") {
      (this.activeView as CombatPhaseView).updateState(state, !this.feedback.areCombatActionsLocked());
    } else if (viewKey === "map") {
      (this.activeView as MapPhaseView).updateState(state, this.handleOpenMapTutorial);
    } else {
      this.activeView?.updateState(state);
    }

    this.overlays.syncModifiers(ctx, this.showModifiersPanel, this.handleCloseModifiers);
    this.overlays.syncTutorial(
      this.activeTutorialId ? getTutorialDefinition(this.activeTutorialId) : undefined,
      this.handleCloseActiveTutorial
    );
    if (state.phase === "combat") {
      this.feedback.renderCombatFeedback(ctx);
    } else {
      this.feedback.renderFeedbackToast(ctx.width);
    }
  }

  private getViewKey(state: RunState): string {
    if (state.phase === "planet-select") return "planet-select";
    if (state.phase === "draft" && state.draft) return "draft";
    if (state.phase === "combat" && state.combat) return "combat";
    if (state.phase === "event" && state.event) return "event";
    if (state.phase === "reward" && state.reward) return "reward";
    if (state.phase === "map") return "map";
    return "run-end";
  }

  private createViews(ctx: ReturnType<typeof createRunRenderContext>): Record<string, PhaseView> {
    return {
      "planet-select": new PlanetSelectPhaseView(this, ctx),
      "draft": new DraftPhaseView(this, ctx),
      "map": new MapPhaseView(this, ctx),
      "combat": new CombatPhaseView(this, ctx),
      "event": new EventPhaseView(this, ctx),
      "reward": new RewardPhaseView(this, ctx),
      "run-end": new RunEndPhaseView(this, ctx),
    };
  }

  private destroyViews(): void {
    Object.values(this.views).forEach((view) => view.destroy());
    this.views = {};
    this.activeView = null;
    this.isViewsBuilt = false;
    this.viewLayoutSignature = undefined;
  }

  private rebuildViews(ctx: ReturnType<typeof createRunRenderContext>): void {
    this.destroyViews();
    this.views = this.createViews(ctx);
    Object.values(this.views).forEach((view) => view.build());
    this.isViewsBuilt = true;
    this.viewLayoutSignature = this.getViewLayoutSignature(ctx);
  }

  private syncViewsForContext(ctx: ReturnType<typeof createRunRenderContext>): void {
    const signature = this.getViewLayoutSignature(ctx);

    if (!this.isViewsBuilt || this.viewLayoutSignature !== signature) {
      this.rebuildViews(ctx);
      return;
    }

    Object.values(this.views).forEach((view) => view.setContext(ctx));
  }

  private getViewLayoutSignature(ctx: ReturnType<typeof createRunRenderContext>): string {
    const { width, height, layout } = ctx;

    return [
      width,
      height,
      layout.header.x,
      layout.header.y,
      layout.header.width,
      layout.header.height,
      layout.content.x,
      layout.content.y,
      layout.content.width,
      layout.content.height,
      layout.footer.x,
      layout.footer.y,
      layout.footer.width,
      layout.footer.height,
    ].join(":");
  }

  // ── Tutorial ───────────────────────────────────────────

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

  private showPhaseBanner(key: string): void {
    if (!this.bannerLayer || !this.textures.exists(key)) return;

    this.bannerLayer.removeAll(true);
    const { width, height } = this.scale;
    const banner = this.add.image(width / 2, height / 2, key).setOrigin(0.5).setAlpha(0);
    this.bannerLayer.add(banner);

    // Fade in, hold, fade out
    this.tweens.add({
      targets: banner,
      alpha: 1,
      duration: 500,
      ease: "Power2",
      onComplete: () => {
        this.time.delayedCall(1600, () => {
          this.tweens.add({
            targets: banner,
            alpha: 0,
            duration: 600,
            ease: "Power2",
            onComplete: () => banner.destroy()
          });
        });
      }
    });
  }

  private ensurePhaseMask(contentRect: { x: number; y: number; width: number; height: number }): void {
    if (!this.phaseLayer) {
      return;
    }

    if (!this.phaseMaskShape) {
      this.phaseMaskShape = this.add.graphics();
      this.phaseMaskShape.setVisible(false);
    }

    if (!this.phaseMask) {
      this.phaseMask = this.phaseMaskShape.createGeometryMask();
      this.phaseLayer.setMask(this.phaseMask);
    }

    const signature = [contentRect.x, contentRect.y, contentRect.width, contentRect.height].join(":");

    if (this.phaseMaskSignature === signature && this.phaseMaskShape) {
      return;
    }

    this.phaseMaskShape.clear();
    this.phaseMaskShape.fillStyle(0xffffff, 1);
    this.phaseMaskShape.fillRect(contentRect.x, contentRect.y, contentRect.width, contentRect.height);
    this.phaseMaskSignature = signature;
  }
}
