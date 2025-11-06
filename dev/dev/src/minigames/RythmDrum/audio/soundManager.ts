export default class SoundManager {
  private scene: Phaser.Scene;
  private sounds: Record<number, Phaser.Sound.BaseSound>;
  private fail: Phaser.Sound.BaseSound;
  private success: Phaser.Sound.BaseSound;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.sounds = {};

    // Nummerierte Sounds (1–8)
    for (let i = 1; i <= 8; i++) {
      const key = `${i}`;
      this.sounds[i] = this.scene.sound.add(key);
    }

    // Weitere Sounds
    this.fail = this.scene.sound.add("fail");
    this.success = this.scene.sound.add("success");
  }

  /** 🔊 Spielt einen Ton ab (1–8) */
  playNote(note: number): void {
    const sound = this.sounds[note];
    if (sound) {
      sound.play();
    } else {
      console.warn(`⚠️ Sound ${note} nicht gefunden`);
    }
  }

  /** ❌ Fehlersound */
  playFail(): void {
    this.fail.play();
  }

  /** ✅ Erfolgssound */
  playSuccess(): void {
    this.success.play();
  }
}
