import HUD from "../ui/hud.js";
import TongueDrum from "../objects/tongueDrum.js";
import SoundController from "./SoundController.js";
import { DrumInput, type DrumProgressPayload } from "./DrumInput.js";
import type { MelodyPlan } from "./types.js";

type RoundResultHandler = (success: boolean) => void;

export class RoundConductor {
  private isRunning = false;
  private completion?: RoundResultHandler;
  private activeTimers: Phaser.Time.TimerEvent[] = [];
  private boundHandlers: Array<[string, (...args: any[]) => void]> = [];

  // ?? Subscribes to drum events so HUD, audio, and scoring stay synchronized ??
  constructor(
    private scene: Phaser.Scene,
    private hud: HUD,
    private drum: TongueDrum,
    private sound: SoundController,
    private input: DrumInput
  ) {
    this.register("note", (note: number) => this.handlePlayerNote(note));
    this.register("progress", (payload: DrumProgressPayload) =>
      this.hud.showPlayerInput(payload.progress, payload.success)
    );
    this.register("fail", () => this.conclude(false));
    this.register("success", () => this.conclude(true));
  }

  // ?? Plays the reference melody and then hands control to the player ??
  run(plan: MelodyPlan, onFinish: RoundResultHandler): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.completion = onFinish;
    this.hud.setStatus("Listen closely...");
    this.hud.showPlayerInput([], []);
    this.playSequence(plan, () => {
      this.hud.setStatus("Your turn! Stay in sync.");
      this.input.startCapture(plan.notes);
    });
  }

  // ?? Stops any running round, used when the scene shuts down ??
  cancel(): void {
    this.input.stopCapture();
    this.clearTimers();
    this.isRunning = false;
  }

  destroy(): void {
    this.cancel();
    this.boundHandlers.forEach(([event, fn]) => this.input.off(event, fn));
    this.boundHandlers = [];
    this.drum.setHitHandler(undefined);
  }

  // ?? Steps through the AI melody, respecting per-note tempo variations ??
  private playSequence(plan: MelodyPlan, onComplete: () => void): void {
    const { notes, variations } = plan;
    let index = 0;

    const step = () => {
      if (index >= notes.length) {
        onComplete();
        return;
      }

      const note = notes[index];
      const variation = variations[index] ?? { rate: 1, detune: 0, delayFactor: 1 };
      this.pulseNote(note, variation);
      index++;

      const delay = 520 * variation.delayFactor;
      this.queueTimer(delay, step);
    };

    step();
  }

  // ?? Echoes player taps with audiovisual feedback even outside capture windows ??
  private handlePlayerNote(note: number): void {
    this.pulseNote(note);
  }

  // ?? Plays a note, flashes the drum, and shows it on the HUD center display ??
  private pulseNote(note: number, config?: Phaser.Types.Sound.SoundConfig): void {
    this.sound.playNote(note, config);
    this.drum.flash(note);
    this.hud.showCenterNote(note);
  }

  // ?? Finalizes a round with success/failure cues and invokes the completion handler ??
  private conclude(success: boolean): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    this.input.stopCapture();
    this.clearTimers();

    if (success) {
      this.sound.playSuccess();
      this.drum.winFlash();
      this.hud.setStatus("Sequence locked in! Press Start for more.");
    } else {
      this.sound.playFail();
      this.drum.failFlash();
      this.hud.setStatus("Missed beat - try again.");
    }

    this.completion?.(success);
  }

  // ?? Manages delayed callbacks so they can be canceled cleanly if needed ??
  private queueTimer(delay: number, callback: () => void): void {
    const timer = this.scene.time.delayedCall(delay, () => {
      this.activeTimers = this.activeTimers.filter((t) => t !== timer);
      callback();
    });
    this.activeTimers.push(timer);
  }

  // ?? Removes any scheduled callbacks when the round is aborted ??
  private clearTimers(): void {
    this.activeTimers.forEach((timer) => timer.remove(false));
    this.activeTimers = [];
  }

  private register(event: string, handler: (...args: any[]) => void): void {
    this.input.on(event, handler);
    this.boundHandlers.push([event, handler]);
  }
}

