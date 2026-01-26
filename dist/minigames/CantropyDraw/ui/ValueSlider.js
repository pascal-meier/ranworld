// Minimal thumb slider built from Phaser primitives to avoid texture dependencies.
export class ValueSlider extends Phaser.GameObjects.Container {
    track;
    fill;
    handle;
    label;
    valueText;
    trackWidth;
    value = 0.5;
    onChange;
    trackPointerActive = false;
    constructor(scene, x, y, config) {
        super(scene, x, y);
        scene.add.existing(this);
        this.trackWidth = config.width ?? 180;
        this.value = Phaser.Math.Clamp(config.initial ?? 0.5, 0, 1);
        this.onChange = config.onChange;
        this.label = scene.add
            .text(0, -22, config.label, { fontSize: "16px", color: "#e8f6ff", fontStyle: "bold" })
            .setOrigin(0.5);
        this.track = scene.add.rectangle(0, 0, this.trackWidth, 12, 0xffffff, 0.15).setOrigin(0.5);
        this.fill = scene.add.rectangle(-this.trackWidth / 2, 0, this.trackWidth * this.value, 12, 0x00c8ff, 0.7).setOrigin(0, 0.5);
        this.handle = scene.add.rectangle(this.valueToX(this.value), 0, 18, 26, 0xffffff, 0.95).setOrigin(0.5);
        this.handle.setStrokeStyle(2, 0x0b4e73, 0.7);
        this.valueText = scene.add
            .text(0, 24, this.formatValue(this.value), { fontSize: "14px", color: "#d8f6ff" })
            .setOrigin(0.5);
        this.add([this.label, this.track, this.fill, this.handle, this.valueText]);
        this.tagAsHud();
        this.setupInput();
    }
    setValue(value, emit = false) {
        this.value = Phaser.Math.Clamp(value, 0, 1);
        this.fill.width = this.trackWidth * this.value;
        this.handle.x = this.valueToX(this.value);
        this.valueText.setText(this.formatValue(this.value));
        if (emit) {
            this.onChange?.(this.value);
        }
    }
    setTrackWidth(width) {
        this.trackWidth = Math.max(120, width);
        this.track.width = this.trackWidth;
        this.setValue(this.value, false);
    }
    setupInput() {
        this.track.setInteractive({ useHandCursor: true, draggable: false });
        this.handle.setInteractive({ useHandCursor: true, draggable: true });
        this.scene.input.setDraggable(this.handle);
        this.track.on("pointerdown", (pointer) => {
            this.trackPointerActive = true;
            this.updateFromPointer(pointer, true);
        });
        const stopTracking = () => {
            this.trackPointerActive = false;
        };
        this.track.on("pointerup", stopTracking);
        this.track.on("pointerout", stopTracking);
        this.track.on("pointerupoutside", stopTracking);
        this.handle.on("drag", (_pointer, dragX) => {
            const localX = dragX - this.x;
            const ratio = Phaser.Math.Clamp((localX + this.trackWidth / 2) / this.trackWidth, 0, 1);
            this.setValue(ratio, true);
        });
        this.scene.input.on("pointermove", (pointer) => {
            if (this.trackPointerActive && pointer.isDown && pointer.primaryDown) {
                this.updateFromPointer(pointer, true);
            }
        });
    }
    updateFromPointer(pointer, emit) {
        const localX = pointer.x - this.x;
        const ratio = Phaser.Math.Clamp((localX + this.trackWidth / 2) / this.trackWidth, 0, 1);
        this.setValue(ratio, emit);
    }
    valueToX(value) {
        return -this.trackWidth / 2 + this.trackWidth * value;
    }
    formatValue(value) {
        return `${Math.round(value * 100)}%`;
    }
    tagAsHud(tag = "hud-ui") {
        this.setDataEnabled();
        this.setData("hud", true);
        [this.track, this.fill, this.handle, this.label, this.valueText].forEach((obj) => {
            obj.name = tag;
            obj.setData("hud", true);
        });
        this.name = tag;
    }
}
