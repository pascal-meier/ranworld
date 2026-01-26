import { Button } from "../../../core/ui/Button.js";
import { ValueSlider } from "./ValueSlider.js";
const SYMMETRY_ORDER = ["off", "vertical", "horizontal", "radial"];
const BOUNDARY_ORDER = ["clamp", "bleed"];
export class ComposerHUD {
    scene;
    callbacks;
    seedText;
    messageText;
    flowButton;
    backButton;
    replayButton;
    newSeedButton;
    newCompositionButton;
    undoButton;
    redoButton;
    variationButton;
    patternShiftButton;
    symmetryButton;
    boundaryButton;
    noiseSlider;
    colorSlider;
    root;
    currentSymmetry = "radial";
    currentBoundary = "clamp";
    variationIndex = 0;
    constructor(scene, callbacks) {
        this.scene = scene;
        this.callbacks = callbacks;
        const { width, height } = scene.scale;
        this.root = scene.add.container(0, 0).setDepth(100).setScrollFactor(0);
        this.seedText = scene.add
            .text(width * 0.05, height * 0.05, "Seed: ----", {
            fontSize: "18px",
            color: "#ededed",
        })
            .setOrigin(0, 0.5);
        this.root.add(this.seedText);
        this.messageText = scene.add
            .text(width * 0.05, height * 0.1, "Touch gently to paint with chance.", {
            fontSize: "18px",
            color: "#c8c8c8",
        })
            .setOrigin(0, 0.5);
        this.root.add(this.messageText);
        this.flowButton = new Button(scene, width * 0.9, height * 0.06, "Flow Off", () => this.callbacks.onFlowToggle());
        this.backButton = new Button(scene, width * 0.08, height * 0.06, "Back", () => this.callbacks.onBack());
        this.replayButton = new Button(scene, width * 0.35, height * 0.06, "Replay", () => this.callbacks.onReplay());
        this.newSeedButton = new Button(scene, width * 0.5, height * 0.06, "New Seed", () => this.callbacks.onNewSeed());
        this.newCompositionButton = new Button(scene, width * 0.65, height * 0.06, "New Comp", () => this.callbacks.onNewComposition());
        this.undoButton = new Button(scene, width * 0.2, height * 0.88, "Undo", () => this.callbacks.onUndo());
        this.redoButton = new Button(scene, width * 0.35, height * 0.88, "Redo", () => this.callbacks.onRedo());
        this.variationButton = new Button(scene, width * 0.5, height * 0.88, "Variation", () => this.callbacks.onVariation());
        this.patternShiftButton = new Button(scene, width * 0.65, height * 0.88, "Pattern Shift", () => this.callbacks.onPatternShift());
        this.symmetryButton = new Button(scene, width * 0.8, height * 0.88, "Sym: Radial", () => this.cycleSymmetry());
        this.boundaryButton = new Button(scene, width * 0.5, height * 0.82, "Clamp", () => this.cycleBoundary());
        [
            this.flowButton,
            this.backButton,
            this.replayButton,
            this.newSeedButton,
            this.newCompositionButton,
            this.undoButton,
            this.redoButton,
            this.variationButton,
            this.patternShiftButton,
            this.symmetryButton,
            this.boundaryButton,
        ].forEach((btn) => btn.markAsHud());
        this.root.add([
            this.flowButton,
            this.backButton,
            this.replayButton,
            this.newSeedButton,
            this.newCompositionButton,
            this.undoButton,
            this.redoButton,
            this.variationButton,
            this.patternShiftButton,
            this.symmetryButton,
            this.boundaryButton,
        ]);
        this.noiseSlider = new ValueSlider(scene, width * 0.35, height * 0.78, {
            label: "Noise",
            initial: 0.45,
            onChange: (v) => this.callbacks.onNoiseChange(v),
        });
        this.colorSlider = new ValueSlider(scene, width * 0.65, height * 0.78, {
            label: "Color Drift",
            initial: 0.5,
            onChange: (v) => this.callbacks.onColorDriftChange(v),
        });
        this.root.add([this.noiseSlider, this.colorSlider]);
    }
    setSeed(seed) {
        this.seedText.setText(`Seed: ${seed}`);
    }
    setMessage(text) {
        this.messageText.setText(text);
    }
    setFlowActive(active) {
        this.flowButton.setLabel(active ? "Flow On" : "Flow Off");
    }
    setSymmetry(mode) {
        this.currentSymmetry = mode;
        const label = mode === "off" ? "Off" : mode === "vertical" ? "Vertical" : mode === "horizontal" ? "Horizontal" : "Radial";
        this.symmetryButton.setLabel(`Sym: ${label}`);
    }
    setBoundary(mode) {
        this.currentBoundary = mode;
        this.boundaryButton.setLabel(mode === "clamp" ? "Clamp" : "Bleed");
    }
    setNoise(value) {
        this.noiseSlider.setValue(value);
    }
    setColorDrift(value) {
        this.colorSlider.setValue(value);
    }
    setVariationIndex(index) {
        this.variationIndex = index;
        this.variationButton.setLabel(index > 0 ? `Variation ${index}` : "Variation");
    }
    layout(width, height) {
        const isVertical = height > width * 1.05;
        const padding = Math.max(Math.min(width, height) * 0.05, 18);
        const buttonScale = Phaser.Math.Clamp(Math.min(width, height) / 900, 0.7, 1.1);
        const rowGap = Math.max(80, height * 0.1);
        this.backButton.setPosition(padding + 36, padding + 24).setScale(buttonScale * 0.85);
        this.flowButton.setPosition(width - padding - 80, padding + 24).setScale(buttonScale * 0.85);
        this.replayButton.setScale(buttonScale * 0.78);
        this.newSeedButton.setScale(buttonScale * 0.78);
        this.newCompositionButton.setScale(buttonScale * 0.78);
        const topButtonWidth = Math.min(width * 0.38, 160);
        const topButtonHeight = Math.min(height * 0.08, 60);
        [this.replayButton, this.newSeedButton, this.newCompositionButton].forEach((btn) => btn.setButtonSize(topButtonWidth, topButtonHeight));
        this.seedText.setPosition(padding, padding + 70).setOrigin(0, 0.5);
        this.messageText.setPosition(padding, padding + 104).setOrigin(0, 0.5);
        if (isVertical) {
            const topRowY = padding + 34;
            const clusterScale = buttonScale * 0.7;
            const gap = Math.min(width * 0.24, 200);
            const centerX = width * 0.5;
            this.replayButton.setPosition(centerX - gap, topRowY).setScale(clusterScale);
            this.newSeedButton.setPosition(centerX, topRowY).setScale(clusterScale);
            this.newCompositionButton.setPosition(centerX + gap, topRowY).setScale(clusterScale);
            const sliderWidth = Math.min(width * 0.75, 340);
            this.noiseSlider.setPosition(width * 0.5, height - padding - rowGap * 2.9);
            this.noiseSlider.setTrackWidth(sliderWidth);
            this.colorSlider.setPosition(width * 0.5, height - padding - rowGap * 2.9 + 78);
            this.colorSlider.setTrackWidth(sliderWidth);
            const rowY = height - padding - rowGap * 0.65;
            const spacing = Math.min(160, width * 0.26);
            this.undoButton.setPosition(width * 0.5 - spacing * 1.05, rowY).setScale(buttonScale);
            this.redoButton.setPosition(width * 0.5 - spacing * 0.35, rowY).setScale(buttonScale);
            this.variationButton.setPosition(width * 0.5 + spacing * 0.35, rowY).setScale(buttonScale);
            this.patternShiftButton.setPosition(width * 0.5 + spacing * 1.05, rowY).setScale(buttonScale);
            this.symmetryButton.setPosition(width * 0.5, rowY - rowGap * 0.55).setScale(buttonScale * 0.92);
            this.boundaryButton.setPosition(width * 0.5, rowY - rowGap * 0.25).setScale(buttonScale * 0.86);
        }
        else {
            this.replayButton.setPosition(width * 0.36, padding + 26);
            this.newSeedButton.setPosition(width * 0.5, padding + 26);
            this.newCompositionButton.setPosition(width * 0.64, padding + 26);
            const sliderWidth = Math.min(width * 0.22, 260);
            this.noiseSlider.setPosition(width * 0.24, height - padding - rowGap * 0.6);
            this.noiseSlider.setTrackWidth(sliderWidth);
            this.colorSlider.setPosition(width * 0.48, height - padding - rowGap * 0.6);
            this.colorSlider.setTrackWidth(sliderWidth);
            const rowY = height - padding - rowGap * 0.1;
            const spacing = Math.min(160, width * 0.12);
            this.undoButton.setPosition(width * 0.66, rowY).setScale(buttonScale);
            this.redoButton.setPosition(width * 0.66 + spacing, rowY).setScale(buttonScale);
            this.variationButton.setPosition(width * 0.66 + spacing * 2, rowY).setScale(buttonScale);
            this.patternShiftButton.setPosition(width * 0.66 + spacing * 3, rowY).setScale(buttonScale);
            this.symmetryButton.setPosition(width * 0.24, height - padding - rowGap * 1.1).setScale(buttonScale * 0.92);
            this.boundaryButton.setPosition(width * 0.48, height - padding - rowGap * 1.1).setScale(buttonScale * 0.86);
        }
    }
    cycleSymmetry() {
        const currentIndex = SYMMETRY_ORDER.indexOf(this.currentSymmetry);
        const next = SYMMETRY_ORDER[(currentIndex + 1) % SYMMETRY_ORDER.length];
        this.setSymmetry(next);
        this.callbacks.onSymmetryChange(next);
    }
    cycleBoundary() {
        const currentIndex = BOUNDARY_ORDER.indexOf(this.currentBoundary);
        const next = BOUNDARY_ORDER[(currentIndex + 1) % BOUNDARY_ORDER.length];
        this.setBoundary(next);
        this.callbacks.onBoundariesToggle(next);
    }
}
