export default class SoundManager {
    constructor(scene) {
        this.scene = scene;
        this.sounds = {};

        for (let i = 1; i <= 8; i++) {
            this.sounds[i] = scene.sound.add(`${i}`);
        }

        this.fail = scene.sound.add("fail");
        this.success = scene.sound.add("success");
    }

    playNote(note) {
        const s = this.sounds[note];
        if (s) s.play();
    }

    playFail() {
        this.fail.play();
    }

    playSuccess() {
        this.success.play();
    }
}
