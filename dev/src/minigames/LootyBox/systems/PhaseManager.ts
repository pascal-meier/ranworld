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
    description: "Nur das Ergebnis ist sichtbar. Keine Wahrscheinlichkeiten oder Roll-Details.",
    feedbackLevel: 1,
  },
  {
    key: "odds",
    title: "Phase 2 - Odds Preview",
    description: "Zeigt dir die prozentualen Chancen pro Box, bevor du sie oeffnest.",
    feedbackLevel: 2,
  },
  {
    key: "reveal",
    title: "Phase 3 - Full Transparency",
    description: "Visualisiert den zugrunde liegenden Zufallswert und die getroffene Schwelle.",
    feedbackLevel: 3,
  },
];

/**
 * Kombiniert Spielfluss (ready/reveal/cooldown) und Transparenz-Phasen
 * fuer das LootyBox-Minispiel.
 */
export class PhaseManager {
  private flowState: FlowState = "boot";
  private readonly phases: TransparencyPhaseDefinition[];
  private transparencyIndex = 0;
  private cooldownTimer?: Phaser.Time.TimerEvent;

  constructor(private scene: Phaser.Scene, private config: PhaseManagerConfig = {}) {
    this.phases = config.phases ?? DEFAULT_PHASES;
    this.config.onTransparencyChange?.(this.getTransparencyPhase());
  }

  destroy(): void {
    this.clearTimer();
  }

  canInteract(): boolean {
    return this.flowState === "ready";
  }

  getFlowState(): FlowState {
    return this.flowState;
  }

  getTransparencyPhase(): TransparencyPhaseDefinition {
    return this.phases[this.transparencyIndex];
  }

  cycleTransparencyPhase(): TransparencyPhaseDefinition {
    this.transparencyIndex = (this.transparencyIndex + 1) % this.phases.length;
    const next = this.getTransparencyPhase();
    this.config.onTransparencyChange?.(next);
    return next;
  }

  enterReady(): void {
    this.clearTimer();
    this.setFlowState("ready");
  }

  enterReveal(): void {
    this.clearTimer();
    this.setFlowState("revealing");
  }

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

  enterWin(): void {
    this.clearTimer();
    this.setFlowState("win");
  }

  private setFlowState(state: FlowState): void {
    if (this.flowState === state) return;
    this.flowState = state;
    this.config.onFlowStateChange?.(state);
  }

  private clearTimer(): void {
    this.cooldownTimer?.remove();
    this.cooldownTimer = undefined;
  }
}
