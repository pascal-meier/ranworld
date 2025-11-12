export default class SoundController {
    scene;
    sounds = {};
    fail;
    success;
    // ℹ️ Prepares all note, success, and failure sounds for instant playback ℹ️
    constructor(scene) {
        this.scene = scene;
        for (let note = 1; note <= 8; note++) {
            this.sounds[note] = this.scene.sound.add(`${note}`);
        }
        this.fail = this.scene.sound.add("fail");
        this.success = this.scene.sound.add("success");
    }
    // ℹ️ Plays one of the numbered drum notes with optional rate/detune adjustments ℹ️
    playNote(note, config) {
        const sound = this.sounds[note];
        if (!sound)
            return;
        sound.play(config);
    }
    // ℹ️ Plays the failure sting to highlight mistakes ℹ️
    playFail() {
        this.fail.play();
    }
    // ℹ️ Plays the celebratory cue after a perfect input ℹ️
    playSuccess() {
        this.success.play();
    }
}
