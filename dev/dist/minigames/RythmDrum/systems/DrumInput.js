export class DrumInput extends Phaser.Events.EventEmitter {
    drum;
    capturing = false;
    expected = [];
    progress = [];
    success = [];
    // ℹ️ Hooks into the TongueDrum so note hits can be translated into events ℹ️
    constructor(drum) {
        super();
        this.drum = drum;
        this.drum.setHitHandler((segment) => this.handleNote(segment));
    }
    // ℹ️ Begins recording player input against the provided reference sequence ℹ️
    startCapture(sequence) {
        this.expected = [...sequence];
        this.progress = [];
        this.success = [];
        this.capturing = true;
        this.emit("capture-start", sequence);
    }
    // ℹ️ Stops recording input while keeping the latest progress cached ℹ️
    stopCapture() {
        this.capturing = false;
    }
    // ℹ️ Dispatches note events and evaluates them against the active melody ℹ️
    handleNote(note) {
        this.emit("note", note);
        if (!this.capturing)
            return;
        const index = this.progress.length;
        const expected = this.expected[index];
        const correct = expected === note;
        this.progress.push(note);
        this.success.push(correct);
        const payload = {
            progress: [...this.progress],
            success: [...this.success],
            note,
            correct,
            expected,
        };
        this.emit("progress", payload);
        if (!correct) {
            this.capturing = false;
            this.emit("fail", payload);
            return;
        }
        if (this.progress.length === this.expected.length) {
            this.capturing = false;
            this.emit("success", payload);
        }
    }
}
