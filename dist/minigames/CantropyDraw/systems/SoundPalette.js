const CHORD_DELAY_MS = 220;
const ECHO_DELAY_MS = 520;
const BASE_VOLUME_MIN = 0.12;
const BASE_VOLUME_MAX = 0.32;
const DETUNE_RANGE = 120;
export class SoundPalette {
    scene;
    constructor(scene) {
        this.scene = scene;
    }
    play(toneKey, rate, brightness, chord) {
        const baseVolume = Phaser.Math.Linear(BASE_VOLUME_MIN, BASE_VOLUME_MAX, brightness);
        this.scene.sound.play(toneKey, { volume: baseVolume, rate, detune: brightness * DETUNE_RANGE });
        chord.forEach((key, index) => {
            this.scene.time.delayedCall(index * CHORD_DELAY_MS, () => {
                const detune = (brightness - 0.5) * DETUNE_RANGE * (index + 1);
                this.scene.sound.play(key, {
                    volume: baseVolume * Phaser.Math.Linear(0.4, 0.7, brightness),
                    rate: rate * Phaser.Math.Linear(0.9, 1.05, brightness),
                    detune,
                });
            });
        });
        this.scene.time.delayedCall(ECHO_DELAY_MS, () => {
            this.scene.sound.play(toneKey, {
                volume: baseVolume * 0.4,
                rate: rate * 0.8,
                detune: brightness * -DETUNE_RANGE * 0.6,
            });
        });
    }
}
