const DEFAULT_WIDTH = 200;
const DEFAULT_HEIGHT = 60;
const DEFAULT_FONT_SIZE = 24;
const MENU_TEXTURE_KEY = "ui_button_menu";
const BACK_TEXTURE_KEY = "ui_button_back";
const NORMAL_TINT = 0xffffff;
const HOVER_TINT = 0xf0f0f0;
export class Button extends Phaser.GameObjects.Container {
    background;
    label;
    clickCallback;
    desiredWidth = DEFAULT_WIDTH;
    desiredHeight = DEFAULT_HEIGHT;
    normalTint = NORMAL_TINT;
    hoverTint = HOVER_TINT;
    constructor(scene, x, y, text, callback) {
        super(scene, x, y);
        this.clickCallback = callback;
        const textureKey = this.isBackLabel(text) ? BACK_TEXTURE_KEY : MENU_TEXTURE_KEY;
        this.background = scene.add.image(0, 0, textureKey).setOrigin(0.5);
        this.label = scene.add
            .text(0, 0, text, {
            fontSize: `${DEFAULT_FONT_SIZE}px`,
            fontFamily: "Ranworldfont01",
            color: "#ffffff",
        })
            .setOrigin(0.5);
        this.add([this.background, this.label]);
        scene.add.existing(this);
        this.setButtonSize(DEFAULT_WIDTH, DEFAULT_HEIGHT);
        this.setNormalState();
        this.background
            .setInteractive({ useHandCursor: true })
            .on("pointerover", () => this.setHoverState())
            .on("pointerout", () => this.setNormalState())
            .on("pointerdown", () => this.handleClick());
    }
    handleClick() {
        this.animatePress();
        this.clickCallback?.();
    }
    setHoverState() {
        this.background.setTint(this.hoverTint);
    }
    setNormalState() {
        this.background.setTint(this.normalTint);
    }
    isBackLabel(text) {
        return text.trim().toLowerCase() === "back";
    }
    resolveDisplaySize() {
        if (!this.isBackLabel(this.label.text)) {
            return { width: this.desiredWidth, height: this.desiredHeight };
        }
        const squareSize = Math.min(this.desiredWidth, this.desiredHeight);
        return { width: squareSize, height: squareSize };
    }
    applyDisplaySize() {
        const { width, height } = this.resolveDisplaySize();
        this.background.setDisplaySize(width, height);
        this.setSize(width, height);
    }
    animatePress() {
        const baseScaleX = this.scaleX;
        const baseScaleY = this.scaleY;
        this.scene.tweens.add({
            targets: this,
            scaleX: { from: baseScaleX * 0.95, to: baseScaleX },
            scaleY: { from: baseScaleY * 0.95, to: baseScaleY },
            duration: 120,
            ease: "Quad.easeOut",
            onComplete: () => {
                this.setScale(baseScaleX, baseScaleY);
            },
        });
    }
    setCallback(callback) {
        this.clickCallback = callback;
    }
    setLabel(text) {
        this.label.setText(text);
        // update background when label switches between back/menu
        const textureKey = this.isBackLabel(text) ? BACK_TEXTURE_KEY : MENU_TEXTURE_KEY;
        if (this.background.texture.key !== textureKey) {
            this.background.setTexture(textureKey);
        }
        this.applyDisplaySize();
    }
    setFontSize(size) {
        this.label.setFontSize(size);
    }
    setLabelColor(color) {
        this.label.setColor(color);
    }
    setTintColors(normal, hover) {
        this.normalTint = normal;
        this.hoverTint = hover ?? normal;
        this.setNormalState();
    }
    setButtonSize(width, height) {
        this.desiredWidth = width;
        this.desiredHeight = height;
        this.applyDisplaySize();
    }
    getButtonSize() {
        return this.resolveDisplaySize();
    }
    setInteractionEnabled(enabled) {
        if (enabled) {
            this.background.setInteractive({ useHandCursor: true });
            this.alpha = 1;
            this.setNormalState();
            return;
        }
        this.background.disableInteractive();
        this.alpha = 0.5;
        this.setNormalState();
    }
    markAsHud(tag = "hud-ui") {
        this.name = tag;
        this.setDataEnabled();
        this.setData("hud", true);
        this.background.name = tag;
        this.label.name = tag;
        this.background.setData("hud", true);
        this.label.setData("hud", true);
    }
}
