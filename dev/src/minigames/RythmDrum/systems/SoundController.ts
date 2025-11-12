export default class SoundController {
  private readonly sounds: Record<number, Phaser.Sound.BaseSound> = {};
  private readonly fail: Phaser.Sound.BaseSound;
  private readonly success: Phaser.Sound.BaseSound;

  // ℹ️ Prepares all note, success, and failure sounds for instant playback ℹ️
  constructor(private scene: Phaser.Scene) {
    for (let note = 1; note <= 8; note++) {
      this.sounds[note] = this.scene.sound.add(`${note}`);
    }

    this.fail = this.scene.sound.add("fail");
    this.success = this.scene.sound.add("success");
  }

  // ℹ️ Plays one of the numbered drum notes with optional rate/detune adjustments ℹ️
  playNote(note: number, config?: Phaser.Types.Sound.SoundConfig): void {
    const sound = this.sounds[note];
    if (!sound) return;
    sound.play(config);
  }

  // ℹ️ Plays the failure sting to highlight mistakes ℹ️
  playFail(): void {
    this.fail.play();
  }

  // ℹ️ Plays the celebratory cue after a perfect input ℹ️
  playSuccess(): void {
    this.success.play();
  }
}
