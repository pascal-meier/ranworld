export type FlowState = "boot" | "ready" | "revealing" | "cooldown" | "win";
export type TransparencyPhaseKey = "blind" | "odds" | "reveal";

export interface TransparencyPhaseDefinition {
  key: TransparencyPhaseKey;
  title: string;
  description: string;
  feedbackLevel: 1 | 2 | 3;
}

interface PhaseManagerConfig {
  cooldownDuration?: number;
  onFlowStateChange?: (state: FlowState) => void;
  onTransparencyChange?: (phase: TransparencyPhaseDefinition) => void;
  phases?: TransparencyPhaseDefinition[];
}

const DEFAULT_PHASES: TransparencyPhaseDefinition[] = [
  {
    key: "blind",
    title: "Phase 1 - Mystery Odds",
    description: "Only the result is shown - no odds, no explanations.",
    feedbackLevel: 1,
  },
  {
    key: "odds",
    title: "Phase 2 - Odds Preview",
    description: "Preview the odds before opening a box.",
    feedbackLevel: 2,
  },
  {
    key: "reveal",
    title: "Phase 3 - Full Transparency",
    description: "Displays the exact roll value and threshold.",
    feedbackLevel: 3,
  },
];

/**
 * ℹ️ Coordinates game flow (ready/reveal/cooldown) with transparency phases for the LootyBox minigame. ℹ️
 */
export class PhaseManager {
  private flowState: FlowState = "boot";
  private readonly phases: TransparencyPhaseDefinition[];
  private transparencyIndex = 0;
  private cooldownTimer?: Phaser.Time.TimerEvent;

  /**
   * ℹ️ Creates the phase manager and emits the initial transparency phase to listeners. ℹ️
   */
  constructor(private scene: Phaser.Scene, private config: PhaseManagerConfig = {}) {
    this.phases = config.phases ?? DEFAULT_PHASES;
    this.config.onTransparencyChange?.(this.getTransparencyPhase());
  }

  /**
   * ℹ️ Cleans up timers and should be called when the owning scene shuts down. ℹ️
   */
  destroy(): void {
    this.clearTimer();
  }

  /**
   * ℹ️ Returns true when the player may interact with boxes. ℹ️
   */
  canInteract(): boolean {
    return this.flowState === "ready";
  }

  /**
   * ℹ️ Exposes the current flow state for UI or logic consumers. ℹ️
   */
  getFlowState(): FlowState {
    return this.flowState;
  }

  /**
   * ℹ️ Provides the currently active transparency phase definition. ℹ️
   */
  getTransparencyPhase(): TransparencyPhaseDefinition {
    return this.phases[this.transparencyIndex];
  }

  /**
   * ℹ️ Advances to the next transparency phase and notifies listeners. ℹ️
   */
  cycleTransparencyPhase(): TransparencyPhaseDefinition {
    this.transparencyIndex = (this.transparencyIndex + 1) % this.phases.length;
    const next = this.getTransparencyPhase();
    this.config.onTransparencyChange?.(next);
    return next;
  }

  /**
   * ℹ️ Switches the flow back to ready so players can interact again. ℹ️
   */
  enterReady(): void {
    this.clearTimer();
    this.setFlowState("ready");
  }

  /**
   * ℹ️ Marks the flow as revealing, typically right after a box click. ℹ️
   */
  enterReveal(): void {
    this.clearTimer();
    this.setFlowState("revealing");
  }

  /**
   * ℹ️ Starts the cooldown timer and invokes the shuffle callback once finished. ℹ️
   */
  startCooldown(onShuffleComplete: () => void, duration?: number): void {
    const delay = duration ?? this.config.cooldownDuration ?? 1500;
    this.clearTimer();
    this.setFlowState("cooldown");
    this.cooldownTimer = this.scene.time.delayedCall(delay, () => {
      onShuffleComplete();
      if (this.flowState !== "win") {
        this.enterReady();
      }
    });
  }

  /**
   * ℹ️ Moves the flow to the win state and prevents further timers. ℹ️
   */
  enterWin(): void {
    this.clearTimer();
    this.setFlowState("win");
  }

  /**
   * ℹ️ Updates the internal flow state while emitting change callbacks. ℹ️
   */
  private setFlowState(state: FlowState): void {
    if (this.flowState === state) return;
    this.flowState = state;
    this.config.onFlowStateChange?.(state);
  }

  /**
   * ℹ️ Stops and clears the active cooldown timer. ℹ️
   */
  private clearTimer(): void {
    this.cooldownTimer?.remove();
    this.cooldownTimer = undefined;
  }
}
