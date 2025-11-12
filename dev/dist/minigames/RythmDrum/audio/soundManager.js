export default class SoundManager {
    scene;
    sounds;
    fail;
    success;
    constructor(scene) {
        this.scene = scene;
        this.sounds = {};
        for (let i = 1; i <= 8; i++) {
            const key = `${i}`;
            this.sounds[i] = this.scene.sound.add(key);
        }
        this.fail = this.scene.sound.add("fail");
        this.success = this.scene.sound.add("success");
    }
    /** Plays a numbered tone (1-8) with optional detune/rate tweaks */
    playNote(note, config) {
        const sound = this.sounds[note];
        if (sound) {
            sound.play(config);
        }
        else {
            console.warn(`Missing sound for note ${note}`);
        }
    }
    /** Failure cue */
    playFail() {
        this.fail.play();
    }
    /** Success cue */
    playSuccess() {
        this.success.play();
    }
}
